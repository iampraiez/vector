import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
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
  ExportHistoryDto,
} from './dto/driver.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { Route, Stop } from '@prisma/client';

interface AdHocStopInput {
  customerName?: string;
  address: string;
  packages?: number;
}

type AssignmentItem = (Route & { type: 'route' }) | (Stop & { type: 'stop' });

@Injectable()
export class DriverService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private mailService: MailService,
    @InjectQueue('account') private accountQueue: Queue,
  ) {}

  private async getDriverOrThrow(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { user_id: userId },
      include: { user: true, company: true },
    });
    if (!driver) throw new NotFoundException('Driver profile not found.');
    return driver;
  }

  async getHomeSummary(userId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const today = new Date().toISOString().split('T')[0];

    const [todayRoutes, completedToday, driverData, activeRoute] =
      await Promise.all([
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
        this.prisma.route.findFirst({
          where: {
            driver_id: driver.id,
            status: 'active',
          },
          orderBy: { updated_at: 'desc' },
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
      active_route_name: activeRoute?.name || null,
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

  async getAssignments(userId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch all routes for this driver (Active + Today + Future)
    const routes = await this.prisma.route.findMany({
      where: {
        driver_id: driver.id,
        OR: [{ status: 'active' }, { date: today }, { date: { gt: today } }],
      },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
      },
      orderBy: { date: 'asc' },
    });

    // 2. Fetch standalone stops (not in a route) for this driver
    const standaloneStops = await this.prisma.stop.findMany({
      where: {
        driver_id: driver.id,
        route_id: null,
        OR: [
          { status: 'in_progress' },
          { delivery_date: today },
          { delivery_date: { gt: today } },
        ],
      },
      orderBy: { created_at: 'asc' },
    });

    // 3. Categorize
    const active: AssignmentItem[] = [];
    const upcoming: AssignmentItem[] = [];
    const completed: AssignmentItem[] = [];

    // Process Routes
    routes.forEach((route) => {
      if (route.status === 'completed' || route.status === 'cancelled') {
        completed.push({ ...route, type: 'route' } as AssignmentItem);
      } else if (route.status === 'active' || route.date === today) {
        active.push({ ...route, type: 'route' } as AssignmentItem);
      } else {
        upcoming.push({ ...route, type: 'route' } as AssignmentItem);
      }
    });

    // Process Standalone Stops
    standaloneStops.forEach((stop) => {
      if (
        stop.status === 'completed' ||
        stop.status === 'failed' ||
        stop.status === 'returned'
      ) {
        completed.push({ ...stop, type: 'stop' } as AssignmentItem);
      } else if (
        stop.status === 'in_progress' ||
        stop.delivery_date === today
      ) {
        active.push({ ...stop, type: 'stop' } as AssignmentItem);
      } else {
        upcoming.push({ ...stop, type: 'stop' } as AssignmentItem);
      }
    });

    return {
      active,
      upcoming,
      completed,
    };
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

  async createAdHocRoute(
    userId: string,
    data: { name: string; stops: AdHocStopInput[] },
  ) {
    const driver = await this.getDriverOrThrow(userId);
    const today = new Date().toISOString().split('T')[0];

    const route = await this.prisma.route.create({
      data: {
        name: data.name,
        company_id: driver.company_id,
        driver_id: driver.id,
        date: today,
        status: 'draft',
        total_stops: data.stops.length,
        stops: {
          create: data.stops.map((s, idx) => ({
            company_id: driver.company_id,
            driver_id: driver.id,
            customer_name: s.customerName || 'Customer',
            address: s.address,
            packages: s.packages || 1,
            sequence: idx,
            status: 'assigned',
            delivery_date: today,
          })),
        },
      },
      include: { stops: true },
    });

    return route;
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

  async startStop(userId: string, stopId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, driver_id: driver.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');
    if (stop.status === 'completed')
      throw new ConflictException('Stop already completed');

    await this.prisma.$transaction([
      this.prisma.stop.update({
        where: { id: stopId },
        data: {
          status: 'pending',
          started_at: new Date(),
        } as unknown as Prisma.StopUpdateInput,
      }),
      this.prisma.driver.update({
        where: { id: driver.id },
        data: { status: 'active', last_active_at: new Date() },
      }),
    ]);

    return { message: 'Stop started successfully' };
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

    if (stop.route_id) {
      await this.checkAndUpdateRouteStatus(stop.route_id);
    }

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

    if (stop.route_id) {
      await this.checkAndUpdateRouteStatus(stop.route_id);
    }

    return { message: 'Delivery marked as failed' };
  }

  private async checkAndUpdateRouteStatus(routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { stops: true },
    });

    if (
      !route ||
      route.status === 'completed' ||
      route.status === 'cancelled'
    ) {
      return;
    }

    const allFinished = route.stops.every((s) =>
      ['completed', 'failed', 'returned'].includes(s.status),
    );

    if (allFinished) {
      await this.prisma.route.update({
        where: { id: routeId },
        data: { status: 'completed', completed_at: new Date() },
      });
    }
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
      vehicle_make: driver.vehicle_make,
      vehicle_model: driver.vehicle_model,
      vehicle_color: driver.vehicle_color,
      license_number: driver.license_number,
      rating: driver.avg_rating,
      deliveries: driver.total_deliveries,
      joined_at: driver.created_at,
      fleet_name: driver.company.name,
      fleet_code: driver.company.company_code,
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

  async requestSettingsOtp(userId: string, dto: { action: string }) {
    const driver = await this.getDriverOrThrow(userId);
    const action = dto.action;
    if (!['delete_account', 'clear_data', 'leave_fleet'].includes(action)) {
      throw new BadRequestException('Invalid action');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp:driver:${userId}:${action}`;
    await this.redis.set(redisKey, otp, 300);

    const email = driver.user.email;
    const content = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Security Verification Code</h2>
        <p>You requested to ${action.replace('_', ' ')}. Please use this code to confirm your request.</p>
        <h1 style="background: #f0fdf4; padding: 20px; text-align: center; color: #065f46; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      </div>
    `;

    await this.mailService.sendMail(
      email,
      'Vector Settings Verification Code',
      content,
      `Your code is ${otp}`,
    );

    return { message: 'OTP sent' };
  }

  async verifySettingsOtp(
    userId: string,
    dto: { action: string; otp: string },
  ) {
    const driver = await this.getDriverOrThrow(userId);
    const { action, otp } = dto;
    const redisKey = `otp:driver:${userId}:${action}`;

    const storedOtp = await this.redis.get(redisKey);
    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.redis.del(redisKey);

    if (action === 'leave_fleet') {
      return this.leaveCompany(userId);
    }

    const company = await this.prisma.company.findUnique({
      where: { id: driver.company_id },
    });

    if (action === 'clear_data') {
      await this.accountQueue.add('clearDataReport', {
        companyId: driver.company_id,
        email: company?.contact_email || 'admin@example.com',
        targetRole: 'driver',
        targetId: driver.id,
      });
      return {
        message:
          'Data clearance scheduled and report will be sent to your fleet manager',
      };
    }

    if (action === 'delete_account') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email_verified: false },
      });
      await this.prisma.driver.update({
        where: { id: driver.id },
        data: { status: 'suspended' },
      });

      const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
      await this.accountQueue.add(
        'deleteAccount',
        { userId },
        { delay: tenDaysMs },
      );

      return { message: 'Account scheduled for deletion in 10 days' };
    }
  }

  async exportHistory(userId: string, dto: ExportHistoryDto) {
    const driver = await this.getDriverOrThrow(userId);
    await this.accountQueue.add('exportHistory', {
      userId,
      driverId: driver.id,
      email: driver.user.email,
      range: dto.range,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return {
      message:
        'Your history report is being generated and will be emailed to you shortly.',
    };
  }

  async leaveCompany(userId: string) {
    const driver = await this.getDriverOrThrow(userId);

    // We don't delete the driver record to preserve history,
    // but we could mark them as inactive or remove the company association
    // if the business logic allows.
    // For "Vector", we'll set their status to suspended/offline and null their company_id if possible,
    // or just mark them as 'idle' and removed from active roster.

    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        status: 'offline',
        // In this schema company_id is required, so "leaving" might mean
        // deactivating the driver profile or moving to a 'System' company.
        // For now, let's just mark status.
      },
    });

    return { message: 'Successfully left the fleet' };
  }
}
