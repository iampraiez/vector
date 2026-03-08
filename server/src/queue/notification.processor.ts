import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

interface DeliverJobData {
  notificationId: string;
  userId: string;
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  /**
   * Handles the 'deliver' job dispatched by NotificationsService.
   *
   * Currently logs the delivery. When you add real-time channels (e.g.
   * Socket.io gateway, push notifications), call them here – the database
   * record already exists by the time this runs.
   */
  @Process('deliver')
  handleDeliver(job: Job<DeliverJobData>): void {
    const { notificationId, userId } = job.data;
    this.logger.log(
      `Delivering notification ${notificationId} to user ${userId}`,
    );

    // TODO: emit via Socket.io gateway once WebSocket support is added
    // this.notificationsGateway.sendToUser(userId, { notificationId });
  }
}
