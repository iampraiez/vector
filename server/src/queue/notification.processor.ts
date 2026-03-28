import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
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
  @Process({ name: 'deliver', concurrency: 1 })
  async handleDeliver(job: Bull.Job<DeliverJobData>): Promise<void> {
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
          this.logger.debug(
            `Sending FCM to token: ${fcmToken.substring(0, 10)}...`,
          );
          const response = await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: notification.data
              ? (notification.data as Record<string, string>)
              : {},
          });
          this.logger.log(
            `FCM push delivered to ${userId}. Message ID: ${response}`,
          );
        } catch (fcmErr) {
          const errorMessage = (fcmErr as Error).message;
          this.logger.error(
            `FCM push failed for user ${userId}: ${errorMessage}`,
            (fcmErr as Error).stack,
          );

          // Optional: If token is invalid, we could clear it
          if (errorMessage.includes('registration-token-not-registered')) {
            this.logger.warn(
              `Token for user ${userId} is invalid. Clearing...`,
            );
            await this.prisma.driver.updateMany({
              where: { user_id: userId },
              data: { fcm_token: null },
            });
          }
        }
      } else {
        this.logger.debug(
          `No FCM token found for user ${userId}, skipping push.`,
        );
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      this.logger.error(`Failed delivery processing: ${errorMessage}`);
    }
  }
}
