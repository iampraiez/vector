import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { STANDARD_QUEUE_OPTIONS } from '../queue/bull-job-options';
import { NotificationType, Prisma } from '@prisma/client';

export interface CreateNotificationPayload {
  userId: string;
  companyId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  /**
   * Creates a notification record in the database and enqueues an async
   * delivery job so future channels (push, WebSocket) can be added without
   * touching this service.
   */
  async create(payload: CreateNotificationPayload): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: {
        user_id: payload.userId,
        company_id: payload.companyId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: (payload.data ?? {}) as Prisma.JsonObject,
      },
    });

    await this.notificationQueue.add(
      'deliver',
      {
        notificationId: notification.id,
        userId: payload.userId,
      },
      STANDARD_QUEUE_OPTIONS,
    );

    this.logger.log(
      `Notification ${notification.id} created for user ${payload.userId}`,
    );
  }
}
