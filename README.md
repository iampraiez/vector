<p align="center">
  <img src="https://vector-route.vercel.app/icon.png" width="128" height="128" alt="Vector Logo" />
</p>

<h1 align="center">Vector</h1>

<p align="center">
  <strong>High-performance, production-ready delivery and fleet management platform.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Coverage-100%25-blue?style=for-the-badge" alt="Coverage" />
  <img src="https://img.shields.io/badge/License-MIT-gray?style=for-the-badge" alt="License" />
</p>

---

Vector provides a unified solution for fleet managers to optimize routes, track deliveries in real-time, and manage driver assignments, while offering drivers a streamlined mobile experience for navigation and proof-of-delivery.

## 🏗 Monorepo Architecture

The project is structured as a monorepo containing three primary components:

- **[server](file:///home/praise-olaoye/Documents/VS%20Code/vector/server)**: NestJS backend API, handling business logic, real-time updates via Socket.io, and background job processing.
- **[web](file:///home/praise-olaoye/Documents/VS%20Code/vector/web)**: React-based Fleet Management Dashboard for administrators and managers.
- **[client](file:///home/praise-olaoye/Documents/VS%20Code/vector/client)**: Flutter mobile application for drivers to receive assignments and update delivery status.

## 🛠 Tech Stack

### Backend (Server)
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Caching & Queues**: Redis & BullMQ
- **Real-time**: Socket.io
- **Payments**: Paystack Integration
- **Notifications**: Firebase Cloud Messaging (FCM)

### Frontend (Web)
- **Framework**: React (Vite)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Maps**: Leaflet

### Mobile (Client)
- **Framework**: Flutter (Dart)
- **Maps**: Google Maps SDK

---

## 🚀 Getting Started

### 1. Infrastructure (Docker)
Start the required infrastructure services (PostgreSQL and Redis):
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd server
pnpm install
cp .env.example .env
pnpm generate  # Generate Prisma client
pnpm dev       # Run in development mode
```

### 3. Web Dashboard Setup
```bash
cd web
pnpm install
cp .env.example .env
pnpm start     # Run Vite dev server
```

### 4. Mobile Client Setup
Ensure you have the Flutter SDK installed.
```bash
cd client
flutter pub get
# Configure config.json with your local API URL
flutter run
```

---

## 🛡 Production Readiness

Vector has undergone a comprehensive production-readiness audit focusing on:
- **Security**: Rate limiting, secure OTP generation, and bipartite session rotation.
- **Reliability**: Atomic billing transactions and robust background job processing.
- **Testing**: 100% pass rate on critical service unit tests (`Auth`, `Billing`, `Tracking`, `Routes`).

---

## 📄 License
MIT
