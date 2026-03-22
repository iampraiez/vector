## Solved

| Item | Description | Status |
|---|---|---|
| 1.1 | `optimizeAssignments` / `createOptimizedRoute` stop status filter now includes `pending` and `assigned` | ✅ Done |
| 1.2 | Mark as Arrived calls `arriveAtStop` before proof screen; try/catch + SnackBar; tracking stopped after success | ✅ Done |
| 6.1 | Same flow: loading state on button; `DriverApiService.arriveAtStop` fixed to `PATCH /driver/navigation/stops/:id/arrive` | ✅ Done |
| 6.3 | PoD uploads photo to Cloudinary via unsigned preset; `completeDelivery` receives `secure_url`; build-time `Env` dart-defines | ✅ Done |

## Currently Working On

| Item | Description |
|---|---|
| 6.2 | QR scan validation — include `tracking_token` in API payloads; compare scan to token in `proof_delivery.dart` |
