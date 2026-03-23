## Solved

| Item | Description | Status |
|---|---|---|
| 1.1 | `optimizeAssignments` / `createOptimizedRoute` stop status filter now includes `pending` and `assigned` | ✅ Done |
| 1.2 | Mark as Arrived calls `arriveAtStop` before proof screen; try/catch + SnackBar; tracking stopped after success | ✅ Done |
| 6.1 | Same flow: loading state on button; `DriverApiService.arriveAtStop` fixed to `PATCH /driver/navigation/stops/:id/arrive` | ✅ Done |
| 6.3 | PoD uploads photo to Cloudinary via unsigned preset; `completeDelivery` receives `secure_url`; build-time `Env` dart-defines | ✅ Done |
| 6.2 | `tracking_token` on assignment/preview stops; PoD QR must match token; mock stops include test tokens | ✅ Done |
| 2.1 | `tracking_email_sent_at` on Stop; assignRoute stamps after send; startRoute only emails when null, then stamps | ✅ Done |
| 1.3 | Manager `POST /routes/:id/optimize` uses `MapService.optimizeRoute` + `getDirections`; updates sequences and route totals in a transaction | ✅ Done |
| 2.3 | `signUpDriver` enforces `BillingRecord.seats_included` vs driver count for the company | ✅ Done |
| 5.2 | Customer tracking page: `qrcode.react` canvas encodes `trackingToken`; Save QR downloads PNG | ✅ Done |
| P1 infra (partial §4) | Joi startup validation (+ `APP_URL`); `STANDARD_QUEUE_OPTIONS` on all email/account/notification jobs; `ThrottlerGuard` on auth (10/min, forgot 3/min, `SkipThrottle` on JWT routes + refresh); Redis client + Bull use `getOrThrow('REDIS_URL')`; no `APP_URL` fallbacks | ✅ Done |
| 6.4 | Android: `flutter_foreground_task` + manifest FGS/location; isolate PATCHes `/driver/status/location`; UI map updates via `sendDataToMain`; stop on dispose / route end; iOS keeps periodic `MapService` sync | ✅ Done |
| 2.2 | `NotificationsService.create` from `assignRoute`, `startRoute`, `failDelivery` (manager), `refreshOrderStatuses` auto-fail (driver or company admin), `rateDelivery` (driver); Prisma enum `rating_received` + migration | ✅ Done |
| 1.10 | `route_preview`: use server `lat`/`lng` when present; Geoapify geocode only as fallback | ✅ Done |
| 1.11 + §3 | `new_route` auto-optimize + `persist` on optimize API; DTOs for profile/avatar/settings; JWT expiresIn typed without `any` | ✅ Done |
| 5.1 | Web: `orders/:id` route + eye buttons; `fetchOrderDetail` clears stale state + `route_name` from `route.name` | ✅ Done |
| 5.3 | Customer tracking: 30s `GET /track` poll, last-updated label, map link when `liveLocation` set | ✅ Done |
| 5.4 | Billing: invoice table + `checkout_url` redirect + Paystack stubs; cancel + `cancel_at_period_end` banner; store `cancel` URL fix | ✅ Done |
| 5.5 | Web onboarding: metrics `total_drivers` / `company_code`; Overview banner; Orders modal via location state; Drivers + Orders empty states | ✅ Done |
| 5.6 | Fleet map: null-safe coords + popups; Tracking 18s polling; UI “Position unknown” + grey dots; map popup last-update timestamp | ✅ Done |
| 5.7 | Orders + OrderDetail: copy customer tracking URL per stop (`tracking_token`); shared `trackingLink` util | ✅ Done |
| §8 (partial) | Server Jest: auth + driver + dashboard specs; Web Vitest: tracking + format tests (`pnpm test`) | ✅ Done |
| §8.3 | Flutter widget tests (PoD + home) | ⏸️ Skipped for now |
| 1.5 | Driver `uploadAvatar`: require non-empty Cloudinary `https://res.cloudinary.com/...` URL | ✅ Done |
| 1.6 | Shared `VECT-####` `generateCompanyCode()`; fleet signup + dashboard regenerate with uniqueness | ✅ Done |
| 1.7 | Driver `clear_data`: report to driver email + optional fleet copy; template variants | ✅ Done |
| 1.4 | Driver `is_active`; `leaveCompany` unassigns pending/assigned stops + deactivates; JWT blocks inactive drivers; `signUpDriver` reactivates same email; seats + fleet lists count/track active drivers only | ✅ Done |
| 1.8 | Flutter Assignments: third **Done** tab renders API `completed` (today); cards for completed / cancelled / failed / returned; no tap-to-nav or optimize selection on that tab | ✅ Done |
| §4 (remaining) | `GET /health/detailed` (Terminus: DB, Redis, Geoapify); global `AuditService` + logs on delete order/driver, change plan, regenerate code, post–clear-data job; root `docker-compose.yml`; `.env.local.example`; `.github/workflows/ci.yml` (server build+test, web build) | ✅ Done |

## Currently Working On

| Item | Description |
|---|---|
| _(none — say “yes do” for next)_ | **§10** push |

## §4 notes

- (Still no `cache-manager`; default throttler storage is in-memory.)
