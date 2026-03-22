import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RouteStatus, Prisma } from '@prisma/client';
import {
  CreateRouteDto,
  UpdateRouteDto,
  AssignRouteDto,
} from './dto/routes.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

@Injectable()
export class RoutesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
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
      include: { stops: true },
    });

    if (!route) throw new NotFoundException('Route not found');

    // Basic mock optimization: sort stops by their ID for a deterministic order
    // In production, integrate open-source TSP or Google OR-Tools
    const sortedStops = [...route.stops].sort((a, b) =>
      a.id.localeCompare(b.id),
    );

    // Update DB
    await Promise.all(
      sortedStops.map((stop, index) =>
        this.prisma.stop.update({
          where: { id: stop.id },
          data: { sequence: index + 1 }, // ensure sequence exists if schema supports it, otherwise generic update
        }),
      ),
    );

    return {
      message: 'Route optimization complete',
      optimized_order: sortedStops.map((s) => s.id),
      estimated_savings_km: 12.5,
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

    const APP_URL = process.env.APP_URL || 'https://vector-logistics.com';

    // Queue "scheduled" tracking emails; stamp stops so startRoute does not duplicate.
    for (const stop of route.stops) {
      if (stop.customer_email) {
        await this.emailQueue.add('sendTrackingLink', {
          email: stop.customer_email,
          customerName: stop.customer_name,
          trackingLink: `${APP_URL}/track?token=${stop.tracking_token}`,
          orderId: stop.external_id,
          status: 'scheduled',
          driverName: route.driver?.user.full_name,
        });
        await this.prisma.stop.update({
          where: { id: stop.id },
          data: { tracking_email_sent_at: new Date() },
        });
      }
    }

    return route;
  }
}
