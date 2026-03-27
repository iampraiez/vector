import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, DriverStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  CreateOrderDto,
  OrderQueryDto,
  DriverQueryDto,
  PaginationDto,
  UpdateOrderDto,
  ReportQueryDto,
  ChangePlanDto,
  CreateDriverDto,
  UpdateDriverDto,
  CreateApiKeyDto,
  ReassignStopDto,
} from './dto/dashboard.dto';
import {
  UpdateCompanySettingsDto,
  UpdateNotificationsDto,
  UpdateRouteSettingsDto,
} from './dto/settings.dto';
import * as bcrypt from 'bcrypt';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { generateReportCsv } from './utils/report.util';
import { MailService } from '../mail/mail.service';
import { MapService } from '../map/map.service';
import {
  settingsOtpTemplate,
  accountDeletionScheduledTemplate,
} from '../common/template';
import { STANDARD_QUEUE_OPTIONS } from '../queue/bull-job-options';
import { generateCompanyCode } from '../common/utils/generate-company-code';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { PaystackService } from '../billing/paystack.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mailService: MailService,
    private readonly mapService: MapService,
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('account') private readonly accountQueue: Queue,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly paystackService: PaystackService,
  ) {}

  async queueReportEmail(
    email: string,
    companyId: string,
    query: ReportQueryDto,
  ) {
    await this.emailQueue.add(
      'sendReport',
      {
        email,
        companyId,
        query,
      },
      STANDARD_QUEUE_OPTIONS,
    );
  }

  async getMetrics(companyId: string, period: 'day' | 'week' = 'week') {
    const now = new Date();
    const periodMs =
      period === 'day' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const currentStart = new Date(now.getTime() - periodMs);
    const previousStart = new Date(currentStart.getTime() - periodMs);

    const [
      activeDrivers,
      totalDrivers,
      pendingStops,
      completedStops,
      totalStops,
      activeRoute,
      companyRow,
      prevActiveDrivers,
      prevPendingStops,
      prevCompletedStops,
      prevTotalStops,
      avgRatingRow,
    ] = await Promise.all([
      this.prisma.driver.count({
        where: { company_id: companyId, status: 'active' },
      }),
      this.prisma.driver.count({
        where: { company_id: companyId, is_active: true },
      }),
      this.prisma.stop.count({
        where: { company_id: companyId, status: 'unassigned' },
      }),
      this.prisma.stop.count({
        where: {
          company_id: companyId,
          status: 'completed',
          completed_at: { gte: currentStart },
        },
      }),
      this.prisma.stop.count({
        where: { company_id: companyId, created_at: { gte: currentStart } },
      }),
      this.prisma.route.findFirst({
        where: { company_id: companyId, status: 'active' },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.company.findUnique({
        where: { id: companyId },
        select: { company_code: true },
      }),
      // Previous period stats
      this.prisma.driver.count({
        where: {
          company_id: companyId,
          status: 'active',
          last_active_at: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.stop.count({
        where: {
          company_id: companyId,
          status: 'unassigned',
          created_at: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.stop.count({
        where: {
          company_id: companyId,
          status: 'completed',
          completed_at: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.stop.count({
        where: {
          company_id: companyId,
          created_at: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.stop.aggregate({
        where: {
          company_id: companyId,
          status: 'completed',
          customer_rating: { not: null },
        },
        _avg: { customer_rating: true },
      }),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? `+${current}` : '+0';
      const change = current - previous;
      return change >= 0 ? `+${change}` : `${change}`;
    };

    const currentOnTimeRate =
      completedStops > 0
        ? parseFloat(((completedStops / totalStops) * 100).toFixed(1))
        : null;
    const prevOnTimeRate =
      prevCompletedStops > 0
        ? parseFloat(((prevCompletedStops / prevTotalStops) * 100).toFixed(1))
        : null;

    const onTimeRateChange =
      currentOnTimeRate != null && prevOnTimeRate != null
        ? calculateChange(
            Math.round(currentOnTimeRate),
            Math.round(prevOnTimeRate),
          )
        : '+0';

    return {
      active_drivers: activeDrivers,
      total_drivers: totalDrivers,
      company_code: companyRow?.company_code ?? null,
      active_drivers_change: calculateChange(activeDrivers, prevActiveDrivers),
      pending_orders: pendingStops,
      pending_orders_change: calculateChange(pendingStops, prevPendingStops),
      active_route_name: activeRoute?.name || null,
      rating: avgRatingRow._avg.customer_rating
        ? parseFloat(avgRatingRow._avg.customer_rating.toFixed(1))
        : null,
      on_time_rate: currentOnTimeRate,
      on_time_rate_change: onTimeRateChange,
    };
  }

  async getActiveDrivers(companyId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: { company_id: companyId, status: 'active', is_active: true },
      include: { user: { select: { full_name: true, avatar_url: true } } },
    });

    return {
      drivers: drivers.map((d) => ({
        id: d.id,
        name: d.user.full_name,
        status: d.status,
        current_location_name: d.current_location_name,
        current_lat: d.current_lat,
        current_lng: d.current_lng,
        avatar_url: d.user.avatar_url,
      })),
    };
  }

  async getRecentOrders(companyId: string) {
    const orders = await this.prisma.stop.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      take: 5,
    });
    return { orders };
  }

  async createOrder(
    companyId: string,
    dto: CreateOrderDto,
    skipBillingCheck = false,
  ) {
    if (!skipBillingCheck) {
      const billing = await this.getBillingInfo(companyId);
      if (
        billing.total_deliveries_this_month >=
        billing.plan.monthly_delivery_limit
      ) {
        throw new ForbiddenException(
          `Your plan limit (${billing.plan.monthly_delivery_limit} deliveries/month) has been reached. Please upgrade to accept more deliveries.`,
        );
      }
    }

    if (dto.delivery_date) {
      const today = new Date().toISOString().split('T')[0];
      if (dto.delivery_date < today) {
        throw new BadRequestException(
          'Orders cannot be scheduled for the past',
        );
      }
    }

    let lat: number | null = null;
    let lng: number | null = null;

    if (dto.address) {
      // 1. Local Cache: Check if we already geocoded this address
      const cachedStop = await this.prisma.stop.findFirst({
        where: {
          company_id: companyId,
          address: dto.address,
          city: dto.city,
          lat: { not: null },
          lng: { not: null },
        },
        select: { lat: true, lng: true },
      });

      if (cachedStop && cachedStop.lat && cachedStop.lng) {
        lat = cachedStop.lat;
        lng = cachedStop.lng;
      } else {
        // 2. Fallback: Geoapify
        try {
          // Fetch company to append location context to string, improving accuracy
          const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { city: true, state: true, country: true },
          });

          let searchString = dto.address;
          if (dto.city) {
            searchString += `, ${dto.city}`;
          } else if (company?.city) {
            searchString += `, ${company.city}`;
          }
          if (company?.state) searchString += `, ${company.state}`;
          if (company?.country) searchString += `, ${company.country}`;

          // Map country name to code if possible for better Geoapify filtering
          let filter: string | undefined;
          let bias: string | undefined;

          if (company?.country?.toLowerCase() === 'nigeria') {
            filter = 'countrycode:ng';
            bias = 'countrycode:ng';
          }

          const geo = await this.mapService.geocode({
            address: searchString,
            filter,
            bias,
          });
          lat = geo.lat;
          lng = geo.lng;
        } catch {
          // Geocode fail: leave as null so the UI can prompt for manual update
        }
      }
    }

    const stop = await this.prisma.stop.create({
      data: {
        ...dto,
        company_id: companyId,
        status: 'unassigned',
        external_id: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        lat,
        lng,
      },
    });

    // Queue "Order Received" notification to customer
    if (stop.customer_email) {
      const appUrl = this.configService.getOrThrow<string>('APP_URL');
      await this.emailQueue.add(
        'sendTrackingLink',
        {
          email: stop.customer_email,
          customerName: stop.customer_name,
          trackingLink: `${appUrl}/track?token=${stop.tracking_token}`,
          orderId: stop.external_id,
          status: 'assigned', // Processor handles this as "Scheduled/Received"
        },
        STANDARD_QUEUE_OPTIONS,
      );
    }

    // Notify the fleet manager who created the order (in-app)
    const manager = await this.prisma.user.findFirst({
      where: { company_id: companyId, role: { in: ['admin', 'manager'] } },
      orderBy: { created_at: 'asc' },
    });
    if (manager) {
      await this.notificationsService.create({
        userId: manager.id,
        companyId,
        type: 'new_assignment',
        title: 'New Order Created',
        body: `Order for "${stop.customer_name}" (${stop.external_id}) has been created and is ready to be assigned.`,
      });
    }

    return stop;
  }

  async getOrders(companyId: string, query: OrderQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StopWhereInput = { company_id: companyId };
    if (query.status && query.status !== 'all') {
      where.status = query.status as Prisma.EnumStopStatusFilter;
    }
    if (query.search) {
      where.OR = [
        { customer_name: { contains: query.search, mode: 'insensitive' } },
        { external_id: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Refresh statuses for upcoming/active orders before fetching
    // await this.refreshOrderStatuses(companyId); // Now handled by background job

    const [data, total] = await Promise.all([
      this.prisma.stop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { driver: { include: { user: true } }, route: true },
      }),
      this.prisma.stop.count({ where }),
    ]);

    const formattedData = data.map((stop) => ({
      ...stop,
      driver_name: stop.driver?.user.full_name,
      route_name: stop.route?.name,
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
      stats: await this.getOrderStats(companyId),
    };
  }

  async getOrderDetail(companyId: string, stopId: string) {
    const order = await this.prisma.stop.findUnique({
      where: { id: stopId, company_id: companyId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                full_name: true,
                email: true,
                phone: true,
                avatar_url: true,
              },
            },
          },
        },
        route: {
          include: {
            stops: {
              orderBy: { sequence: 'asc' },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async reassignStop(companyId: string, stopId: string, dto: ReassignStopDto) {
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, company_id: companyId },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    if (stop.status !== 'failed' && stop.status !== 'returned') {
      throw new ConflictException(
        'Only failed or returned stops can be reassigned',
      );
    }

    const updatedStop = await this.prisma.stop.update({
      where: { id: stopId },
      data: {
        status: dto.driver_id ? 'assigned' : 'unassigned',
        driver_id: dto.driver_id || null,
        failure_reason: null,
        failure_notes: null,
        arrived_at: null,
        completed_at: null,
      },
      include: { driver: { include: { user: true } } },
    });

    // Notify driver of reassignment
    if (dto.driver_id && updatedStop.driver?.user?.id) {
      await this.notificationsService.create({
        userId: updatedStop.driver.user.id,
        companyId,
        type: 'new_assignment',
        title: 'Order Re-assigned to You',
        body: `You have been re-assigned the delivery for "${updatedStop.customer_name}".`,
      });
    }

    return updatedStop;
  }

  private async getOrderStats(companyId: string) {
    const stops = await this.prisma.stop.groupBy({
      by: ['status'],
      where: { company_id: companyId },
      _count: true,
    });

    const stats: Record<string, number> = {
      total: 0,
      unassigned: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
    };
    stops.forEach((s) => {
      stats[s.status] = s._count;
      stats.total += s._count;
    });
    return stats;
  }

  async updateOrder(companyId: string, stopId: string, dto: UpdateOrderDto) {
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, company_id: companyId },
      include: { route: true },
    });

    if (!stop) throw new NotFoundException('Order not found');

    // BLOCK: Location/Address changes if route is active
    if (stop.route?.status === 'active') {
      const isChangingLocation =
        dto.address !== undefined ||
        dto.city !== undefined ||
        dto.lat !== undefined ||
        dto.lng !== undefined;

      if (isChangingLocation) {
        throw new ForbiddenException(
          'Cannot change delivery location while the route is active.',
        );
      }
    }

    const data: Prisma.StopUpdateInput = { ...dto };

    // If address is being updated but no manual lat/lng provided, try to geocode
    if (data.address && data.lat === undefined && data.lng === undefined) {
      // 1. Local Cache check
      const cachedStop = await this.prisma.stop.findFirst({
        where: {
          company_id: companyId,
          address: data.address as string,
          city: data.city as string | null,
          lat: { not: null },
          lng: { not: null },
        },
        select: { lat: true, lng: true },
      });

      if (cachedStop && cachedStop.lat && cachedStop.lng) {
        data.lat = cachedStop.lat;
        data.lng = cachedStop.lng;
      } else {
        // 2. Geocode fallback
        try {
          const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { city: true, state: true, country: true },
          });

          let searchString = dto.address;
          if (dto.city) searchString += `, ${dto.city}`;
          else if (company?.city) searchString += `, ${company.city}`;
          if (company?.state) searchString += `, ${company.state}`;
          if (company?.country) searchString += `, ${company.country}`;

          let filter: string | undefined;
          let bias: string | undefined;
          if (company?.country?.toLowerCase() === 'nigeria') {
            filter = 'countrycode:ng';
            bias = 'countrycode:ng';
          }

          const geo = await this.mapService.geocode({
            address: searchString as string,
            filter,
            bias,
          });
          data.lat = geo.lat;
          data.lng = geo.lng;
        } catch {
          // Ignore geocode failure on update, stick with existing or null
        }
      }
    }

    if (dto.status === 'assigned') {
      data.assigned_at = new Date();
    }

    return this.prisma.stop.update({
      where: { id: stopId, company_id: companyId },
      data,
    });
  }

  async deleteOrder(companyId: string, stopId: string, userId: string) {
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, company_id: companyId },
    });

    if (!stop) throw new NotFoundException('Order not found');
    if (['in_progress', 'completed'].includes(stop.status)) {
      throw new ConflictException(
        'Cannot delete an order that is in progress or completed.',
      );
    }

    await this.prisma.stop.delete({ where: { id: stopId } });
    await this.auditService.log({
      companyId,
      userId,
      action: 'order.delete',
      resourceType: 'stop',
      resourceId: stopId,
      oldValue: {
        status: stop.status,
        address: stop.address,
        customer_name: stop.customer_name,
      },
    });
  }

  async getDrivers(companyId: string, query: DriverQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DriverWhereInput = {
      company_id: companyId,
      is_active: true,
      user: { is_active: true },
    };
    if (query.status && query.status !== 'all') {
      where.status = query.status as Prisma.EnumDriverStatusFilter;
    }
    if (query.search) {
      where.user = {
        is_active: true,
        OR: [
          { full_name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    const formatted = data.map((d) => ({
      id: d.id,
      user_id: d.user_id,
      name: d.user.full_name,
      email: d.user.email,
      phone: d.user.phone,
      avatar_url: d.user.avatar_url,
      status: d.status,
      vehicle_type: d.vehicle_type,
      vehicle_plate: d.vehicle_plate,
      current_location_name: d.current_location_name,
      total_deliveries: d.total_deliveries,
      avg_rating: d.avg_rating,
      location_lat: d.current_lat,
      location_lng: d.current_lng,
      last_active_at: d.last_active_at,
    }));

    return {
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getDriverDetail(companyId: string, driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId, company_id: companyId },
      include: {
        user: true,
      },
    });

    if (!driver) throw new NotFoundException('Driver not found');

    // Get recent routes
    const recentRoutes = await this.prisma.route.findMany({
      where: { driver_id: driverId },
      take: 5,
      orderBy: { date: 'desc' },
    });

    return {
      driver: {
        id: driver.id,
        user_id: driver.user_id,
        name: driver.user.full_name,
        email: driver.user.email,
        phone: driver.user.phone,
        avatar_url: driver.user.avatar_url,
        status: driver.status,
        vehicle_type: driver.vehicle_type,
        vehicle_plate: driver.vehicle_plate,
        location_lat: driver.current_lat,
        location_lng: driver.current_lng,
        current_location_name: driver.current_location_name,
        total_deliveries: driver.total_deliveries,
        avg_rating: driver.avg_rating,
        joined_at: driver.created_at,
      },
      recent_routes: recentRoutes,
    };
  }

  async createDriverInvite(companyId: string, dto: CreateDriverDto) {
    // Check seat limit
    const billing = await this.prisma.billingRecord.findFirst({
      where: {
        company_id: companyId,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!billing) {
      throw new ForbiddenException(
        'No active subscription found. Please subscribe to add drivers.',
      );
    }

    const currentDrivers = await this.prisma.driver.count({
      where: { company_id: companyId, is_active: true },
    });

    if (currentDrivers >= billing.seats_included) {
      throw new ForbiddenException(
        `Your plan limit (${billing.seats_included} drivers) has been reached. Please upgrade your plan to add more drivers.`,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const tempPassword = `vec-${Math.random().toString(36).substring(2, 8)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        full_name: dto.full_name,
        phone: dto.phone,
        role: 'driver',
        company_id: companyId,
        driver_profile: {
          create: {
            company_id: companyId,
            vehicle_type: dto.vehicle_type,
            vehicle_plate: dto.vehicle_plate,
            status: 'offline',
          },
        },
      },
    });

    // Welcome notification for the new driver
    await this.notificationsService.create({
      userId: user.id,
      companyId: companyId,
      type: 'system_alert',
      title: '👋 Welcome to Vector!',
      body: 'Your account has been created by your fleet manager. Start accepting deliveries.',
    });

    return {
      message: 'Driver invite created successfully',
      temp_password: tempPassword,
      user_id: user.id,
    };
  }

  async updateDriver(
    companyId: string,
    driverId: string,
    dto: UpdateDriverDto,
  ) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId, company_id: companyId },
      include: { user: true, routes: { where: { status: 'active' } } },
    });

    if (!driver) throw new NotFoundException('Driver not found');

    // BLOCK: Profile/Vehicle changes if route is active
    if (driver.routes.length > 0) {
      const isSensitiveUpdate =
        dto.vehicle_type !== undefined ||
        dto.vehicle_plate !== undefined ||
        dto.status !== undefined;

      if (isSensitiveUpdate) {
        throw new ForbiddenException(
          'Cannot update vehicle information or status while on an active route.',
        );
      }
    }

    const updateDto = dto;

    // Split updates between User table and Driver profile
    const userUpdateData: Prisma.UserUpdateInput = {};
    if (updateDto.full_name) userUpdateData.full_name = updateDto.full_name;
    if (updateDto.phone) userUpdateData.phone = updateDto.phone;

    const driverUpdateData: Prisma.DriverUpdateInput = {};
    if (updateDto.status)
      driverUpdateData.status = updateDto.status as
        | Prisma.EnumDriverStatusFieldUpdateOperationsInput
        | DriverStatus;
    if (updateDto.vehicle_type)
      driverUpdateData.vehicle_type = updateDto.vehicle_type;
    if (updateDto.vehicle_plate)
      driverUpdateData.vehicle_plate = updateDto.vehicle_plate;

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: driver.user_id },
        data: userUpdateData,
      });
    }

    if (Object.keys(driverUpdateData).length > 0) {
      await this.prisma.driver.update({
        where: { id: driverId },
        data: driverUpdateData,
      });
    }

    return this.getDriverDetail(companyId, driverId);
  }

  async deleteDriver(companyId: string, driverId: string, userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId, company_id: companyId },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    // Soft delete by setting is_active = false
    await this.prisma.user.update({
      where: { id: driver.user_id },
      data: { is_active: false },
    });

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'offline', is_active: false },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'driver.deactivate',
      resourceType: 'driver',
      resourceId: driverId,
      oldValue: { user_id: driver.user_id },
    });
  }

  async getLiveTracking(companyId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: {
        company_id: companyId,
        status: { in: ['active', 'idle'] },
        is_active: true,
        user: { is_active: true },
      },
      select: {
        id: true,
        user: { select: { full_name: true } },
        status: true,
        current_lat: true,
        current_lng: true,
        current_location_name: true,
        last_active_at: true,
      },
    });

    return {
      drivers: drivers.map((d) => ({
        id: d.id,
        name: d.user.full_name,
        status: d.status,
        lat: d.current_lat,
        lng: d.current_lng,
        location_name: d.current_location_name,
        last_active_at: d.last_active_at,
      })),
    };
  }

  async getReportSummary(companyId: string, query: ReportQueryDto) {
    const timeFilter = query.start_date
      ? { gte: new Date(query.start_date) }
      : undefined;

    const statsResult = await this.prisma.stop.groupBy({
      by: ['status'],
      where: {
        company_id: companyId,
        created_at: timeFilter,
      },
      _count: true,
    });

    let completed = 0;
    let failed = 0;

    statsResult.forEach((s) => {
      if (s.status === 'completed') completed += s._count;
      if (s.status === 'failed') failed += s._count;
    });

    const routes = await this.prisma.route.aggregate({
      where: {
        company_id: companyId,
        status: 'completed',
        created_at: timeFilter,
      },
      _sum: {
        total_distance_km: true,
        actual_duration_min: true,
      },
      _count: true,
    });

    const totalDistance = routes._sum.total_distance_km || 0;
    const avgDeliveryTime =
      routes._count > 0
        ? (routes._sum.actual_duration_min || 0) / routes._count
        : 0;
    const successRate =
      completed + failed > 0 ? (completed / (completed + failed)) * 100 : 0;
    const fuelSavedUsd = totalDistance * 0.15; // Estimating savings by optimization vs baseline

    return {
      total_deliveries: completed,
      total_distance_km: totalDistance,
      avg_delivery_time_min: avgDeliveryTime,
      success_rate: successRate,
      fuel_saved_usd: fuelSavedUsd,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getReportCharts(companyId: string, _query: ReportQueryDto) {
    // Generate an array of the last 7 days
    const days = Array.from({ length: 7 })
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      })
      .reverse();

    const stops = await this.prisma.stop.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      select: { status: true, created_at: true },
    });

    const deliveriesByDay = days.map((day) => {
      const count = stops.filter(
        (s) =>
          s.status === 'completed' &&
          s.created_at.toISOString().startsWith(day),
      ).length;
      return { date: day, count };
    });

    const successRateTrend = days.map((day) => {
      const dayStops = stops.filter((s) =>
        s.created_at.toISOString().startsWith(day),
      );
      const completed = dayStops.filter((s) => s.status === 'completed').length;
      const failed = dayStops.filter((s) => s.status === 'failed').length;
      const rate =
        completed + failed > 0 ? (completed / (completed + failed)) * 100 : 0;
      return { date: day, rate };
    });

    return {
      deliveries_by_day: deliveriesByDay,
      success_rate_trend: successRateTrend,
    };
  }

  async getDriverPerformance(
    companyId: string,
    query: ReportQueryDto & PaginationDto,
  ) {
    const page = parseInt(query.page as unknown as string) || 1;
    const limit = parseInt(query.limit as unknown as string) || 20;
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { company_id: companyId },
        include: { user: true },
        skip,
        take: limit,
      }),
      this.prisma.driver.count({ where: { company_id: companyId } }),
    ]);

    const driverIds = drivers.map((d) => d.id);
    const stops = await this.prisma.stop.findMany({
      where: {
        driver_id: { in: driverIds },
        status: 'completed',
        time_window_end: { not: null },
        arrived_at: { not: null },
        delivery_date: { not: null },
      },
      select: {
        driver_id: true,
        arrived_at: true,
        delivery_date: true,
        time_window_end: true,
      },
    });

    const data = drivers.map((d) => {
      const driverStops = stops.filter((s) => s.driver_id === d.id);
      const onTimeCount = driverStops.filter((s) => {
        const deadline = new Date(`${s.delivery_date}T${s.time_window_end}:00`);
        return s.arrived_at! <= deadline;
      }).length;

      const onTimeRate =
        driverStops.length > 0
          ? (onTimeCount / driverStops.length) * 100
          : null;

      return {
        driver_id: d.id,
        name: d.user.full_name,
        deliveries_completed: d.total_deliveries,
        on_time_rate: onTimeRate,
        rating: d.avg_rating,
      };
    });

    return {
      data,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async generateReportCsv(companyId: string, query: ReportQueryDto) {
    return generateReportCsv(this.prisma, companyId, query);
  }

  async importBulkOrders(companyId: string, orders: CreateOrderDto[]) {
    const billing = await this.getBillingInfo(companyId);       
    if (
      billing.total_deliveries_this_month + orders.length >
      billing.plan.monthly_delivery_limit
    ) {
      throw new ForbiddenException(
        `Importing ${orders.length} orders would exceed your monthly limit of ${billing.plan.monthly_delivery_limit} deliveries. You currently have ${billing.total_deliveries_this_month} deliveries this month.`,
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: { row: number; reason: string }[] = [];

    // Process sequentially to easily track errors per row
    for (let i = 0; i < orders.length; i++) {
      try {
        await this.createOrder(companyId, orders[i], true);
        imported++;
      } catch (err: unknown) {
        skipped++;
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
              ? (err.message as string)
              : 'Unknown error';
        errors.push({
          row: i + 1,
          reason: errorMessage,
        });
      }
    }

    return { imported, skipped, errors };
  }

  async getBillingInfo(companyId: string) {
    const record = await this.prisma.billingRecord.findFirst({
      where: {
        company_id: companyId,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
      orderBy: { created_at: 'desc' },
    });

    // Define plan details with delivery limits
    const planLimits: Record<
      string,
      { name: string; price: number; monthly_delivery_limit: number }
    > = {
      free: { name: 'Free Plan', price: 0, monthly_delivery_limit: 100 },
      starter: { name: 'Starter Plan', price: 29, monthly_delivery_limit: 500 },
      growth: { name: 'Growth Plan', price: 89, monthly_delivery_limit: 5000 },
    };

    // Get current month's delivery count
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [deliveryCount, activeDriversCount] = await Promise.all([
      this.prisma.stop.count({
        where: {
          company_id: companyId,
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: { in: ['completed', 'in_progress'] },
        },
      }),
      this.prisma.driver.count({
        where: { company_id: companyId, is_active: true },
      }),
    ]);

    if (!record) {
      const planDetails = planLimits['free'];
      return {
        plan: {
          id: 'free',
          name: planDetails.name,
          price_usd: planDetails.price,
          monthly_delivery_limit: planDetails.monthly_delivery_limit,
        },
        status: 'active',
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        cancel_at_period_end: false,
        total_deliveries_this_month: deliveryCount,
        total_drivers: activeDriversCount,
        seats_included: 2, // Default for free plan
      };
    }

    const planDetails = planLimits[record.plan_id] || {
      name: 'Custom Plan',
      price: 0,
      monthly_delivery_limit: 1000,
    };

    return {
      plan: {
        id: record.plan_id,
        name: planDetails.name,
        price_usd: planDetails.price,
        monthly_delivery_limit: planDetails.monthly_delivery_limit,
      },
      status: record.status,
      current_period_end: record.current_period_end,
      cancel_at_period_end: record.cancel_at_period_end,
      total_deliveries_this_month: deliveryCount,
      total_drivers: activeDriversCount,
      seats_included: record.seats_included,
    };
  }

  async getInvoices(companyId: string, query: PaginationDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { company_id: companyId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.invoice.count({ where: { company_id: companyId } }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async changePlan(companyId: string, dto: ChangePlanDto, userId: string) {
    const activeRecord = await this.prisma.billingRecord.findFirst({
      where: {
        company_id: companyId,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
      orderBy: { created_at: 'desc' },
    });

    if (activeRecord) {
      // Archive old plan
      await this.prisma.billingRecord.update({
        where: { id: activeRecord.id },
        data: { status: 'canceled', cancel_at_period_end: false },
      });
    }

    const isPaidPlan = dto.plan_id === 'starter' || dto.plan_id === 'growth';
    const activeEndDate = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000); // 10 years for free
    const paidEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days extension

    // Create new plan record
    await this.prisma.billingRecord.create({
      data: {
        company_id: companyId,
        plan_id: dto.plan_id,
        status: 'active',
        current_period_start: new Date(),
        // If paid plan, they paid so it's active for 30 days. If free, active indefinitely.
        current_period_end: isPaidPlan ? paidEndDate : activeEndDate,
        seats_included:
          dto.plan_id === 'free' ? 2 : dto.plan_id === 'starter' ? 5 : 20,
      },
    });

    const newSeats =
      dto.plan_id === 'free' ? 2 : dto.plan_id === 'starter' ? 5 : 20;
    if (activeRecord && newSeats < activeRecord.seats_included) {
      const currentDriverCount = await this.prisma.driver.count({
        where: { company_id: companyId, is_active: true },
      });
      const excess = currentDriverCount - newSeats;
      if (excess > 0) {
        const driversToLock = await this.prisma.driver.findMany({
          where: { company_id: companyId, is_active: true },
          orderBy: { created_at: 'desc' },
          take: excess,
        });
        await this.prisma.driver.updateMany({
          where: { id: { in: driversToLock.map((d) => d.id) } },
          data: { is_active: false },
        });
        const admins = await this.prisma.user.findMany({
          where: { company_id: companyId, role: 'admin' },
        });
        for (const admin of admins) {
          await this.mailService.sendMail(
            admin.email,
            'Plan Downgraded: Drivers Deactivated',
            `<p>Your plan was downgraded to ${newSeats} seats. We automatically deactivated ${excess} of your most recently joined drivers. You can re-activate them by upgrading your plan.</p>`,
          );
        }
      }
    }

    // Update company subscription tier and UNLOCK if it was locked
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        subscription_tier: dto.plan_id,
        subscription_locked: false,
      },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'billing.change_plan',
      resourceType: 'billing',
      resourceId: companyId,
      oldValue: activeRecord
        ? { plan_id: activeRecord.plan_id, billing_record_id: activeRecord.id }
        : undefined,
      newValue: { plan_id: dto.plan_id },
    });

    let checkoutUrl: string | null = null;

    // If paid plan, initialize Paystack checkout
    if (isPaidPlan) {
      const user = await this.prisma.user.findFirst({
        where: { company_id: companyId, role: 'admin' },
      });

      if (user) {
        const isYearly = dto.billing_cycle === 'annual';
        const planPrices: Record<string, { monthly: number; annual: number }> =
          {
            starter: { monthly: 20000, annual: 180000 },
            growth: { monthly: 50000, annual: 480000 },
          }; // in NGN
        const amountNGN =
          planPrices[dto.plan_id]?.[isYearly ? 'annual' : 'monthly'] || 0;

        // Security: Verify the expected amount from the frontend matches the server calculation
        if (
          dto.expected_amount_ngn !== undefined &&
          dto.expected_amount_ngn !== amountNGN
        ) {
          this.logger.error(
            `CRITICAL: Price mismatch for ${dto.plan_id} (${dto.billing_cycle}). Modal showed ₦${dto.expected_amount_ngn.toLocaleString()}, Server calculated ₦${amountNGN.toLocaleString()}`,
          );
        }

        const amountKobo = amountNGN * 100; // Convert to kobo

        const result = await this.paystackService.initializeCheckout(
          user.email,
          amountKobo,
          {
            company_id: companyId,
            plan_id: dto.plan_id,
            plan_name:
              dto.plan_id === 'starter' ? 'Starter Plan' : 'Growth Plan',
            billing_cycle: dto.billing_cycle || 'monthly',
          },
        );

        checkoutUrl = result.checkout_url;

        // Store transaction reference for verification
        await this.prisma.billingRecord.update({
          where: { id: activeRecord?.id || '' },
          data: { paystack_reference: result.reference },
        });
      }
    }

    return {
      message: 'Plan changed successfully',
      plan_id: dto.plan_id,
      checkout_url: checkoutUrl,
    };
  }

  async updatePaymentMethod(companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { company_id: companyId, role: 'admin' },
    });

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    // Initialize authorization to save payment method
    const result = await this.paystackService.initializeAuthorization(
      user.email,
      'Payment Method Authorization',
      companyId,
    );

    return {
      message: 'Setup intent created',
      setup_url: result.authorization_url,
    };
  }

  async cancelPlan(companyId: string) {
    const record = await this.prisma.billingRecord.findFirst({
      where: {
        company_id: companyId,
        status: { in: ['active', 'trialing'] },
      },
      orderBy: { created_at: 'desc' },
    });

    if (record) {
      await this.prisma.billingRecord.update({
        where: { id: record.id },
        data: { cancel_at_period_end: true },
      });
    }

    return {
      message: 'Plan will be canceled at the end of the billing period.',
    };
  }

  async getSettings(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        api_keys: {
          select: {
            id: true,
            name: true,
            key_prefix: true,
            created_at: true,
            last_used_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    const billing = await this.getBillingInfo(companyId);

    const needs_setup = !company.price_per_km || !company.currency;

    return {
      company: {
        ...company,
        api_keys: company.api_keys,
        needs_setup,
      },
      notifications: company.notification_settings,
      billing,
    };
  }

  async updateRouteSettings(companyId: string, dto: UpdateRouteSettingsDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const currentSettings =
      (company.route_settings as Record<string, unknown>) || {};
    const updatedSettings = { ...currentSettings, ...dto };

    return this.prisma.company.update({
      where: { id: companyId },
      data: { route_settings: updatedSettings },
    });
  }

  async updateSettings(companyId: string, dto: UpdateCompanySettingsDto) {
    const data: Prisma.CompanyUpdateInput = {};
    if (dto.name) data.name = dto.name;
    if (dto.contact_email) data.contact_email = dto.contact_email;
    if (dto.phone) data.phone = dto.phone;
    if (dto.city) data.city = dto.city;
    if (dto.state) data.state = dto.state;
    if (dto.timezone) data.timezone = dto.timezone;

    return this.prisma.company.update({
      where: { id: companyId },
      data,
    });
  }

  async updateNotifications(companyId: string, dto: UpdateNotificationsDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const currentSettings =
      (company.notification_settings as Record<string, boolean>) || {};
    const newSettings = { ...currentSettings, ...dto };

    return this.prisma.company.update({
      where: { id: companyId },
      data: { notification_settings: newSettings as Prisma.InputJsonValue },
    });
  }

  async regenerateAccessCode(companyId: string, userId: string) {
    const before = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { company_code: true },
    });

    for (let attempt = 0; attempt < 40; attempt++) {
      const newCode = generateCompanyCode();
      const conflict = await this.prisma.company.findFirst({
        where: { company_code: newCode, id: { not: companyId } },
        select: { id: true },
      });
      if (!conflict) {
        const updated = await this.prisma.company.update({
          where: { id: companyId },
          data: { company_code: newCode },
        });
        await this.auditService.log({
          companyId,
          userId,
          action: 'settings.regenerate_company_code',
          resourceType: 'company',
          resourceId: companyId,
          oldValue: { company_code: before?.company_code },
          newValue: { company_code: updated.company_code },
        });
        return updated;
      }
    }
    throw new ConflictException(
      'Could not generate a unique company code. Try again.',
    );
  }

  async createApiKey(companyId: string, dto: CreateApiKeyDto, userId: string) {
    const rawKey = `vec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // In production, you would hash this before storing
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = rawKey; // Stub: store raw for now

    const inputName = dto?.name || 'New API Key';

    const apiKey = await this.prisma.apiKey.create({
      data: {
        company_id: companyId,
        name: inputName,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        created_by: userId,
      },
    });

    return {
      message:
        'API Key created successfully. Store it now as it will not be shown again.',
      api_key: rawKey,
      id: apiKey.id,
      name: apiKey.name,
    };
  }

  async revokeApiKey(companyId: string, keyId: string) {
    await this.prisma.apiKey.delete({
      where: { id: keyId, company_id: companyId },
    });
  }

  async getNotifications(userId: string, query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
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

  async markNotificationRead(userId: string, targetId: string) {
    if (targetId === 'all') {
      await this.prisma.notification.updateMany({
        where: { user_id: userId, read: false },
        data: { read: true, read_at: new Date() },
      });
      return { message: 'All notifications marked as read' };
    }

    return this.prisma.notification.update({
      where: { id: targetId, user_id: userId },
      data: { read: true, read_at: new Date() },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    if (notificationId === 'all') {
      await this.prisma.notification.deleteMany({
        where: { user_id: userId },
      });
      return;
    }
    await this.prisma.notification.delete({
      where: { id: notificationId, user_id: userId },
    });
  }

  async requestSettingsOtp(userId: string, companyId: string, action: string) {
    if (!['deactivate_workspace', 'clear_workspace_data'].includes(action)) {
      throw new BadRequestException('Invalid action');
    }

    const admin = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp:admin:${userId}:${action}`;

    await this.redis.set(redisKey, otp, 300);

    const email = admin.email;
    await this.mailService.sendMail(
      email,
      'Vector Workspace Settings Verification',
      settingsOtpTemplate(action, otp, true),
      `Your code is ${otp}`,
    );

    return { message: 'OTP sent' };
  }

  async verifySettingsOtp(
    userId: string,
    companyId: string,
    action: string,
    otp: string,
  ) {
    const admin = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    const redisKey = `otp:admin:${userId}:${action}`;
    const storedOtp = await this.redis.get(redisKey);
    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.redis.del(redisKey);

    if (action === 'clear_workspace_data') {
      await this.accountQueue.add(
        'clearDataReport',
        {
          companyId,
          email: company?.contact_email || admin.email,
          targetRole: 'workspace',
          targetId: companyId,
          actorUserId: userId,
        },
        STANDARD_QUEUE_OPTIONS,
      );
      return {
        message:
          'Workspace data clearance scheduled. A full report will be emailed to you.',
      };
    }

    if (action === 'deactivate_workspace') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email_verified: false },
      });

      const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
      await this.accountQueue.add(
        'deleteAccount',
        { userId },
        { ...STANDARD_QUEUE_OPTIONS, delay: tenDaysMs },
      );

      // Send confirmation email with recovery instructions
      const deletionDate = new Date(Date.now() + tenDaysMs).toLocaleDateString(
        'en-GB',
        { day: '2-digit', month: 'long', year: 'numeric' },
      );
      await this.mailService.sendMail(
        admin.email,
        'Your Vector workspace is scheduled for deletion',
        accountDeletionScheduledTemplate(admin.full_name, deletionDate),
        `Your workspace will be permanently deleted on ${deletionDate}. Log in and verify your email to cancel.`,
      );

      return {
        message: 'Workspace scheduled for permanent deletion in 10 days',
      };
    }
  }
}
