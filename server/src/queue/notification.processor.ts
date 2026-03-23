import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin safely
try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
} catch {
  // Ignored or logged in production
}

interface DeliverJobData {
  notificationId: string;
  userId: string;
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Handles the 'deliver' job dispatched by NotificationsService.
   */
  @Process('deliver')
  async handleDeliver(job: Job<DeliverJobData>): Promise<void> {
    const { notificationId, userId } = job.data;
    this.logger.log(
      `Delivering notification ${notificationId} to user ${userId}`,
    );

    try {
      // 1. Fetch full notification
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });
      if (!notification) return;

      // 2. Emit via WebSocket to Web dashboard
      this.notificationsGateway.sendToUser(userId, notification);

      // 3. Emit via FCM to Mobile (Drivers only)
      const driver = await this.prisma.driver.findFirst({
        where: { user_id: userId },
        select: { fcm_token: true },
      });

      if (driver?.fcm_token) {
        const fcmToken = driver.fcm_token;
        try {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: notification.data
              ? (notification.data as Record<string, string>)
              : {},
          });
          this.logger.log(`FCM push delivered to ${userId}`);
        } catch (fcmErr) {
          const errorMessage = (fcmErr as Error).message;
          this.logger.warn(`FCM push failed for ${userId}: ${errorMessage}`);
        }
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      this.logger.error(`Failed delivery processing: ${errorMessage}`);
    }
  }
}
