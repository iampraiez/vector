import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, DriverStatus, StopPriority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { settingsOtpTemplate } from '../common/template';
import {
  OnboardingDto,
  ExportHistoryDto,
  OptimizeRouteDto,
  CreateOptimizedRouteDto,
  CreateAdHocRouteDto,
  CompleteDeliveryDto,
  FailDeliveryDto,
  UpdateStatusDto,
  UpdateLocationDto,
} from './dto/driver.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { Route, Stop } from '@prisma/client';
import { MapService } from '../map/map.service';

type AssignmentItem = (Route & { type: 'route' }) | (Stop & { type: 'stop' });

@Injectable()
export class DriverService {
  private readonly logger = new Logger(DriverService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private mailService: MailService,
    private mapService: MapService,
    @InjectQueue('account') private readonly accountQueue: Queue,
    @InjectQueue('email') private readonly emailQueue: Queue,
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

    const [completedToday, driverData, activeRoute] = await Promise.all([
      // this.prisma.route.findMany({
      //   where: { driver_id: driver.id, date: today },
      //   include: { stops: true },
      // }),
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

    const pendingStopsCount = await this.prisma.stop.count({
      where: {
        driver_id: driver.id,
        status: { in: ['assigned', 'pending', 'in_progress'] },
      },
    });

    return {
      status: driver.status,
      deliveries_today: completedToday,
      total_deliveries: driverData?.total_deliveries || 0,
      pending_stops: pendingStopsCount,
      active_route_name: activeRoute?.name || null,
      active_route_id: activeRoute?.id || null,
      rating: driver.avg_rating,
      last_active_at: driver.last_active_at,
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

    // --- Geofencing: Auto-arrive at pending stops ---
    if (dto.lat != null && dto.lng != null) {
      const pendingStops = await this.prisma.stop.findMany({
        where: {
          driver_id: driver.id,
          status: 'pending',
          lat: { not: null },
          lng: { not: null },
        },
      });

      for (const stop of pendingStops) {
        if (stop.lat && stop.lng) {
          const distance = this.calculateDistance(
            dto.lat,
            dto.lng,
            stop.lat,
            stop.lng,
          );
          if (distance <= 200) {
            try {
              await this.arriveAtStop(userId, stop.id);
              this.logger.log(
                `Auto-arrived driver ${driver.id} at stop ${stop.id} (Distance: ${Math.round(distance)}m)`,
              );
            } catch (err) {
              this.logger.error(`Failed to auto-arrive stop ${stop.id}:`, err);
            }
          }
        }
      }
    }

    return { lat: dto.lat, lng: dto.lng };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // metres
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async getAssignments(userId: string) {
    const driver = await this.getDriverOrThrow(userId);
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    // 1. Fetch all routes for this driver (Active + Today + Future)
    const routes = await this.prisma.route.findMany({
      where: {
        driver_id: driver.id,
        OR: [
          { status: 'active' },
          { date: today },
          { date: { gt: today } },
          {
            status: { in: ['completed', 'cancelled'] },
            updated_at: { gte: todayStart },
          },
        ],
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
          {
            status: { in: ['completed', 'failed', 'returned'] },
            updated_at: { gte: todayStart },
          },
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

    // Check for another active route
    const existingActive = await this.prisma.route.findFirst({
      where: { driver_id: driver.id, status: 'active', NOT: { id: routeId } },
    });
    if (existingActive) {
      throw new ConflictException(
        `You already have an active route: ${existingActive.name}. Please complete it first or pause it.`,
      );
    }

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

    // Queue tracking notifications for all stops in the route
    const stops = await this.prisma.stop.findMany({
      where: { route_id: routeId },
      include: { company: true },
    });

    const APP_URL = process.env.APP_URL || 'https://vector-logistics.com';

    for (const stop of stops) {
      if (stop.customer_email) {
        await this.emailQueue.add('sendTrackingLink', {
          email: stop.customer_email,
          customerName: stop.customer_name,
          trackingLink: `${APP_URL}/track?token=${stop.tracking_token}`,
          orderId: stop.external_id,
          status: 'active',
          driverName: driver.user.full_name,
        });
      }
    }

    return { message: 'Route started successfully' };
  }

  async createAdHocRoute(userId: string, dto: CreateAdHocRouteDto) {
    const driver = await this.getDriverOrThrow(userId);
    const today = new Date().toISOString().split('T')[0];

    // Daily limit check: 10 ad-hoc routes per day
    const count = await this.prisma.route.count({
      where: {
        driver_id: driver.id,
        created_by: userId,
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    if (count >= 10) {
      throw new BadRequestException('Daily limit of 10 ad-hoc routes reached.');
    }

    const route = await this.prisma.route.create({
      data: {
        name: dto.name,
        company_id: driver.company_id,
        driver_id: driver.id,
        date: today,
        status: 'draft',
        created_by: userId, // Indication that the driver created it
        total_stops: dto.stops.length,
        stops: {
          create: dto.stops.map((s, idx) => ({
            company_id: driver.company_id,
            driver_id: driver.id,
            customer_name: s.customerName || 'Customer',
            customer_email: s.customerEmail,
            customer_phone: s.customerPhone,
            address: s.address,
            packages: s.packages || 1,
            notes: s.notes,
            external_id: s.externalId,
            priority: (s.priority as StopPriority) || StopPriority.normal,
            sequence: idx,
            status: 'assigned',
            delivery_date: s.delivery_date || today,
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
          photo_url: dto.photo_urls?.[0] || null,
          signature_url: dto.signature_url || null,
        },
      }),
      this.prisma.driver.update({
        where: { id: driver.id },
        data: { total_deliveries: { increment: 1 } },
      }),
    ]);

    if (stop.route_id) {
      await this.checkAndUpdateRouteStatus(stop.route_id);
    } else {
      // Standalone stop: Check if driver should go back to idle
      await this.checkAndReturnToIdle(driver.id);
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
        failure_reason: dto.reason || 'unknown',
        failure_notes: dto.notes || null,
      },
    });

    if (stop.route_id) {
      await this.checkAndUpdateRouteStatus(stop.route_id);
    } else {
      // Standalone stop: Check if driver should go back to idle
      await this.checkAndReturnToIdle(driver.id);
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
      await this.prisma.$transaction(async (tx) => {
        await tx.route.update({
          where: { id: routeId },
          data: { status: 'completed', completed_at: new Date() },
        });

        // After finishing a route, check if driver is free
        const driverId = route.driver_id;
        if (driverId) {
          const stillBusy = await tx.stop.findFirst({
            where: {
              driver_id: driverId,
              status: { in: ['assigned', 'pending', 'in_progress'] },
              route_id: null, // Any other standalone tasks
            },
          });

          const activeRoutes = await tx.route.findFirst({
            where: {
              driver_id: driverId,
              status: 'active',
              NOT: { id: routeId },
            },
          });

          if (!stillBusy && !activeRoutes) {
            await tx.driver.update({
              where: { id: driverId },
              data: { status: 'idle' },
            });
          }
        }
      });
    }
  }

  private async checkAndReturnToIdle(driverId: string) {
    const [activeRoutes, activeStops] = await Promise.all([
      this.prisma.route.count({
        where: { driver_id: driverId, status: 'active' },
      }),
      this.prisma.stop.count({
        where: {
          driver_id: driverId,
          route_id: null,
          status: { in: ['assigned', 'pending', 'in_progress'] },
        },
      }),
    ]);

    if (activeRoutes === 0 && activeStops === 0) {
      await this.prisma.driver.update({
        where: { id: driverId },
        data: { status: 'idle' },
      });
    }
  }

  async convertStopsToRoute(
    userId: string,
    data: { stopIds: string[]; name: string },
  ) {
    const driver = await this.getDriverOrThrow(userId);
    const today = new Date().toISOString().split('T')[0];

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Route
      const route = await tx.route.create({
        data: {
          name: data.name,
          company_id: driver.company_id,
          driver_id: driver.id,
          date: today,
          status: 'draft',
          total_stops: data.stopIds.length,
        },
      });

      // 2. Update stops to link them to this route
      await Promise.all(
        data.stopIds.map((id, idx) =>
          tx.stop.update({
            where: { id, driver_id: driver.id },
            data: {
              route_id: route.id,
              sequence: idx,
              delivery_date: today,
            },
          }),
        ),
      );

      return route;
    });
  }

  async getHistory(userId: string, pageRaw?: string, limitRaw?: string) {
    const driver = await this.getDriverOrThrow(userId);
    const page = parseInt(pageRaw || '1', 10);
    const limit = parseInt(limitRaw || '20', 10);
    const skip = (page - 1) * limit;

    const [routes, standaloneStops, totalRoutes, totalStops] =
      await Promise.all([
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
        this.prisma.stop.findMany({
          where: {
            driver_id: driver.id,
            route_id: null,
            status: { in: ['completed', 'failed', 'returned'] },
          },
          orderBy: { completed_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.route.count({
          where: {
            driver_id: driver.id,
            status: { in: ['completed', 'cancelled'] },
          },
        }),
        this.prisma.stop.count({
          where: {
            driver_id: driver.id,
            route_id: null,
            status: { in: ['completed', 'failed', 'returned'] },
          },
        }),
      ]);

    // Combine and sort
    type HistoryItem =
      | (Prisma.RouteGetPayload<{ include: { stops: true } }> & {
          type: 'route';
        })
      | (Prisma.StopGetPayload<object> & { type: 'stop' });

    const combined: HistoryItem[] = [
      ...routes.map((r) => ({ ...r, type: 'route' as const })),
      ...standaloneStops.map((s) => ({ ...s, type: 'stop' as const })),
    ].sort((a, b) => {
      const dateA = new Date(
        a.type === 'route' ? a.date : (a.completed_at as Date),
      ).getTime();
      const dateB = new Date(
        b.type === 'route' ? b.date : (b.completed_at as Date),
      ).getTime();
      return dateB - dateA;
    });

    const total = totalRoutes + totalStops;

    return {
      data: combined.slice(0, limit),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
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
    await this.mailService.sendMail(
      email,
      'Vector Settings Verification Code',
      settingsOtpTemplate(action, otp),
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

  async optimizeAssignments(userId: string, dto: OptimizeRouteDto) {
    const driver = await this.getDriverOrThrow(userId);

    // 1. Fetch the stops to ensure they belong to this driver and are optimizable (pending or assigned)
    const stops = await this.prisma.stop.findMany({
      where: {
        id: { in: dto.stopIds },
        driver_id: driver.id,
        status: { in: ['pending', 'assigned'] },
      },
    });

    if (stops.length !== dto.stopIds.length) {
      throw new BadRequestException(
        'Some orders are invalid or already assigned.',
      );
    }

    // 2. Call MapService to get optimized sequence
    const optimizedIds = await this.mapService.optimizeRoute(
      { lat: dto.currentLat, lng: dto.currentLng },
      stops.map((s) => ({
        id: s.id,
        lat: Number(s.lat),
        lng: Number(s.lng),
      })),
    );

    // 3. Map back to stop objects
    const optimizedStops = optimizedIds.map((id) =>
      stops.find((s) => s.id === id),
    );

    // 4. Calculate total distance and duration for the preview
    const waypoints = [
      { lat: dto.currentLat, lng: dto.currentLng },
      ...optimizedStops.map((s) => ({
        lat: Number(s!.lat),
        lng: Number(s!.lng),
      })),
    ];

    const directions = await this.mapService.getDirections({ waypoints });

    return {
      stops: optimizedStops,
      distance: directions.distanceKm,
      duration: directions.durationMin,
      polyline: directions.polylinePoints,
    };
  }

  async createOptimizedRoute(userId: string, dto: CreateOptimizedRouteDto) {
    const driver = await this.getDriverOrThrow(userId);

    // 1. Validate stops
    const stops = await this.prisma.stop.findMany({
      where: {
        id: { in: dto.stopIds },
        driver_id: driver.id,
        status: { in: ['pending', 'assigned'] },
      },
    });

    if (stops.length !== dto.stopIds.length) {
      throw new BadRequestException(
        'Some orders are invalid or already assigned.',
      );
    }

    // 2. Calculate distance/duration for the final route object
    // We'll use the stops in their current order (which the driver confirmed)
    const waypoints = stops.map((s) => ({
      lat: Number(s.lat),
      lng: Number(s.lng),
    }));

    const routeData = await this.mapService.getDirections({ waypoints });
    const totalDistance = routeData?.distanceKm || 0;
    const totalDuration = routeData?.durationMin || 0;

    // 3. Create the Route in a transaction
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
      const timestamp = `${dateStr} ${timeStr}`;

      const route = await tx.route.create({
        data: {
          company_id: driver.company_id,
          driver_id: driver.id,
          name: dto.name || `Route ${timestamp}`,
          date: dateStr,
          status: 'scheduled',
          total_stops: stops.length,
          total_distance_km: totalDistance,
          estimated_duration_min: totalDuration,
        },
      });

      // Update stops with route_id and sequence
      await Promise.all(
        stops.map((s, idx) =>
          tx.stop.update({
            where: { id: s.id },
            data: {
              route_id: route.id,
              sequence: idx + 1,
              status: 'assigned',
            },
          }),
        ),
      );

      return route;
    });
  }
}
