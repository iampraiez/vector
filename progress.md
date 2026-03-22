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

## Currently Working On

| Item | Description |
|---|---|
| _(none — say “yes do” for next)_ | Per `complete.md` priority table, next P2 item is **1.11 + 3** (cosmetic toggle / any-type) unless you prefer another unchecked item |

## §4 not done yet (same section)

- `GET /health/detailed` (Terminus)
- `AuditService` + calls
- `docker-compose` / CI workflows
- (Did not add `cache-manager`; default throttler storage is in-memory.)
