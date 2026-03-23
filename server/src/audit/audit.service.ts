import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditLogInput = {
  companyId: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValue?: unknown;
  newValue?: unknown;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          company_id: input.companyId,
          user_id: input.userId ?? undefined,
          action: input.action,
          resource_type: input.resourceType,
          resource_id: input.resourceId,
          old_value:
            input.oldValue === undefined
              ? undefined
              : (input.oldValue as Prisma.InputJsonValue),
          new_value:
            input.newValue === undefined
              ? undefined
              : (input.newValue as Prisma.InputJsonValue),
        },
      });
    } catch (err) {
      this.logger.warn(`Audit log failed (${input.action}): ${String(err)}`);
    }
  }
}
