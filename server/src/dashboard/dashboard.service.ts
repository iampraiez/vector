import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
} from './dto/dashboard.dto';
import * as bcrypt from 'bcrypt';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { generateReportCsv } from './utils/report.util';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async queueReportEmail(
    email: string,
    companyId: string,
    query: ReportQueryDto,
  ) {
    await this.emailQueue.add('sendReport', {
      email,
      companyId,
      query,
    });
  }

  async getMetrics(companyId: string) {
    const [activeDrivers, pendingOrders, completedStops, totalStops] =
      await Promise.all([
        this.prisma.driver.count({
          where: { company_id: companyId, status: 'active' },
        }),
        this.prisma.stop.count({
          where: { company_id: companyId, status: 'unassigned' },
        }),
        this.prisma.stop.count({
          where: { company_id: companyId, status: 'completed' },
        }),
        this.prisma.stop.count({
          where: { company_id: companyId },
        }),
      ]);

    const onTimeRate =
      totalStops > 0
        ? parseFloat(((completedStops / totalStops) * 100).toFixed(1))
        : null;

    return {
      active_drivers: activeDrivers,
      active_drivers_change: '+0',
      pending_orders: pendingOrders,
      pending_orders_change: '+0',
      on_time_rate: onTimeRate,
      on_time_rate_change: '+0',
      fuel_saved_usd: 0,
      fuel_saved_change: '+0',
    };
  }

  async getActiveDrivers(companyId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: { company_id: companyId, status: 'active' },
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

  async createOrder(companyId: string, dto: CreateOrderDto) {
    return this.prisma.stop.create({
      data: {
        ...dto,
        company_id: companyId,
        status: 'unassigned',
        external_id: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });
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
    return this.prisma.stop.update({
      where: { id: stopId, company_id: companyId },
      data: dto as Prisma.StopUpdateInput,
    });
  }

  async deleteOrder(companyId: string, stopId: string) {
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
  }

  async getDrivers(companyId: string, query: DriverQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DriverWhereInput = { company_id: companyId };
    if (query.status && query.status !== 'all') {
      where.status = query.status as Prisma.EnumDriverStatusFilter;
    }
    if (query.search) {
      where.user = {
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
        current_lat: driver.current_lat,
        current_lng: driver.current_lng,
        current_location_name: driver.current_location_name,
        total_deliveries: driver.total_deliveries,
        avg_rating: driver.avg_rating,
        joined_at: driver.created_at,
      },
      recent_routes: recentRoutes,
    };
  }

  async createDriverInvite(companyId: string, dto: CreateDriverDto) {
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

    return {
      message: 'Driver invite created successfully',
      temp_password: tempPassword,
      user_id: user.id,
    };
  }

  async updateDriver(companyId: string, driverId: string, dto: any) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId, company_id: companyId },
      include: { user: true },
    });

    if (!driver) throw new NotFoundException('Driver not found');

    const updateDto = dto as {
      full_name?: string;
      phone?: string;
      status?: string;
      vehicle_type?: string;
      vehicle_plate?: string;
    };

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

  async deleteDriver(companyId: string, driverId: string) {
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
      data: { status: 'offline' },
    });
  }

  async getLiveTracking(companyId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: { company_id: companyId, status: { in: ['active', 'idle'] } },
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
    const page = query.page || 1;
    const limit = query.limit || 20;
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

    const data = drivers.map((d) => ({
      driver_id: d.id,
      name: d.user.full_name,
      deliveries_completed: d.total_deliveries,
      on_time_rate: d.total_deliveries > 0 ? 98.0 : 0,
      rating: d.avg_rating,
    }));

    return {
      data,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async generateReportCsv(companyId: string, query: ReportQueryDto) {
    return generateReportCsv(this.prisma, companyId, query);
  }

  async importBulkOrders(companyId: string, orders: CreateOrderDto[]) {
    let imported = 0;
    let skipped = 0;
    const errors: { row: number; reason: string }[] = [];

    // Process sequentially to easily track errors per row
    for (let i = 0; i < orders.length; i++) {
      try {
        await this.createOrder(companyId, orders[i]);
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
      where: { company_id: companyId, status: 'active' },
      orderBy: { created_at: 'desc' },
    });

    if (!record) {
      return {
        plan: {
          id: 'free',
          name: 'Free Plan',
          price_usd: 0,
          billing_cycle: 'monthly',
        },
        status: 'active',
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        payment_method: null,
      };
    }

    return {
      plan: {
        id: record.plan_id,
        name: 'Pro Plan', // Stub mapping
        price_usd: 49,
      },
      status: record.status,
      current_period_end: record.current_period_end,
      cancel_at_period_end: record.cancel_at_period_end,
    };
  }

  async getInvoices(companyId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    return { invoices };
  }

  async changePlan(companyId: string, dto: ChangePlanDto) {
    const activeRecord = await this.prisma.billingRecord.findFirst({
      where: { company_id: companyId, status: 'active' },
    });

    if (activeRecord) {
      // Archive old plan
      await this.prisma.billingRecord.update({
        where: { id: activeRecord.id },
        data: { status: 'canceled', cancel_at_period_end: false },
      });
    }

    // Create new plan record
    await this.prisma.billingRecord.create({
      data: {
        company_id: companyId,
        plan_id: dto.plan_id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        // Example: start a new 30-day period
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    });

    // Stub for Paystack/Stripe checkout URL if you actually needed payment intent
    return {
      message: 'Plan changed successfully',
      plan_id: dto.plan_id,
      checkout_url: 'https://paystack.com/pay/stub',
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatePaymentMethod(_companyId: string) {
    // Stub for Paystack integration
    return {
      message: 'Setup intent created',
      setup_url: 'https://paystack.com/setup/stub',
    };
  }

  async cancelPlan(companyId: string) {
    const record = await this.prisma.billingRecord.findFirst({
      where: { company_id: companyId, status: 'active' },
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
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    return { company };
  }

  async updateSettings(companyId: string, dto: any) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: dto as Prisma.CompanyUpdateInput,
    });
  }

  async createApiKey(companyId: string, dto: any, userId: string) {
    const rawKey = `vec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // In production, you would hash this before storing
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = rawKey; // Stub: store raw for now

    const inputName =
      dto && typeof dto === 'object' && 'name' in (dto as object)
        ? (dto as { name: string }).name
        : 'New API Key';

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
    await this.prisma.notification.delete({
      where: { id: notificationId, user_id: userId },
    });
  }
}
