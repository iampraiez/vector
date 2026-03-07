import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateOrderDto, PaginationDto, UpdateOrderDto, ReportQueryDto, ChangePlanDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getMetrics(companyId: string) {
    const [activeDrivers, pendingOrders] = await Promise.all([
      this.prisma.driver.count({
        where: { company_id: companyId, status: 'active' },
      }),
      this.prisma.stop.count({
        where: { company_id: companyId, status: 'unassigned' },
      }),
    ]);

    return {
      active_drivers: activeDrivers,
      active_drivers_change: '+0',
      pending_orders: pendingOrders,
      pending_orders_change: '+0',
      on_time_rate: 98.5,
      on_time_rate_change: '+1.2',
      fuel_saved_usd: 120,
      fuel_saved_change: '+5',
    };
  }

  async getActiveDrivers(companyId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: { company_id: companyId, status: 'active' },
      include: { user: { select: { full_name: true, avatar_url: true } } }
    });

    return {
      drivers: drivers.map(d => ({
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

  async getOrders(companyId: string, query: PaginationDto & { status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { company_id: companyId };
    if (query.status && query.status !== 'all') {
      where.status = query.status;
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

    const formattedData = data.map(stop => ({
      ...stop,
      driver_name: stop.driver?.user.full_name,
      route_name: stop.route?.name,
    }));

    return {
      data: formattedData,
      pagination: {
        page, limit, total, total_pages: Math.ceil(total / limit),
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

    const stats: Record<string, number> = { total: 0, unassigned: 0, assigned: 0, in_progress: 0, completed: 0, failed: 0 };
    stops.forEach(s => {
      stats[s.status] = s._count;
      stats.total += s._count;
    });
    return stats;
  }

  async updateOrder(companyId: string, stopId: string, dto: UpdateOrderDto) {
    return this.prisma.stop.update({
      where: { id: stopId, company_id: companyId },
      data: dto as any,
    });
  }

  async deleteOrder(companyId: string, stopId: string) {
    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId, company_id: companyId },
    });

    if (!stop) throw new NotFoundException('Order not found');
    if (['in_progress', 'completed'].includes(stop.status)) {
      throw new ConflictException('Cannot delete an order that is in progress or completed.');
    }

    await this.prisma.stop.delete({ where: { id: stopId } });
  }

  async getDrivers(companyId: string, query: PaginationDto & { status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { company_id: companyId };
    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }
    if (query.search) {
      where.user = {
        OR: [
          { full_name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ]
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

    const formatted = data.map(d => ({
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
        page, limit, total, total_pages: Math.ceil(total / limit),
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

  async createDriverInvite(companyId: string, dto: any) {
    // In a real app, you would:
    // 1. Create a user record with a generic password
    // 2. Or create an invite token in Redis and send an email
    
    // For this stub, we return a mock response
    return {
      message: 'Driver invite sent successfully',
      temp_password: 'vector-temp-pass', 
    };
  }

  async updateDriver(companyId: string, driverId: string, dto: any) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId, company_id: companyId },
      include: { user: true }
    });
    
    if (!driver) throw new NotFoundException('Driver not found');

    // Split updates between User table and Driver profile
    const userUpdateData: any = {};
    if (dto.full_name) userUpdateData.full_name = dto.full_name;
    if (dto.phone) userUpdateData.phone = dto.phone;

    const driverUpdateData: any = {};
    if (dto.status) driverUpdateData.status = dto.status;
    if (dto.vehicle_type) driverUpdateData.vehicle_type = dto.vehicle_type;
    if (dto.vehicle_plate) driverUpdateData.vehicle_plate = dto.vehicle_plate;

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
      }
    });

    return {
      drivers: drivers.map(d => ({
        id: d.id,
        name: d.user.full_name,
        status: d.status,
        lat: d.current_lat,
        lng: d.current_lng,
        location_name: d.current_location_name,
        last_active_at: d.last_active_at,
      }))
    };
  }

  async getReportSummary(companyId: string, query: ReportQueryDto) {
    // Stub implementation for report summary logic
    return {
      total_deliveries: 1250,
      total_distance_km: 8400.5,
      avg_delivery_time_min: 45,
      success_rate: 98.2,
      fuel_saved_usd: 450,
    };
  }

  async getReportCharts(companyId: string, query: ReportQueryDto) {
    // Stub implementation
    return {
      deliveries_by_day: [
        { date: '2024-03-01', count: 42 },
        { date: '2024-03-02', count: 38 },
      ],
      success_rate_trend: [
        { date: '2024-03-01', rate: 97.5 },
        { date: '2024-03-02', rate: 98.1 },
      ]
    };
  }

  async getDriverPerformance(companyId: string, query: ReportQueryDto & PaginationDto) {
    // Basic implementation
    const drivers = await this.prisma.driver.findMany({
      where: { company_id: companyId },
      include: { user: true },
      take: query.limit || 20,
    });

    return {
      data: drivers.map(d => ({
        driver_id: d.id,
        name: d.user.full_name,
        deliveries_completed: d.total_deliveries,
        on_time_rate: 98.0, // stub
        rating: d.avg_rating,
      })),
      pagination: { page: 1, limit: query.limit || 20, total: drivers.length, total_pages: 1 }
    };
  }

  async getBillingInfo(companyId: string) {
    const record = await this.prisma.billingRecord.findFirst({
      where: { company_id: companyId, status: 'active' },
      orderBy: { created_at: 'desc' }
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
        current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
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
    // Stub for Paystack integration
    return {
      message: 'Plan change initiated',
      checkout_url: 'https://paystack.com/pay/stub',
    };
  }

  async updatePaymentMethod(companyId: string) {
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

    return { message: 'Plan will be canceled at the end of the billing period.' };
  }

  async getSettings(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        api_keys: {
          select: { id: true, name: true, key_prefix: true, created_at: true, last_used_at: true }
        }
      }
    });

    if (!company) throw new NotFoundException('Company not found');

    return { company };
  }

  async updateSettings(companyId: string, dto: any) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: dto as any,
    });
  }

  async createApiKey(companyId: string, dto: any, userId: string) {
    const rawKey = `vec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // In production, you would hash this before storing
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = rawKey; // Stub: store raw for now

    const apiKey = await this.prisma.apiKey.create({
      data: {
        company_id: companyId,
        name: dto.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        created_by: userId,
      }
    });

    return {
      message: 'API Key created successfully. Store it now as it will not be shown again.',
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


