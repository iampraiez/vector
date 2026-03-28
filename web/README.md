# Vector Fleet Dashboard

The Vector Fleet Dashboard is a modern, responsive web application for fleet managers to monitor drivers, manage orders, and analyze delivery performance in real-time.

## 🛠 Tech Stack

- **Framework**: [React](https://react.dev/) (Vite)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Leaflet](https://leafletjs.com/) via [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/) & [Heroicons](https://heroicons.com/)

## 📂 Project Structure

- `src/features`: Main application modules.
    - `auth`: Sign-in, sign-up, and onboarding flows.
    - `dashboard`: Metrics, driver management, and order tracking.
    - `tracking`: Live customer-facing tracking page.
- `src/components`: Reusable UI components and Shadcn primitives.
- `src/store`: Zustand stores for global state (auth, drivers, orders, etc.).
- `src/lib`: Third-party configurations (Axios, Socket.io).
- `src/hooks`: Custom React hooks for business logic.

## 🚀 Getting Started

### Installation
```bash
pnpm install
```

### Environment Variables
Create a `.env` file in the `web` root:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Vector Dashboard
VITE_ENVIRONMENT=development
```

### Running Locally
```bash
pnpm start
```

### Quality Assurance
```bash
# Linting
pnpm lint

# Testing (Vitest)
pnpm test
```

## ✨ Key Features

- **Live Tracking**: Real-time map view of all active drivers and delivery progress.
- **Fleet Management**: Monitor driver performance, ratings, and active statuses.
- **Order Management**: Create, assign, and optimize delivery routes.
- **Analytics**: Comprehensive reports on on-time rates and delivery efficiency.
- **Billing**: Manage subscriptions and view payment history via Paystack.

## 🎨 Styling & Design

The dashboard uses a "Glassmorphism" aesthetic with a focus on emerald and neutral tones.
- **Theming**: Integrated with `next-themes` for potential dark mode support.
- **Micro-animations**: Powered by `framer-motion` for smooth UI transitions.
