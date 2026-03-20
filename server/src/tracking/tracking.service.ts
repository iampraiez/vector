import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getTrackingData(token: string) {
    if (!token) throw new NotFoundException('Tracking token is required');

    const stop = await this.prisma.stop.findFirst({
      where: { external_id: token },
      include: {
        driver: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        company: {
          select: { name: true, contact_email: true, phone: true },
        },
        route: {
          select: { assigned_at: true, started_at: true },
        },
      },
    });

    if (!stop) throw new NotFoundException('Invalid tracking link');

    return {
      trackingId: stop.external_id,
      status: stop.status,
      address: stop.address,
      customerName: stop.customer_name,
      packageCount: stop.packages,
      estimatedTime:
        stop.time_window_start && stop.time_window_end
          ? `${stop.time_window_start} - ${stop.time_window_end}`
          : 'Not specified',
      arrivedAt: stop.arrived_at,
      completedAt: stop.completed_at,
      company: {
        name: stop.company.name,
        email: stop.company.contact_email || 'support@vector.com',
        phone: stop.company.phone || '+2348000000000',
      },
      driver: stop.driver?.user
        ? {
            name: stop.driver.user.full_name,
            phone: stop.driver.user.phone,
            rating: stop.driver.avg_rating,
            deliveries: stop.driver.total_deliveries,
            vehicle:
              `${stop.driver.vehicle_color || ''} ${stop.driver.vehicle_make || ''} ${stop.driver.vehicle_model || ''} (${stop.driver.vehicle_plate || ''})`.trim() ||
              'Not specified',
          }
        : null,
      liveLocation: stop.driver?.current_lat
        ? { lat: stop.driver.current_lat, lng: stop.driver.current_lng }
        : null,
      timeline: {
        created_at: stop.created_at,
        assigned_at: stop.route?.assigned_at || null,
        started_at: stop.started_at || stop.route?.started_at || null,
        arrived_at: stop.arrived_at,
        completed_at: stop.completed_at,
      },
    };
  }

  async rateDelivery(token: string, dto: { rating: number; comment?: string }) {
    const stop = await this.prisma.stop.findFirst({
      where: { external_id: token, status: 'completed' },
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
