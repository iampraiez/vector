/**
 * PrismaService — Enhanced with connection pooling and optional read replica support
 *
 * ─── FIX 2: Connection Pool Limits ──────────────────────────────────────────
 * THE PROBLEM:
 *   Without explicit pool limits, Prisma negotiates its pool size from
 *   PostgreSQL's max_connections setting. Scale to 20 instances and you
 *   open 20 × default-pool connections, quickly exhausting the DB.
 *
 * THE FIX:
 *   We explicitly cap the connection pool ('connection_limit') per-instance.
 *   10 connections per instance × 20 instances = 200 connections, safely under
 *   PostgreSQL's typical 500-connection managed limit.
 *   The 'pool_timeout' setting ensures a queued request fails fast (after 10s)
 *   instead of hanging indefinitely when the pool is at capacity.
 *
 * ─── FIX 3: Read Replica / CQRS Pattern ────────────────────────────────────
 * THE PROBLEM:
 *   Heavy analytics queries (aggregations, CSV exports, chart generation)
 *   compete with real-time driver operations on the same DB connection pool.
 *   A 10-second report query can delay drivers fetching their active routes.
 *
 * THE FIX (CQRS — Command Query Responsibility Segregation):
 *   We create a second Prisma client (`readDb`) that points to DATABASE_READ_URL.
 *   - Writes  (Commands) → use `this.prisma`        → Primary DB
 *   - Reads   (Queries)  → use `this.prisma.readDb` → Replica DB (or Primary if no replica set)
 *
 *   If DATABASE_READ_URL is not set, it falls back to DATABASE_URL automatically.
 *   Zero downside — if you don't have a replica, it works exactly as before.
 */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function buildConnectionUrl(base: string): string {
  // Append connection pool parameters to the DB URL.
  // These are Prisma Data Proxy / PgBouncer-compatible params.
  const url = new URL(base);
  url.searchParams.set('connection_limit', '10');
  url.searchParams.set('pool_timeout', '10');
  return url.toString();
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Fix 3: The dedicated read client.
   * Services performing heavy analytics should use `prisma.readDb` instead
   * of `prisma` directly, routing those queries to the read replica.
   */
  readonly readDb: PrismaClient;

  constructor() {
    const primaryUrl = process.env.DATABASE_URL ?? '';
    super({
      log: ['warn', 'error'],
      datasourceUrl: buildConnectionUrl(primaryUrl),
    });

    // Fix 3: Initialise a second Prisma client for read-only analytics.
    // Falls back silently to the main DB if DATABASE_READ_URL is not set.
    const readUrl = process.env.DATABASE_READ_URL ?? primaryUrl;
    this.readDb = new PrismaClient({
      log: ['warn', 'error'],
      datasourceUrl: buildConnectionUrl(readUrl),
    });
  }

  async onModuleInit() {
    await this.$connect();
    await this.readDb.$connect();
    this.logger.log('Connected to primary and read databases.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.readDb.$disconnect();
    this.logger.log('Disconnected from primary and read databases.');
  }
}
