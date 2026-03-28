# Vector Server

High-performance NestJS API powering the Vector delivery platform. Built with a focus on security, real-time observability, and scalable background processing.

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Caching & Sessions**: Redis
- **Task Queue**: [BullMQ](https://docs.bullmq.io/)
- **Real-time**: Socket.io
- **Documentation**: Swagger/OpenAPI

## 📂 Project Structure

- `src/auth`: Authentication, JWT rotation, and role-based access control.
- `src/billing`: Paystack integration, webhook handlers, and idempotency logic.
- `src/driver`: Driver profile management and assignment tracking.
- `src/routes`: Route optimization and assignment logic.
- `src/tracking`: Real-time tracking, geolocation updates, and customer ratings.
- `src/notifications`: Firebase Cloud Messaging (FCM) integration.
- `src/prisma`: Database client and service.
- `src/redis`: Redis client and session management.

## ⚙️ Environment Variables

Create a `.env` file in the `server` root based on `.env.example`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string (e.g. `redis://localhost:6379`) |
| `JWT_ACCESS_SECRET` | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `PAYSTACK_SECRET_KEY` | Paystack API secret |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase service account JSON |

## 🚀 Development

### Installation
```bash
pnpm install
```

### Database Migration
```bash
npx prisma migrate dev
pnpm generate
```

### Running the App
```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## 📚 API Documentation

When running in development mode, you can access the interactive Swagger UI:
- **URL**: `http://localhost:8080/api-docs`
- **Spec**: An `openapi.yaml` is also automatically generated in the root on startup.

## 🧪 Testing

The server uses Jest for unit and e2e testing.

```bash
# Unit tests
pnpm test

# Critical service tests
pnpm test auth.service.spec.ts billing.service.spec.ts tracking.service.spec.ts routes.service.spec.ts

# E2E tests
pnpm test:e2e
```

## 🏗 Background Jobs

Vector uses BullMQ for asynchronous operations:
- **Email Queue**: Handles transactional emails (verification, tracking links).
- **Notification Queue**: Processes FCM push notifications to drivers.

Refer to `src/queue` for processor implementations.
