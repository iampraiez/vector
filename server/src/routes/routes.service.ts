import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RouteStatus, Prisma } from '@prisma/client';
import { MapService } from '../map/map.service';
import {
  CreateRouteDto,
  UpdateRouteDto,
  AssignRouteDto,
} from './dto/routes.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { STANDARD_QUEUE_OPTIONS } from '../queue/bull-job-options';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RoutesService {
  constructor(
    private prisma: PrismaService,
    private readonly mapService: MapService,
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    private readonly notificationsService: NotificationsService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoutes(_companyId: string, _query: unknown) {
    return this.prisma.route.findMany({
      where: { company_id: _companyId },
      include: { driver: { include: { user: true } } },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  async createRoute(companyId: string, dto: CreateRouteDto) {
    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          company_id: companyId,
          name: dto.name,
          driver_id: dto.driver_id,
          status: 'draft',
          date: dto.date ? dto.date : new Date().toISOString(),
        },
      });

      if (dto.stops && dto.stops.length > 0) {
        for (const stop of dto.stops) {
          await tx.stop.update({
            where: { id: stop.stop_id, company_id: companyId },
            data: {
              route_id: route.id,
              status: 'assigned',
              assigned_at: new Date(),
            },
          });
        }
      }

      return route;
    });
  }

  async getRoute(companyId: string, routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId, company_id: companyId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        driver: { include: { user: true } },
      },
    });

    if (!route) throw new NotFoundException('Route not found');
    return { route };
  }

  async updateRoute(companyId: string, routeId: string, dto: UpdateRouteDto) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId, company_id: companyId },
    });
    if (!route) throw new NotFoundException('Route not found');

    const updateData: Prisma.RouteUncheckedUpdateInput = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.status) updateData.status = dto.status;
    if (dto.driver_id !== undefined) updateData.driver_id = dto.driver_id;
    if (dto.date) updateData.date = dto.date;

    return this.prisma.$transaction(async (tx) => {
      const updatedRoute = await tx.route.update({
        where: { id: routeId },
        data: updateData,
      });

      if (dto.stops) {
        // Unassign existing
        await tx.stop.updateMany({
          where: { route_id: routeId },
          data: { route_id: null, status: 'unassigned' },
        });
        // Assign new
        for (const stop of dto.stops) {
          await tx.stop.update({
            where: { id: stop.stop_id, company_id: companyId },
            data: {
              route_id: routeId,
              status: 'assigned',
              assigned_at: new Date(),
            },
          });
        }
      }
      return updatedRoute;
    });
  }

  async deleteRoute(companyId: string, routeId: string) {
    await this.prisma.route.delete({
      where: { id: routeId, company_id: companyId },
    });
  }

  async optimizeRoute(companyId: string, routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId, company_id: companyId },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });

    if (!route) throw new NotFoundException('Route not found');

    const stops = route.stops;
    if (stops.length === 0) {
      const unchanged = await this.prisma.route.findUnique({
        where: { id: routeId, company_id: companyId },
        include: {
          stops: { orderBy: { sequence: 'asc' } },
          driver: { include: { user: true } },
        },
      });
      return {
        message: 'No stops on this route.',
        route: unchanged!,
      };
    }

    const missingCoords = stops.filter((s) => s.lat == null || s.lng == null);
    if (missingCoords.length > 0) {
      throw new BadRequestException(
        'All stops must have coordinates before optimization. Update addresses or geocode first.',
      );
    }

    const latSum = stops.reduce((acc, s) => acc + Number(s.lat), 0);
    const lngSum = stops.reduce((acc, s) => acc + Number(s.lng), 0);
    const agentWaypoint = {
      lat: latSum / stops.length,
      lng: lngSum / stops.length,
    };

    const optimizedIds = await this.mapService.optimizeRoute(
      agentWaypoint,
      stops.map((s) => ({
        id: s.id,
        lat: Number(s.lat),
        lng: Number(s.lng),
      })),
    );

    const stopById = new Map(stops.map((s) => [s.id, s]));
    const seen = new Set<string>();
    const orderedIds: string[] = [];
    for (const id of optimizedIds) {
      if (stopById.has(id) && !seen.has(id)) {
        orderedIds.push(id);
        seen.add(id);
      }
    }
    for (const s of stops) {
      if (!seen.has(s.id)) orderedIds.push(s.id);
    }

    const pathWaypoints = [
      agentWaypoint,
      ...orderedIds.map((id) => {
        const s = stopById.get(id)!;
        return { lat: Number(s.lat), lng: Number(s.lng) };
      }),
    ];

    const directions = await this.mapService.getDirections({
      waypoints: pathWaypoints,
    });

    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        orderedIds.map((stopId, index) =>
          tx.stop.update({
            where: { id: stopId, route_id: routeId },
            data: { sequence: index + 1 },
          }),
        ),
      );
      await tx.route.update({
        where: { id: routeId },
        data: {
          total_distance_km: directions.distanceKm,
          estimated_duration_min: directions.durationMin,
        },
      });
    });

    const updated = await this.prisma.route.findUnique({
      where: { id: routeId, company_id: companyId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        driver: { include: { user: true } },
      },
    });

    return {
      message: 'Route optimization complete',
      route: updated!,
      optimized_order: orderedIds,
      total_distance_km: directions.distanceKm,
      estimated_duration_min: directions.durationMin,
    };
  }

  async assignRoute(companyId: string, routeId: string, dto: AssignRouteDto) {
    const route = await this.prisma.route.update({
      where: { id: routeId, company_id: companyId },
      data: {
        driver_id: dto.driver_id,
        status: RouteStatus.scheduled,
        assigned_at: new Date(),
      },
      include: {
        driver: { include: { user: true } },
        stops: true,
      },
    });

    const appUrl = this.configService.getOrThrow<string>('APP_URL');

    // Queue "scheduled" tracking emails; stamp stops so startRoute does not duplicate.
    for (const stop of route.stops) {
      if (stop.customer_email) {
        await this.emailQueue.add(
          'sendTrackingLink',
          {
            email: stop.customer_email,
            customerName: stop.customer_name,
            trackingLink: `${appUrl}/track?token=${stop.tracking_token}`,
            orderId: stop.external_id,
            status: 'scheduled',
            driverName: route.driver?.user.full_name,
          },
          STANDARD_QUEUE_OPTIONS,
        );
        await this.prisma.stop.update({
          where: { id: stop.id },
          data: { tracking_email_sent_at: new Date() },
        });
      }
    }

    if (route.driver?.user_id) {
      await this.notificationsService.create({
        userId: route.driver.user_id,
        companyId: route.company_id,
        type: 'new_assignment',
        title: 'New Route Assigned',
        body: `Route "${route.name}" has been assigned to you.`,
      });
    }

    return route;
  }
}
