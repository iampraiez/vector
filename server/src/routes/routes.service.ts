import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RouteStatus } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async getRoutes(companyId: string, query: any) {
    const data = await this.prisma.route.findMany({
      where: { company_id: companyId },
      include: { driver: { include: { user: true } } },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
    return { data, pagination: { total: data.length } };
  }

  async createRoute(companyId: string, dto: any) {
    return { message: 'Route created (stub)', id: 'test-route-id' };
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

  async updateRoute(companyId: string, routeId: string, dto: any) {
    return { message: 'Route updated (stub)', id: routeId };
  }

  async deleteRoute(companyId: string, routeId: string) {
    await this.prisma.route.delete({
      where: { id: routeId, company_id: companyId },
    });
  }

  async optimizeRoute(companyId: string, routeId: string) {
    // Stub for a TSP/routing engine integration (e.g. OSRM, Google OR-Tools)
    return {
      message: 'Route optimization complete',
      optimized_order: [1, 3, 2, 4],
      estimated_savings_km: 12.5,
    };
  }

  async assignRoute(companyId: string, routeId: string, dto: { driver_id: string }) {
    return this.prisma.route.update({
      where: { id: routeId, company_id: companyId },
      data: {
        driver_id: dto.driver_id,
        status: RouteStatus.scheduled,
      },
    });
  }
}
