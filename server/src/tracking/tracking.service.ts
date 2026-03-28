import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Stop } from '@prisma/client';
import { MapService } from '../map/map.service';
import { NotificationsService } from '../notifications/notifications.service';

type StopWithRelations = Prisma.StopGetPayload<{
  include: {
    driver: {
      include: { user: { select: { full_name: true } } };
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
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private prisma: PrismaService,
    private mapService: MapService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getTrackingData(token: string) {
    if (!token) throw new NotFoundException('Tracking token is required');

    const result = await this.prisma.stop.findUnique({
      where: { tracking_token: token },
      include: {
        driver: {
          include: { user: { select: { full_name: true } } },
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
        user: { full_name: string };
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
      route: {
        id: string;
        assigned_at: Date | null;
        started_at: Date | null;
      } | null;
      tracking_token: string;
      location_confirmed: boolean;
      assigned_at: Date | null;
      status: string;
      customer_name: string;
      address: string;
      time_window_start: string | null;
      time_window_end: string | null;
      arrived_at: Date | null;
      completed_at: Date | null;
      created_at: Date;
    };

    let displayStatus: string = stopData.status;
    if (displayStatus === 'pending' && stopData.started_at) {
      displayStatus = 'out_for_delivery';
    } else if (displayStatus === 'in_progress') {
      displayStatus = 'out_for_delivery';
    } else if (displayStatus === 'completed') {
      displayStatus = 'delivered';
    } else if (displayStatus === 'returned' || displayStatus === 'failed') {
      displayStatus = 'failed';
    }

    return {
      trackingToken: stopData.tracking_token,
      status: displayStatus,
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
        email: stopData.company.contact_email,
        phone: stopData.company.phone,
      },
      driver: stopData.driver
        ? {
            id: stopData.driver.id,
            name: stopData.driver.user.full_name,
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
        assigned_at:
          stopData.assigned_at || stopData.route?.assigned_at || null,
        started_at: stopData.started_at || stopData.route?.started_at || null,
        arrived_at: stopData.arrived_at,
        completed_at: stopData.completed_at,
      },
      hasRated: !!stopData.customer_rated_at,
    };
  }

  async confirmLocation(token: string, lat: number, lng: number) {
    const stop = await this.prisma.stop.findUnique({
      where: { tracking_token: token },
    });

    if (!stop) throw new NotFoundException('Tracking token not found');

    let formattedAddress = stop.address;
    try {
      const geoResult = await this.mapService.reverseGeocode({ lat, lng });
      formattedAddress = geoResult.formattedAddress;
      this.logger.log(
        `Reverse geocoded ${lat}, ${lng} to: ${formattedAddress}`,
      );
    } catch (err) {
      this.logger.warn(
        `Failed to reverse geocode ${lat}, ${lng}, keeping original address.`,
        err,
      );
    }

    // Update the specific stop first to ensure it's saved correctly
    await this.prisma.stop.update({
      where: { id: stop.id },
      data: {
        lat: Number(lat),
        lng: Number(lng),
        address: formattedAddress,
        location_confirmed: true,
      },
    });

    // Update related stops on the same route for the same customer (e.g., grouped orders)
    if (stop.route_id && stop.customer_email) {
      await this.prisma.stop.updateMany({
        where: {
          route_id: stop.route_id,
          customer_email: stop.customer_email,
          id: { not: stop.id },
        },
        data: {
          lat: Number(lat),
          lng: Number(lng),
          address: formattedAddress,
          location_confirmed: true,
        },
      });
    }

    this.logger.log(
      `[Tracking] Location confirmed for stop ${stop.id}: ${lat}, ${lng} -> ${formattedAddress}`,
    );
    return {
      message: 'Location confirmed successfully',
      lat,
      lng,
      address: formattedAddress,
    };
  }

  async rateDelivery(token: string, dto: { rating: number; comment?: string }) {
    const stop = await this.prisma.stop.findUnique({
      where: { tracking_token: token, status: 'completed' },
      include: {
        driver: { select: { user_id: true } },
      },
    });

    if (!stop) {
      throw new NotFoundException('Delivery cannot be rated');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Update the stop with the rating
      await tx.stop.update({
        where: { id: stop.id },
        data: {
          customer_rating: dto.rating,
          customer_rating_comment: dto.comment,
          customer_rated_at: new Date(),
        },
      });

      // 2. Create a persistent DeliveryRating record
      await tx.deliveryRating.create({
        data: {
          stop_id: stop.id,
          driver_id: stop.driver_id!,
          company_id: stop.company_id,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // 3. Update the Driver's aggregate rating stats
      const driver = await tx.driver.findUnique({
        where: { id: stop.driver_id! },
        select: { avg_rating: true, rating_count: true },
      });

      if (driver) {
        const newCount = driver.rating_count + 1;
        const newAvg =
          (driver.avg_rating * driver.rating_count + dto.rating) / newCount;

        await tx.driver.update({
          where: { id: stop.driver_id! },
          data: {
            avg_rating: parseFloat(newAvg.toFixed(2)),
            rating_count: newCount,
          },
        });
      }
    });

    if (stop.driver?.user_id) {
      await this.notificationsService.create({
        userId: stop.driver.user_id,
        companyId: stop.company_id,
        type: 'rating_received',
        title: 'New rating',
        body: `You received a ${dto.rating}/5 rating.`,
      });
    }

    return { message: 'Thank you for your feedback!' };
  }
}
