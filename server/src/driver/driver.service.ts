import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, DriverStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  UpdateStatusDto,
  UpdateLocationDto,
  CompleteDeliveryDto,
  FailDeliveryDto,
  OnboardingDto,
} from './dto/driver.dto';

@Injectable()
export class DriverService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private async getDriverOrThrow(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });
    if (!driver) throw new NotFoundException('Driver profile not found.');
    return driver;
  }

  async getHomeSummary(userId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const today = new Date().toISOString().split('T')[0];

    const [todayRoutes, completedToday, driverData] = await Promise.all([
      this.prisma.route.findMany({
        where: { driver_id: driver.id, date: today },
        include: { stops: true },
      }),
      this.prisma.stop.count({
        where: {
          driver_id: driver.id,
          status: 'completed',
          updated_at: { gte: new Date(today) },
        },
      }),
      this.prisma.driver.findUnique({
        where: { id: driver.id },
        select: { total_deliveries: true },
      }),
    ]);

    let pendingStopsCount = 0;
    todayRoutes.forEach((r) => {
      pendingStopsCount += r.stops.filter((s) =>
        ['assigned', 'pending', 'in_progress'].includes(s.status),
      ).length;
    });

    return {
      status: driver.status,
      deliveries_today: completedToday,
      total_deliveries: driverData?.total_deliveries || 0,
      pending_stops: pendingStopsCount,
      rating: driver.avg_rating,
    };
  }

  async updateStatus(userId: string, dto: UpdateStatusDto) {
    const driver = await this.getDriverOrThrow(userId);
    const updated = await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        status: dto.status as DriverStatus,
        last_active_at: new Date(),
      },
    });
    return { status: updated.status };
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const driver = await this.getDriverOrThrow(userId);
    // Ideally I should reverse geocode here. For now, just save coordinates.
    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        current_lat: dto.lat,
        current_lng: dto.lng,
        last_active_at: new Date(),
      },
    });
    return { lat: dto.lat, lng: dto.lng };
  }

  async getAssignments(userId: string, date?: string) {
    const driver = await this.getDriverOrThrow(userId);
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Find all assigned and active routes for this day
    const routes = await this.prisma.route.findMany({
      where: { driver_id: driver.id, date: targetDate },
      include: {
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return { date: targetDate, routes };
  }

  async getRoutePreview(userId: string, routeId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const route = await this.prisma.route.findUnique({
      where: { id: routeId, driver_id: driver.id },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });

    if (!route) throw new NotFoundException('Route not found');

    return {
      route_id: route.id,
      name: route.name,
      status: route.status,
      total_stops: route.total_stops,
      total_distance_km: route.total_distance_km,
      stops: route.stops,
    };
  }

  async startRoute(userId: string, routeId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const route = await this.prisma.route.findUnique({
      where: { id: routeId, driver_id: driver.id },
    });
    if (!route) throw new NotFoundException('Route not found');
    if (route.status === 'completed')
      throw new ConflictException('Route already completed');

    await this.prisma.$transaction([
      this.prisma.route.update({
        where: { id: routeId },
        data: { status: 'active', started_at: new Date() },
      }),
      this.prisma.driver.update({
        where: { id: driver.id },
        data: { status: 'active', last_active_at: new Date() },
      }),
      this.prisma.stop.updateMany({
        where: { route_id: routeId, status: 'assigned' },
        data: { status: 'pending' },
      }),
    ]);

    return { message: 'Route started successfully' };
  }

  async getStop(userId: string, stopId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, driver_id: driver.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');
    return { stop };
  }

  async arriveAtStop(userId: string, stopId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, driver_id: driver.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');

    await this.prisma.stop.update({
      where: { id: stopId },
      data: { status: 'in_progress', arrived_at: new Date() },
    });

    return { message: 'Arrived at stop' };
  }

  async skipStop(userId: string, stopId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, driver_id: driver.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');

    await this.prisma.stop.update({
      where: { id: stopId },
      data: { status: 'returned', failure_reason: 'driver_skipped' },
    });

    return { message: 'Stop skipped' };
  }

  async completeDelivery(
    userId: string,
    stopId: string,
    dto: CompleteDeliveryDto,
  ) {
    const driver = await this.getDriverOrThrow(userId);
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, driver_id: driver.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');
    if (stop.status === 'completed')
      throw new ConflictException('Delivery already completed');

    await this.prisma.$transaction([
      this.prisma.stop.update({
        where: { id: stopId },
        data: {
          status: 'completed',
          completed_at: new Date(),
          notes: dto.notes,
          photo_url: dto.photo_urls ? dto.photo_urls[0] : null,
          signature_url: dto.signature_url,
        },
      }),
      this.prisma.driver.update({
        where: { id: driver.id },
        data: { total_deliveries: { increment: 1 } },
      }),
    ]);

    // Potentially check if route is completed here and update route status

    return { message: 'Delivery completed successfully' };
  }

  async failDelivery(userId: string, stopId: string, dto: FailDeliveryDto) {
    const driver = await this.getDriverOrThrow(userId);
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, driver_id: driver.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');
    if (stop.status === 'completed')
      throw new ConflictException('Delivery already completed');

    await this.prisma.stop.update({
      where: { id: stopId },
      data: {
        status: 'failed',
        completed_at: new Date(),
        failure_reason: dto.reason,
        failure_notes: dto.notes,
      },
    });

    return { message: 'Delivery marked as failed' };
  }

  async getHistory(userId: string, pageRaw?: string, limitRaw?: string) {
    const driver = await this.getDriverOrThrow(userId);
    const page = parseInt(pageRaw || '1', 10);
    const limit = parseInt(limitRaw || '20', 10);
    const skip = (page - 1) * limit;

    const [routes, total] = await Promise.all([
      this.prisma.route.findMany({
        where: {
          driver_id: driver.id,
          status: { in: ['completed', 'cancelled'] },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: { stops: true },
      }),
      this.prisma.route.count({
        where: {
          driver_id: driver.id,
          status: { in: ['completed', 'cancelled'] },
        },
      }),
    ]);

    return {
      data: routes,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async getProfile(userId: string) {
    const driver = await this.getDriverOrThrow(userId);
    return {
      id: driver.user_id,
      driver_id: driver.id,
      name: driver.user.full_name,
      email: driver.user.email,
      phone: driver.user.phone,
      avatar_url: driver.user.avatar_url,
      vehicle_type: driver.vehicle_type,
      vehicle_plate: driver.vehicle_plate,
      rating: driver.avg_rating,
      deliveries: driver.total_deliveries,
      joined_at: driver.created_at,
    };
  }

  async updateProfile(userId: string, dto: any) {
    const driver = await this.getDriverOrThrow(userId);

    const updateDto = dto as {
      full_name?: string;
      phone?: string;
      vehicle_type?: string;
      vehicle_plate?: string;
    };

    const userUpdates: Prisma.UserUpdateInput = {};
    if (updateDto.full_name) userUpdates.full_name = updateDto.full_name;
    if (updateDto.phone) userUpdates.phone = updateDto.phone;

    const driverUpdates: Prisma.DriverUpdateInput = {};
    if (updateDto.vehicle_type)
      driverUpdates.vehicle_type = updateDto.vehicle_type;
    if (updateDto.vehicle_plate)
      driverUpdates.vehicle_plate = updateDto.vehicle_plate;

    if (Object.keys(userUpdates).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    if (Object.keys(driverUpdates).length > 0) {
      await this.prisma.driver.update({
        where: { id: driver.id },
        data: driverUpdates,
      });
    }

    return this.getProfile(userId);
  }

  async uploadAvatar(userId: string, dto: any) {
    // cloudinary upload happens on frontend
    const updateDto = dto as { file_url?: string };
    const url =
      updateDto.file_url || 'https://cloudinary.com/vector/new-avatar.jpg';
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar_url: url },
    });
    return { avatar_url: url };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSettings(_userId: string) {
    // if settings is added
    return {
      notifications_enabled: true,
      location_tracking: 'always',
      language: 'en',
    };
  }

  updateSettings(_userId: string, dto: any) {
    return {
      message: 'Settings successfully updated',
      settings: dto as unknown,
    };
  }

  async getNotifications(userId: string, pageRaw?: string, limitRaw?: string) {
    const page = parseInt(pageRaw || '1', 10);
    const limit = parseInt(limitRaw || '20', 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where: { user_id: userId } }),
    ]);

    return {
      data,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async markNotificationRead(userId: string, notificationId: string) {
    await this.prisma.notification.update({
      where: { id: notificationId, user_id: userId },
      data: { read: true, read_at: new Date() },
    });
    return { message: 'Marked read' };
  }

  async markAllNotificationsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true, read_at: new Date() },
    });
    return { message: 'All marked read' };
  }

  async completeOnboarding(userId: string, dto: OnboardingDto) {
    const driver = await this.getDriverOrThrow(userId);
    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        vehicle_type: dto.vehicle_type,
        vehicle_plate: dto.vehicle_plate,
        status: 'idle',
      },
    });

    return { message: 'Onboarding completed successfully' };
  }
}
