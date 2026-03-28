import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_URL || '*', // In production, this should be restricted to the APP_URL
  },
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected via Websocket: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected via Websocket: ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ): Promise<void> {
    this.logger.debug(`Client ${client.id} joined room user:${userId}`);
    await client.join(`user:${userId}`);
  }

  sendToUser(userId: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }
}
