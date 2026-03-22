## Solved

| Item | Description | Status |
|---|---|---|
| 1.1 | `optimizeAssignments` / `createOptimizedRoute` stop status filter now includes `pending` and `assigned` | ✅ Done |
| 1.2 | Mark as Arrived calls `arriveAtStop` before proof screen; try/catch + SnackBar; tracking stopped after success | ✅ Done |
| 6.1 | Same flow: loading state on button; `DriverApiService.arriveAtStop` fixed to `PATCH /driver/navigation/stops/:id/arrive` | ✅ Done |
| 6.3 | PoD uploads photo to Cloudinary via unsigned preset; `completeDelivery` receives `secure_url`; build-time `Env` dart-defines | ✅ Done |
| 6.2 | `tracking_token` on assignment/preview stops; PoD QR must match token; mock stops include test tokens | ✅ Done |
| 2.1 | `tracking_email_sent_at` on Stop; assignRoute stamps after send; startRoute only emails when null, then stamps | ✅ Done |

## Currently Working On

| Item | Description |
|---|---|
| 1.3 | Manager `RoutesService.optimizeRoute` — wire real `MapService` optimizer (replace mock) |
