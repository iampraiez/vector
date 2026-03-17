import { PrismaClient } from '@prisma/client';
import { ReportQueryDto } from '../dto/dashboard.dto';

export async function generateReportCsv(
  prisma: PrismaClient,
  companyId: string,
  query: ReportQueryDto,
): Promise<string> {
  const where: Record<string, any> = { company_id: companyId };
  if (query.start_date || query.end_date) {
    const createdAt: Record<string, any> = {};
    if (query.start_date) createdAt.gte = new Date(query.start_date);
    if (query.end_date) createdAt.lte = new Date(query.end_date);
    where.created_at = createdAt;
  }

  const stops = await prisma.stop.findMany({
    where,
    include: { driver: { include: { user: true } }, route: true },
    orderBy: { created_at: 'desc' },
    take: 2000,
  });

  const header = [
    'ID',
    'External ID',
    'Customer',
    'Address',
    'Status',
    'Driver',
    'Route',
    'Created At',
  ];
  const rows = stops.map((s) => {
    const driverName = s.driver?.user.full_name || 'Unassigned';
    const routeName = s.route?.name || 'Unrouted';
    return [
      s.id,
      s.external_id || '',
      `"${s.customer_name.replace(/"/g, '""')}"`,
      `"${s.address.replace(/"/g, '""')}"`,
      s.status,
      `"${driverName}"`,
      `"${routeName}"`,
      s.created_at.toISOString(),
    ];
  });

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
