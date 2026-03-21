import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Stop } from '@prisma/client';

type StopWithRelations = Prisma.StopGetPayload<{
  include: {
    driver: {
      include: { user: { select: { full_name: true; phone: true } } };
    };
    company: {
      select: { name: true; contact_email: true; phone: true };
    };
    route: {
      select: { id: true; assigned_at: true; started_at: true };
    };
  };
}>;

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getTrackingData(token: string) {
    if (!token) throw new NotFoundException('Tracking token is required');

    const result = await this.prisma.stop.findUnique({
      where: { tracking_token: token },
      include: {
        driver: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        company: {
          select: { name: true, contact_email: true, phone: true },
        },
        route: {
          select: { id: true, assigned_at: true, started_at: true },
        },
      },
    });

    if (!result) throw new NotFoundException('Invalid tracking link');

    const primaryStop = result as StopWithRelations;

    // Grouping: Find other stops on the same route with the same email
    const allStops: Stop[] = [primaryStop as unknown as Stop];
    if (primaryStop.customer_email && primaryStop.route_id) {
      const others = await this.prisma.stop.findMany({
        where: {
          route_id: primaryStop.route_id,
          customer_email: primaryStop.customer_email,
          id: { not: primaryStop.id },
        },
      });
      allStops.push(...others);
    }

    const stopData = primaryStop as unknown as Stop & {
      driver: {
        id: string;
        user: { full_name: string; phone: string };
        avg_rating: number;
        total_deliveries: number;
        vehicle_color: string | null;
        vehicle_make: string | null;
        vehicle_model: string | null;
        vehicle_plate: string | null;
        current_lat: number | null;
        current_lng: number | null;
      } | null;
      company: { name: string; contact_email: string; phone: string };
      route: { id: string; assigned_at: Date; started_at: Date } | null;
      tracking_token: string;
      location_confirmed: boolean;
    };

    return {
      trackingToken: stopData.tracking_token,
      status: stopData.status,
      locationConfirmed: stopData.location_confirmed,
      address: stopData.address,
      customerName: stopData.customer_name,
      stops: allStops.map((s) => ({
        id: s.id,
        externalId: s.external_id,
        status: s.status,
        packages: s.packages,
        notes: s.notes,
      })),
      estimatedTime:
        stopData.time_window_start && stopData.time_window_end
          ? `${stopData.time_window_start} - ${stopData.time_window_end}`
          : 'Not specified',
      arrivedAt: stopData.arrived_at,
      completedAt: stopData.completed_at,
      company: {
        name: stopData.company.name,
        email: stopData.company.contact_email || 'support@vector.com',
        phone: stopData.company.phone || '+2348000000000',
      },
      driver: stopData.driver
        ? {
            id: stopData.driver.id,
            name: stopData.driver.user.full_name,
            phone: stopData.driver.user.phone,
            rating: stopData.driver.avg_rating,
            deliveries: stopData.driver.total_deliveries,
            vehicle:
              `${stopData.driver.vehicle_color || ''} ${stopData.driver.vehicle_make || ''} ${stopData.driver.vehicle_model || ''} (${stopData.driver.vehicle_plate || ''})`.trim() ||
              'Not specified',
          }
        : null,
      liveLocation: stopData.driver?.current_lat
        ? {
            lat: stopData.driver.current_lat,
            lng: stopData.driver.current_lng || 0,
          }
        : null,
      timeline: {
        created_at: stopData.created_at,
        assigned_at: stopData.route?.assigned_at || null,
        started_at: stopData.started_at || stopData.route?.started_at || null,
        arrived_at: stopData.arrived_at,
        completed_at: stopData.completed_at,
      },
    };
  }

  async confirmLocation(token: string, lat: number, lng: number) {
    const stop = await this.prisma.stop.findUnique({
      where: { tracking_token: token },
    });

    if (!stop) throw new NotFoundException('Tracking token not found');

    await this.prisma.stop.updateMany({
      where: {
        route_id: stop.route_id,
        customer_email: stop.customer_email,
      },
      data: {
        lat,
        lng,
        location_confirmed: true,
      },
    });

    return { message: 'Location confirmed successfully', lat, lng };
  }

  async rateDelivery(token: string, dto: { rating: number; comment?: string }) {
    const stop = await this.prisma.stop.findUnique({
      where: { tracking_token: token, status: 'completed' },
    });

    if (!stop) {
      throw new NotFoundException('Delivery cannot be rated');
    }

    await this.prisma.stop.update({
      where: { id: stop.id },
      data: {
        customer_rating: dto.rating,
        customer_rating_comment: dto.comment,
        customer_rated_at: new Date(),
      },
    });

    return { message: 'Thank you for your feedback!' };
  }
}
