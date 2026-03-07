# Vector Server

Vector is a high-performance, modular fleet management and route optimization platform built with NestJS. It provides a robust backend for both a web-based administration dashboard and a mobile application for drivers.

## 🚀 Key Features

### 👤 Authentication & Security
- **Multi-Role Support**: Granular access control for Admins, Managers, and Drivers.
- **Secure Onboarding**: Dedicated signup flows for fleet owners and individual drivers.
- **JWT Strategy**: Dual-token system (Access + Refresh) with Redis-backed session management.
- **Security First**: Integrated with Helmet, CORS, and Rate Limiting.

### 📊 Dashboard (Web API)
- **Fleet Overview**: Real-time metrics on deliveries, active drivers, and success rates.
- **Order Management**: Full CRUD for delivery stops with priority and window tracking.
- **Driver Management**: Invite system, performance tracking, and live status monitoring.
- **Reports**: Data-driven insights on distance, fuel savings, and time efficiency.
- **Billing**: Integration with Paystack for subscription and invoice management.

### 📱 Driver App (Mobile API)
- **Real-Time Status**: Seamless state transitions (Active, Idle, Offline).
- **Assignments**: Instant push-ready notification payloads for new route assignments.
- **Navigation**: Route sequence optimization and OSRM-ready data structures.
- **Delivery Verification**: Support for signatures, photos, and failure reason logging.

### 📍 Public Tracking
- **Live Customer View**: Token-based tracking links for customers to view delivery progress and driver location without authentication.
- **Rating System**: Post-delivery feedback loop for customer satisfaction.

---

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Caching**: [Redis](https://redis.io/) (ioredis)
- **Background Jobs**: [BullMQ](https://docs.bullmq.io/)
- **Authentication**: Passport-JWT & Bcrypt
- **Documentation**: Swagger/OpenAPI

---

## 📂 Project Structure

```text
src/
├── auth/               # JWT authentication & session logic
├── common/             # Global filters, interceptors, & decorators
├── config/             # Environment configuration
├── dashboard/          # Web app endpoints (8 sub-controllers)
├── driver/             # Mobile app endpoints (11 sub-controllers)
├── health/             # System health checks (DB & Redis)
├── mail/               # Asynchronous email service
├── prisma/             # Database service & client
├── queue/              # BullMQ configuration for workers
├── redis/              # Caching & Rate-limit service
├── routes/             # Route optimization & assignment logic
└── tracking/           # Public-facing tracking service
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v20+)
- pnpm (v10+)
- PostgreSQL & Redis instances

### Installation
1. Clone the repository and navigate to the server directory.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Generate Prisma client:
   ```bash
   pnpm exec prisma generate
   ```

### Running the Server
```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

---

## 📝 API Standards

The server follows a standardized response format for all endpoints:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Optional success message",
  "pagination": { "total": 100, "page": 1, ... }
}
```

**Error Response:**
```json
{
  "error": "not_found",
  "message": "Resource not found",
  "details": { ... }
}
```

---

## 📄 License
Vector is [MIT licensed](LICENSE).
