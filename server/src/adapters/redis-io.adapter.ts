/**
 * Redis IO Adapter — Fix for the "Single-Node WebSocket Trap"
 *
 * THE PROBLEM:
 *   Socket.io maintains room membership in memory, local to each server process.
 *   When you run 2+ instances behind a Load Balancer, a message emitted from
 *   Instance A is NEVER delivered to a client connected to Instance B.
 *
 * THE FIX:
 *   The Redis Adapter replaces Socket.io's default in-memory transport with
 *   a Redis Pub/Sub channel. Every instance subscribes to the same Redis
 *   channel. When Instance A broadcasts to `user:abc`, it publishes to Redis.
 *   Redis instantly forwards that message to Instance B and C, which then
 *   deliver it to their locally connected clients.
 *
 *   Think of Redis as a "radio tower" that all instances listen to.
 *
 *   We use ioredis (already a project dependency) instead of the redis v4
 *   client to avoid adding an extra package.
 */
import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  /**
   * Must be called once before app.listen().
   * Creates two ioredis connections: one for publishing and one for subscribing.
   * Socket.io needs separate clients because a Redis client in "subscribe" mode
   * cannot issue regular commands.
   */
  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL not set. Falling back to default in-memory Socket.io adapter. ' +
          'Multi-instance WebSocket sync WILL NOT WORK.',
      );
      return;
    }

    const pubClient = new Redis(redisUrl, { lazyConnect: false });
    // subClient is a duplicate connection used exclusively for SUBSCRIBE commands
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err: Error) =>
      this.logger.error('Redis pub client error', err.message),
    );
    subClient.on('error', (err: Error) =>
      this.logger.error('Redis sub client error', err.message),
    );

    // Wait for both connections to be ready before building the adapter
    await Promise.all([
      new Promise<void>((res) => pubClient.once('ready', res)),
      new Promise<void>((res) => subClient.once('ready', res)),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
    this.logger.log('Socket.io Redis adapter connected successfully.');
  }

  /**
   * NestJS calls createIOServer internally. We intercept it to inject the
   * Redis adapter so Socket.io picks it up for all room broadcasts.
   */
  createIOServer(port: number, options?: ServerOptions): unknown {
    const server = super.createIOServer(port, options) as {
      adapter: (a: ReturnType<typeof createAdapter>) => void;
    };

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      this.logger.log('Redis adapter registered on Socket.io server.');
    }

    return server;
  }
}
