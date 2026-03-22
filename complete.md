# Vector — Production Completion Checklist

> **Reading guide:** Every item below is a confirmed gap or broken logic found in the actual codebase.
> `[ ]` = not done · `[/]` = in progress · `[x]` = done
> Items inside a section are roughly ordered: broken logic first, then missing features, then polish.

---

## Quick-Context Reminder

| Who | App | Joins how |
|---|---|---|
| Fleet Manager | Web dashboard | Signs up directly, gets a company code |
| Driver | Flutter app | Downloads app, enters fleet code, self-registers |
| Customer | Web tracking page | Gets a unique URL emailed when their order is assigned |

**Required environment variables (request these keys before launch)**
| Variable | Source |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | Generate a 64-char random string |
| `JWT_REFRESH_SECRET` | Generate a different 64-char random string |
| `SENDGRID_API_KEY` | [SendGrid dashboard](https://app.sendgrid.com) |
| `GEOAPIFY_API_KEY` | [Geoapify dashboard](https://myprojects.geoapify.com) — used for geocoding, routing, and route optimization |
| `FRONTEND_URL` | The deployed web URL e.g. `https://vector.app` |
| `APP_URL` | Same as `FRONTEND_URL` (tracking links embed this) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary — for unsigned uploads from Flutter |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary — create an unsigned upload preset |

---

## 1. SERVER — Broken or Flawed Logic (Fix First)

### 1.1 `optimizeAssignments` and `createOptimizedRoute` always fail silently

**File:** `driver.service.ts:981-993` and `driver.service.ts:1033-1045`

Both functions query stops with `status: 'pending'`. But driver-created routes (`createAdHocRoute`) set stops to `status: 'assigned'`, and fleet-assigned stops also start as `'assigned'`. The result is `stops.length !== dto.stopIds.length` always, so the endpoint rejects every mutation with "Some orders are invalid or already assigned."

**Fix logic:**
1. In `optimizeAssignments`, change the Prisma `where` clause from `status: 'pending'` to `status: { in: ['pending', 'assigned'] }`.
2. Do the same in `createOptimizedRoute` at line 1037.
3. No schema change or migration needed — this is purely a query filter fix.

---

### 1.2 Geofencing auto-arrive checks `'pending'` status — which stops are already beyond

**File:** `driver.service.ts:130-156` and `navigation.dart:646-650`

`updateLocation` auto-arrives at stops in `status: 'pending'`. But route start sets stops to `'pending'` (correct), while standalone stop start (`startStop at :427`) also only sets to `'pending'`. So far so good — but navigation screen's "Mark as Arrived" button at `navigation.dart:646-650` calls `_stopLocationTracking()` and pushes to proof-delivery **without ever calling the `arriveAtStop` API endpoint**. This means:
- `arrived_at` is never set on any stop.
- On-time rate calculation (`time_window vs arrived_at`) will always return null/undefined.
- Geofencing auto-arrive *is* wired correctly in concept, but becomes the only path that actually sets `arrived_at`, and it only fires while the driver is 50+ metres away since location tracking stops when the arrived button is pressed.

**Fix logic:**
1. In `navigation.dart`, inside `_buildArriveButton`'s `onTap` callback, before `Navigator.push(...)` to the proof delivery screen, call `await _api.arriveAtStop(currentStop['id'])`.
2. Wrap it in a `try/catch` — on failure show a `SnackBar` and do NOT navigate, so the driver doesn't end up on the proof screen with an un-arrived stop.
3. Move `_stopLocationTracking()` to AFTER the API call succeeds (or remove it entirely from this path, since the proof screen will dismiss the navigation screen anyway).
4. On the server, `arriveAtStop` already sets `arrived_at: new Date()` and `status: 'arrived'` — no server change needed.

---

### 1.3 `routes.service.ts:optimizeRoute` is still a mock — different from the real one

**File:** `routes.service.ts:117-146`

The web dashboard's "Optimize" button calls `POST /routes/:id/optimize` which hits `RoutesService.optimizeRoute`. This function sorts stops by UUID string alpha order and returns `estimated_savings_km: 12.5` (hardcoded). This is completely separate from `MapService.optimizeRoute` which is the real Geoapify call. The real optimizer already exists — it just hasn't been wired up here.

**Fix logic:**
1. Inject `MapService` into `RoutesService` (add it to the constructor and to `RoutesModule` imports).
2. Fetch the route's stops from the DB with their `lat`/`lng`.
3. Call `this.mapService.optimizeRoute(agentWaypoint, stops.map(s => ({ id: s.id, lat: Number(s.lat), lng: Number(s.lng) })))`. For the agent starting position, use a fixed centroid (e.g., average lat/lng of all stops) since managers don't have a GPS position.
4. Use the returned ordered list of IDs to `UPDATE` each stop's `sequence` field in the DB (wrap in a `$transaction`).
5. Recalculate `total_distance_km` and `estimated_duration_min` by calling `mapService.getDirections` on the new stop order, then update the Route record.
6. Return the updated route with re-ordered stops so the web UI can re-render the list.

---

### 1.4 `leaveCompany` has no real effect because `company_id` is required in the schema

**File:** `driver.service.ts:955-975`

The comment in `leaveCompany` says "company_id is required, so we just mark status." After calling this endpoint the driver is `status: 'offline'` but still tied to the company — they can still log in and see all company data.

**Fix logic:**
1. Add an `is_active Boolean @default(true)` field to the `Driver` model in `schema.prisma`. Run `prisma migrate dev`.
2. In `leaveCompany`, set `driver_profile.is_active = false` and unassign all current `pending`/`assigned` stops belonging to this driver (set `driver_id: null`, `status: 'unassigned'`) so the fleet manager can reassign them.
3. In the `JwtStrategy.validate`, check that `driver_profile.is_active` is `true` for users with role `'driver'`. If not, throw `UnauthorizedException('This account has been deactivated.')`.
4. For re-registration: in `signUpDriver`, if an existing user with that email has `driver_profile.is_active = false`, allow them to update their `company_id` and flip `is_active` back to `true` instead of throwing a conflict error.

---

### 1.5 `uploadAvatar` fallback is a fake Cloudinary URL

**File:** `driver.service.ts:779-789`

The server fallback is `'https://cloudinary.com/vector/new-avatar.jpg'` — a bogus URL that gets stored in the DB when no `file_url` is sent.

**Fix logic:**
1. In `uploadAvatar`, check if `dto.file_url` is falsy at the top of the method.
2. If it is, throw `new BadRequestException('file_url is required')` immediately — do not proceed.
3. Optionally add a basic URL format check: ensure the string starts with `https://res.cloudinary.com/` to confirm it is a real Cloudinary upload and not another arbitrary URL being saved.

---

### 1.6 Company code format mismatch

**File:** `auth.service.ts:220` vs `dashboard.service.ts:1002`

Fleet sign-up generates codes like `FLEET-AB12C` (random alphanumeric). The dashboard "regenerate code" button generates codes like `VECT-1234` (numeric). Two different formats break code lookups.

**Fix logic:**
1. Create a shared helper function (e.g., in `server/src/common/utils/generate-company-code.ts`):
   ```ts
   export function generateCompanyCode(): string {
     const digits = Math.floor(1000 + Math.random() * 9000).toString();
     return `VECT-${digits}`;
   }
   ```
2. Replace the inline code generation in both `auth.service.ts:220` and `dashboard.service.ts:1002` with a call to this helper.
3. Add a uniqueness check: after generating, query the DB `{ where: { company_code: generated } }` — if it already exists, regenerate (loop until unique).
4. Update any UI hints or placeholder text that show the old `FLEET-` format.

### 1.7 Customer data clearance report sends to manager's email, not driver's

**File:** `driver.service.ts:904-915` — `verifySettingsOtp` for `'clear_data'`

When a driver requests to clear their own data, the report is sent to `company?.contact_email` (the fleet manager's address), not to the driver's email. The driver gets no confirmation.

**Fix logic:**
1. In `verifySettingsOtp`, when the action is `'clear_data'`, fetch the driver's user email: `const driverEmail = driver.user.email`.
2. In the email queue job payload, set `email: driverEmail` (or pass both `driverEmail` and `company.contact_email` and modify the processor to send to both).
3. In `account.processor.ts`, update the `clearData` handler to send the report email to the driver, confirming what records were cleared and when.

---

### 1.8 `getAssignments` returns `completed` assignments to the Assignments screen

**File:** `driver.service.ts:181-263`

The query returns routes/stops with `status: 'completed'` or `'cancelled'` that were updated today. The Flutter Assignments screen only renders "Active" and "Upcoming" tabs — it doesn't have a "Completed Today" tab visible in the UI. These records are fetched, serialised, and transferred on every load, but silently discarded client-side.

**Fix logic (choose one):**
- **Option A (recommended — keep the data, show it):** In `assignments.dart`, add a third "Completed" tab to the `TabBar`/`TabBarView`. Render the `completed` key from the API response there, showing each route/stop with a green checkmark or strikethrough style. This makes the data useful rather than wasteful.
- **Option B (simpler):** Remove the `completed` include from the `getAssignments` query entirely. The driver can see history on the History screen. This is the smaller change.

---

### 1.9 `signIn` uses an unsafe cast to read `is_onboarded`

**File:** `auth.service.ts:156-158`

The `User` model doesn't have `is_onboarded` in Prisma's generated type, so a `double-cast` is used. This will silently return `false` for all drivers after any Prisma regeneration.

**Fix logic:**
1. In `schema.prisma`, add `is_onboarded Boolean @default(false)` to the `User` model.
2. Run `npx prisma migrate dev --name add_is_onboarded_to_user`.
3. Run `npx prisma generate` to regenerate the Prisma client.
4. In `auth.service.ts`, remove the `as unknown as {...}` double-cast everywhere (4 occurrences: `signIn`, `verifyEmail`, `refresh`, `updateDriverProfile`). The field is now directly typed.
5. In `completeOnboarding`, change it to `prisma.user.update({ data: { is_onboarded: true } })` instead of whatever workaround it currently uses.

---

### 1.10 `route_preview.dart` re-geocodes addresses that the server already geocoded

**File:** `route_preview.dart:128-160` — `_geocodeStopsAndDrawRoute`

When the preview screen loads it calls `MapService.instance.geocodeAddress(stop['address'])` for every stop. But the server already geocodes addresses on order creation and stores `lat`/`lng` on each stop.

**Fix logic:**
1. In `_geocodeStopsAndDrawRoute`, before calling `geocodeAddress`, check:
   ```dart
   final lat = stop['lat'] != null ? double.tryParse(stop['lat'].toString()) : null;
   final lng = stop['lng'] != null ? double.tryParse(stop['lng'].toString()) : null;
   ```
2. If both are non-null, skip the geocode API call entirely. Construct the `LatLng` directly: `LatLng(lat!, lng!)`.
3. Only call `geocodeAddress(stop['address'])` as a fallback if lat or lng is null (e.g., very old stops created before the geocode-on-create logic was added).
4. This eliminates N Geoapify API calls on every route preview load.

---

### 1.11 Auto-optimize toggle in `new_route.dart` is purely cosmetic

**File:** `new_route.dart:303-327`

The "Auto-optimize route · AI will calculate the best order" card has no state variable, no toggle, and no effect on the API call.

**Fix logic (choose one):**
- **Option A (wire it up):** Add `bool _autoOptimize = false` state. On the toggle card's `onTap`, call `setState(() => _autoOptimize = !_autoOptimize)`. In `_createRoute`, if `_autoOptimize` is true, call `await _api.optimizeAssignments({ stopIds: _stops.map((s) => s.id).toList(), currentLat: ..., currentLng: ... })` first and reorder `_stops` based on the returned sequence before sending to `createAdHocRoute`.
- **Option B (remove the card):** Delete the UI card entirely. Optimization is already available through the "Optimize" flow in the route-preview screen after creation. The card is misleading if it does nothing.

---

## 2. SERVER — Missing Business Logic

### 2.1 Tracking email is sent twice per stop on route assignment

**File:** `routes.service.ts:165-176` and `driver.service.ts:326-337`

When a manager assigns a route (`assignRoute`), tracking emails are queued for all stops. When the driver starts that same route (`startRoute`), tracking emails are queued again for all stops. Customers receive two "Your Delivery is Scheduled/Out for Delivery" emails.

**Fix logic:**
1. Add a `tracking_email_sent_at DateTime?` field to the `Stop` model in `schema.prisma`. Run migration.
2. In `assignRoute` (`routes.service.ts`), after queuing tracking emails set this timestamp: `prisma.stop.update({ where: { id: stop.id }, data: { tracking_email_sent_at: new Date() } })`.
3. In `startRoute` (`driver.service.ts`), before queuing tracking emails, filter stops: only queue for stops where `tracking_email_sent_at` is null. This way only stops that were NOT assigned via the manager flow get an email on start (i.e., driver-created ad-hoc routes).
4. Send two distinct email types: the "scheduled" email (`assignRoute`) and the "out for delivery" email (`startRoute`) — define separate SendGrid templates for each so customers get the right status language. Both can exist; just don't send both for the same stop.

---

### 2.2 In-app notifications (`Notification` table) are never written to

The schema defines `NotificationType` with `new_assignment`, `route_started`, `delivery_failed`, `rating_received`, `system_alert`. No code in the server writes to the `Notification` table. The driver's notifications screen calls `getNotifications` which always returns `[]`.

**Fix logic:**
1. Inject `NotificationsService` into `RoutesService` and `DriverService` (register it in the respective modules).
2. Add `notificationsService.create(...)` calls at these exact points:
   - In `assignRoute` (RoutesService): after DB update, call `create({ userId: driver.user_id, companyId: route.company_id, type: 'new_assignment', title: 'New Route Assigned', body: 'Route "${route.name}" has been assigned to you.' })`.
   - In `startRoute` (DriverService): call `create({ ...type: 'route_started', body: 'Your route "${route.name}" has started.' })`.
   - In `failDelivery` (DriverService): call `create({ userId: managerUser.id, ..., type: 'delivery_failed', body: 'A delivery on route "${route.name}" has failed.' })`.
   - In `refreshOrderStatuses` (DashboardService): when a stop is auto-failed, call `create({ userId: stop.driver?.user_id ?? companyAdminId, ..., type: 'delivery_failed', body: 'Order for "${stop.recipient_name}" has expired.' })`.
   - In `completeDelivery` (DriverService), if a rating exists call `create({ type: 'rating_received', body: 'You received a ${rating}/5 rating.' })`.
3. The `NotificationsService.create` already writes to the DB and enqueues a `deliver` job — those steps are already done. The only missing piece is calling it.

---

### 2.3 No seat limit enforcement

`BillingRecord.seats_included` is set on signup (2 free / 5 starter / 20 growth), but `signUpDriver` never checks it. Any number of drivers can join any company regardless of plan.

**Fix logic:**
1. In `signUpDriver` (`auth.service.ts`), after finding the company, query the current driver count:
   ```ts
   const billing = await prisma.billingRecord.findFirst({ where: { company_id: company.id } });
   const driverCount = await prisma.driver.count({ where: { company_id: company.id, is_active: true } });
   if (billing && driverCount >= billing.seats_included) {
     throw new ForbiddenException('This company has reached its driver seat limit. Ask your manager to upgrade the plan.');
   }
   ```
2. No schema change needed — `seats_included` already exists on `BillingRecord`.

---

### 2.4 Trial expiry has no effect

`BillingRecord.status` is set to `'trialing'` for paid plans on signup, with `current_period_end` set to 14 days out. Nothing in the server checks if the trial has expired and locks the account.

**Fix logic:**
1. Create a new BullMQ repeatable job definition. In `app.module.ts` (or a dedicated `BillingModule`), register a repeatable job that fires every day at midnight:
   ```ts
   await billingQueue.add('checkTrialExpiry', {}, { repeat: { cron: '0 0 * * *' } });
   ```
2. In the billing processor `handleCheckTrialExpiry`:
   - Query all `BillingRecord` where `status = 'trialing'` and `current_period_end < new Date()`.
   - For each, update `status = 'past_due'` and also set the company's `is_active = false` (or add a `subscription_locked` flag on `Company`).
   - Queue an email to the fleet manager: "Your trial has ended. Please upgrade to continue using Vector."
3. In `JwtStrategy.validate`, after fetching the user, check `company.subscription_locked` (or billing status) and throw `ForbiddenException` if locked, so all API calls return 403 until they upgrade.

---

### 2.5 `refreshOrderStatuses` fires on every dashboard page load

**File:** `dashboard.service.ts:1161-1213`

This method is called from `getOrders` and `getMetrics`. It loops through all active stops for the company and updates each one that has expired. On a company with hundreds of orders this is an O(n) loop on every request.

**Fix logic:**
1. In `app.module.ts`, register a BullMQ repeatable job:
   ```ts
   await accountQueue.add('refreshAllOrderStatuses', {}, { repeat: { every: 5 * 60 * 1000 } }); // every 5 min
   ```
2. In `account.processor.ts`, add a `@Process('refreshAllOrderStatuses')` handler that calls `dashboardService.refreshOrderStatuses(companyId)` for every active company (query `prisma.company.findMany({ where: { is_active: true } })`).
3. Remove the `await this.refreshOrderStatuses(companyId)` calls from both `getOrders` and `getMetrics`.
4. The dashboard will display the last known statuses (which are at most 5 min stale) rather than doing a live mutation sweep on every page load.

---

### 2.6 `getSettings` / `updateSettings` are pure stubs with no DB write

**File:** `driver.service.ts:791-806`

`getSettings` returns a hardcoded object. `updateSettings` accepts a DTO, echoes it back, and writes nothing to the database.

**Fix logic:**
1. In `schema.prisma`, add a JSON field to the `Driver` model:
   ```prisma
   settings Json @default("{}")
   ```
   Run migration.
2. Define a `UpdateDriverSettingsDto` interface with the specific keys: `notifications_enabled`, `sound_enabled`, `vibration_enabled`, `dark_mode`, `compact_view`, etc.
3. In `getSettings`, return `driver.settings ?? defaultSettings` where `defaultSettings` is the existing hardcoded object (now used as a default only).
4. In `updateSettings`, do a Prisma deep merge:
   ```ts
   const current = (driver.settings as Record<string, unknown>) ?? {};
   await prisma.driver.update({ where: { id: driver.id }, data: { settings: { ...current, ...dto } } });
   ```

---

### 2.7 `on_time_rate` in driver performance is hardcoded

**File:** `dashboard.service.ts:762`

Every driver shows `on_time_rate: 98.0` regardless of actual delivery history.

**Fix logic (implement after item 1.2 is fixed so `arrived_at` is populated):**
1. In the driver performance query in `getDriverPerformance`, add:
   ```ts
   const completedStops = await prisma.stop.findMany({
     where: { driver_id: driver.id, status: 'completed', time_window_end: { not: null } }
   });
   const onTimeCount = completedStops.filter(s => s.arrived_at && s.time_window_end && s.arrived_at <= s.time_window_end).length;
   const onTimeRate = completedStops.length > 0 ? (onTimeCount / completedStops.length) * 100 : null;
   ```
2. Return `on_time_rate: onTimeRate` (can be null if no time-windowed stops exist yet — the UI should show "N/A" in that case).

---

### 2.8 `getMetrics` dashboard stats are partially mocked

**File:** `dashboard.service.ts:94-98`

`active_drivers_change`, `on_time_rate_change`, `fuel_saved_usd`, `fuel_saved_change` all return `'+0'` or `0`. `rating` defaults to `4.8` if no ratings exist.

**Fix logic:**
1. For change stats, the `getMetrics` DTO already accepts a `period` param (`'day' | 'week'`). Define a `getPreviousPeriodStart` helper that returns the start of the previous day/week.
2. Compute `current_count` (e.g. active deliveries this period) and `previous_count` (same metric, previous period window).
3. Format the change as `current_count >= previous_count ? '+X' : '-X'`.
4. **Remove `fuel_saved_usd` and `fuel_saved_change` entirely** — there is no fuel cost model in the schema. Delete the fields from the response DTO and the frontend card.
5. For `rating`: keep returning `null` if no ratings exist yet — display "No ratings yet" in the web UI instead of a fake `4.8`.

---

## 3. SERVER — Code Quality (No-any rule violations)

The user rules state **there must never be `type: any`**. Current violations:

**Fix logic for all four violations:**

**`driver.service.ts:742` — `updateProfile(userId: string, dto: any)`**
Create `UpdateDriverProfileInputDto` in `driver/dto/`:
```ts
export class UpdateDriverProfileInputDto {
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() vehicle_type?: string;
  @IsOptional() @IsString() vehicle_plate?: string;
  @IsOptional() @IsString() bio?: string;
}
```

**`driver.service.ts:779` — `uploadAvatar(userId: string, dto: any)`**
Create `UploadAvatarDto`:
```ts
export class UploadAvatarDto {
  @IsString() @IsNotEmpty() file_url: string;
}
```

**`driver.service.ts:801` — `updateSettings(_userId: string, dto: any)`**
Create `UpdateDriverSettingsDto`:
```ts
export class UpdateDriverSettingsDto {
  @IsOptional() @IsBoolean() notifications_enabled?: boolean;
  @IsOptional() @IsBoolean() sound_enabled?: boolean;
  @IsOptional() @IsBoolean() vibration_enabled?: boolean;
  @IsOptional() @IsBoolean() dark_mode?: boolean;
  @IsOptional() @IsBoolean() compact_view?: boolean;
}
```

**`auth.service.ts:74, 82` — `expiresIn: ... as any`**
Replace with a typed string union. The correct type for `expiresIn` in the `@nestjs/jwt` sign options is `string | number`. Replace `as any` with `as string`:
```ts
expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as string,
```
This is type-safe because `expiresIn` on the `SignOptions` type accepts `string | number | undefined`.

---

## 4. SERVER — Infrastructure / Gaps

**No startup environment variable validation**
The server starts silently and crashes at runtime if any env var is missing.
**Fix:** Install `joi` package. In `app.module.ts`, update `ConfigModule.forRoot()`:
```ts
ConfigModule.forRoot({
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    SENDGRID_API_KEY: Joi.string().required(),
    GEOAPIFY_API_KEY: Joi.string().required(),
    FRONTEND_URL: Joi.string().uri().required(),
    CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    CLOUDINARY_UPLOAD_PRESET: Joi.string().required(),
  }),
  validationOptions: { abortEarly: true },
})
```
The server will throw on startup and refuse to run if any required variable is missing.

---

**No rate limiting on auth endpoints**
Brute-force attacks on `/auth/sign-in`, `/auth/forgot-password`, and `/auth/sign-up` are unguarded.
**Fix:**
1. Install `@nestjs/throttler` and `cache-manager`.
2. Register `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])` in `app.module.ts` (10 requests per minute per IP).
3. Apply `@UseGuards(ThrottlerGuard)` to `AuthController` or add the guard globally.
4. For sensitive routes like `/forgot-password`, use a stricter limit: `@Throttle({ default: { limit: 3, ttl: 60000 } })`.

---

**BullMQ jobs have no retry policy**
If SendGrid times out or returns a 5xx, the job fails silently and no email is ever sent.
**Fix:** Every `emailQueue.add(...)` call must pass retry options:
```ts
await this.emailQueue.add('sendVerification', { email, token }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }, // 5s, 10s, 20s
  removeOnComplete: true,
  removeOnFail: 100, // keep last 100 failed jobs for inspection
});
```
Apply this pattern to all 6+ `emailQueue.add` calls and all `accountQueue.add` calls.

---

**Redis has no reconnect strategy**
If the Redis connection drops (e.g., cloud Redis restart), the NestJS app will start throwing errors on every request without auto-recovering.
**Fix:** In `redis.module.ts`, when creating the `ioredis` client, add:
```ts
new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 100, 3000), // retry up to 3s
  reconnectOnError: (err) => err.message.includes('READONLY'),
});
```

---

**`APP_URL` hardcoded fallback**
`'https://vector-logistics.com'` is hardcoded in 3 places as a fallback for the `APP_URL` env variable.
**Fix:** Remove all fallback defaults for `APP_URL`. After adding the Joi env validation from the first item above, `APP_URL` will be validated at startup. The fallback is no longer needed and having it makes missing-env bugs invisible.

---

**No `GET /health/detailed` endpoint**
The existing `/health` endpoint likely just returns `{ status: 'ok' }`. There is no way to know if the DB or Redis is actually connected.
**Fix:** Use `@nestjs/terminus`. Update the `HealthController` to:
```ts
@Get('detailed')
check() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.redis.checkHealth('redis'),
    () => this.http.pingCheck('geoapify', 'https://api.geoapify.com'),
  ]);
}
```
This returns green/red status for each dependency individually.

---

**`AuditLog` model exists but is never written to**
Destructive actions (delete order, delete driver, clear workspace data, plan change, code regenerate) are untracked — there is no record of who did what and when.
**Fix:** Create a `AuditService` with a single `log(companyId, userId, action, meta)` method that does `prisma.auditLog.create(...)`. Call it after:
- `deleteOrder` in DashboardService
- `removeDriver` in DashboardService
- `clearData` in account.processor.ts
- `changePlan` in DashboardService
- `regenerateCode` in DashboardService

---

**No `docker-compose.yml` for local development**
Developers must manually install and run Postgres and Redis locally, with no guarantee of correct versions.
**Fix:** Create `docker-compose.yml` at the project root:
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: vector
      POSTGRES_PASSWORD: vector
      POSTGRES_DB: vector
    ports: ["5432:5432"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```
Add a `.env.local.example` file with the corresponding `DATABASE_URL=postgresql://vector:vector@localhost:5432/vector` and `REDIS_URL=redis://localhost:6379`.

---

**No CI workflow files in `.github/workflows/`**
There is a `.github/` directory but no workflows, meaning PRs are never automatically validated.
**Fix:** Create `.github/workflows/ci.yml`:
```yaml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd server && npm ci && npm run test
      - run: cd web && npm ci && npm run build
```

---

## 5. WEB — Broken or Missing Pages

### 5.1 `OrderDetail` page is commented out in the router

**File:** `web/src/routes.tsx:8,92`

Both the import and route for `/dashboard/orders/:id` are commented out. The component file exists but is unreachable.

**Fix logic:**
1. In `routes.tsx`, uncomment the import: `import OrderDetail from './features/dashboard/pages/OrderDetail'`.
2. Uncomment the route: `<Route path="/dashboard/orders/:id" element={<OrderDetail />} />`.
3. In the Orders table component, wrap each row in a `<Link to={/dashboard/orders/${order.id}}>` or add an "eye" icon button that navigates to it.
4. Verify the `OrderDetail` component fetches `GET /dashboard/orders/:id` on mount using `useParams()` to get the ID.

---

### 5.2 Customer QR code is never displayed on the tracking page

The proof-of-delivery flow requires the driver to scan the customer's QR code. The customer never sees a QR code to show.

**Fix logic:**
1. Run `npm install qrcode.react` in the web project.
2. In the tracking page component, the `GET /tracking?token=...` response already includes `tracking_token`. Destructure it.
3. Render the QR code below the map:
   ```tsx
   import QRCode from 'qrcode.react';
   <QRCode value={trackingData.tracking_token} size={180} />
   <p>Show this code to your driver upon delivery</p>
   ```
4. Add a "Save QR Code" download button: use `QRCode`'s canvas renderer and call `canvas.toDataURL()` + trigger a download.

---

### 5.3 Tracking page has no live updates

After location confirmation the page is static. The driver's position never refreshes.

**Fix logic:**
1. In the tracking page component, set up a polling interval in a `useEffect`:
   ```ts
   useEffect(() => {
     const interval = setInterval(() => {
       fetchTrackingData(token); // re-calls GET /tracking?token=
     }, 30_000);
     return () => clearInterval(interval);
   }, [token]);
   ```
2. `fetchTrackingData` updates the driver lat/lng in local state, which re-renders the map marker.
3. Also update the stop status badge (e.g., "En Route" → "Arrived") in the same refresh cycle.
4. Show a "Last updated X seconds ago" counter so the customer knows the data is live.

---

### 5.4 Billing page has no real Paystack flow and missing invoice list

The "Upgrade" button is a dead end and the invoices section is empty even though the endpoint exists.

**Fix logic:**
1. **Invoice list:** In the `Billing.tsx` component's `useEffect`, call `GET /dashboard/billing/invoices` (the endpoint and store method already exist). Render the result as a table with columns: Date, Amount, Status, Download PDF link.
2. **Paystack upgrade:** Once the Paystack webhook and checkout endpoint are implemented server-side (see item 10.3), the "Upgrade" button should call `POST /dashboard/billing/plan` with the selected `plan_id`, receive a `checkout_url` in the response, and do `window.location.href = checkout_url` to redirect to the Paystack hosted payment page.
3. **Cancel plan:** The "Cancel Plan" button calls `DELETE /dashboard/billing/cancel` which already sets the status to `'canceling'` in the DB. Ensure the UI shows a "Your plan will cancel on [date]" message after this.

---

### 5.5 No empty-state onboarding prompt for fresh accounts

New companies with zero drivers and zero orders see blank tables with no guidance.

**Fix logic:**
1. In the `Overview` (dashboard home) component, after fetching metrics, check `metrics.total_drivers === 0`.
2. If true, render an onboarding banner card with two CTAs:
   - "**Share Your Fleet Code**": shows the company code in a copyable chip.
   - "**Create Your First Order**": navigates to the Orders page and opens the create modal.
3. Similarly, in the Drivers list component, if `drivers.length === 0`, render an empty-state illustration with the company code prominently displayed and a "How to invite drivers" explainer line.
4. In the Orders list component, if `orders.length === 0`, render an empty-state with a "Create Order" button.

---

### 5.6 Fleet tracking map — null position crash and no auto-refresh

Some drivers have never updated their location so `lat`/`lng` are null. Placing a null marker crashes the map library.

**Fix logic:**
1. In the map component, before calling `new Marker([driver.lat, driver.lng])`, guard:
   ```ts
   if (driver.lat == null || driver.lng == null) return; // skip offline/no-position drivers
   ```
2. Instead of skipping, render those drivers in the side panel as "Position Unknown" with a grey status dot.
3. For auto-refresh: in the `Tracking.tsx` page, use the same `setInterval` pattern from 5.3 — call `fetchDrivers()` every 15–20 seconds.
4. Show each driver's "last_seen_at" timestamp on their map popup so the manager knows how stale the data is.

---

### 5.7 Orders page — no tracking link copy button

Managers must manually find and copy the tracking URL.

**Fix logic:**
1. The tracking URL format is `${APP_URL}/track?token=${stop.tracking_token}`. The tracking token is already returned in the orders list response on each stop.
2. In the orders table row, add a copy icon button next to each order. On click:
   ```ts
   navigator.clipboard.writeText(`${window.location.origin}/track?token=${stop.tracking_token}`);
   toast.success('Tracking link copied!');
   ```
3. Also add the same button inside the `OrderDetail` page (once item 5.1 is done).
4. If the order has multiple stops, each stop should have its own copy button since each has its own `tracking_token`.

---

## 6. FLUTTER (Mobile) — Broken or Missing

### 6.1 "Mark as Arrived" never calls `arriveAtStop` API

*(Same root cause as item 1.2 — this entry is the Flutter-side fix)*

**File:** `navigation.dart:646-684`

The "Mark as Arrived" button directly pushes to the proof delivery screen without notifying the server. `arrived_at` is never stamped on the stop — see the full explanation and server context in item 1.2.

**Fix logic:**
1. In `_buildArriveButton`, find the `onTap` callback (currently just `_stopLocationTracking()` + `Navigator.push`).
2. Wrap the entire block in a loading state: set `_isArriving = true` and show a spinner overlay.
3. Call `await _api.arriveAtStop(currentStop['id'])`. This is already implemented in `driver_api_service.dart` as a `PATCH /driver/routes/stops/:id/arrive`.
4. On success, navigate to the proof delivery screen, passing the current stop data.
5. On error, show a `SnackBar('Failed to mark arrival. Please try again.')` and do NOT navigate.
6. Move `_stopLocationTracking()` to after the navigation push resolves, or remove it entirely — the proof delivery screen's `dispose` will clean up.

---

### 6.2 QR scan accepts any barcode — no validation against the stop token

**File:** `proof_delivery.dart:444-451`

`MobileScanner.onDetect` marks `_qrScanned = true` the moment *any* barcode is detected. A driver can scan a cereal box to pass QR verification.

**Fix logic:**
1. **Server side first:** In both `getAssignments` and `getRoutePreview` responses, include `tracking_token` in each stop's data payload (it lives on the `Stop` model already — just add it to the Prisma `select`).
2. In `proof_delivery.dart`, read `currentStop['tracking_token']` and store it in a local variable.
3. In `MobileScanner`'s `onDetect` callback, extract the scanned value: `final scannedValue = capture.barcodes.first.rawValue`.
4. Compare: `if (scannedValue == currentStop['tracking_token'])`. If they match, set `setState(() => _qrScanned = true)`. If they do NOT match, show `ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Wrong QR code. Please scan the customer\'s code.')))` and leave `_qrScanned = false`.

---

### 6.3 Photo proof is a local file path, not a Cloudinary URL

**File:** `proof_delivery.dart:50-57`

`_capturedPhotoPath` is a device-local path like `/data/user/0/.../image.jpg`. It is sent directly as `photo_url` to `completeDelivery`. The server stores it verbatim in the DB — a path that no other device can resolve.

**Fix logic:**
1. Create `client/lib/core/services/cloudinary_service.dart`:
   ```dart
   class CloudinaryService {
     static Future<String> upload({ required String filePath }) async {
       final uri = Uri.parse('https://api.cloudinary.com/v1_1/${Env.cloudinaryCloudName}/image/upload');
       final request = http.MultipartRequest('POST', uri)
         ..fields['upload_preset'] = Env.cloudinaryUploadPreset
         ..files.add(await http.MultipartFile.fromPath('file', filePath));
       final response = await request.send();
       final body = jsonDecode(await response.stream.bytesToString());
       if (response.statusCode != 200) throw Exception('Upload failed');
       return body['secure_url'] as String;
     }
   }
   ```
2. Create `client/lib/core/config/env.dart` (or use `flutter_dotenv`) to expose `cloudinaryCloudName` and `cloudinaryUploadPreset` from the app's environment.
3. In `_handleSubmit` in `proof_delivery.dart`, before calling `_api.completeDelivery(...)`:
   ```dart
   setState(() => _isUploading = true);
   final photoUrl = await CloudinaryService.upload(filePath: _capturedPhotoPath!);
   setState(() => _isUploading = false);
   ```
4. Pass `photoUrl` (not `_capturedPhotoPath`) to `completeDelivery`.
5. Show a progress indicator while uploading (since image uploads can take 2–5 seconds on mobile data).

---

### 6.4 Background location tracking stops when phone is locked

**File:** `navigation.dart:82-112`

`geolocator`'s `getPositionStream` is paused by the OS when the screen locks. Fleet managers see the driver's pin freeze mid-route.

**Fix logic:**
1. Add `flutter_foreground_task: ^X.X.X` to `pubspec.yaml`.
2. In `navigation.dart`, when a route is started, initialize the foreground task:
   ```dart
   await FlutterForegroundTask.startService(
     notificationTitle: 'Vector Delivery',
     notificationText: 'Delivering route: ${route['name']}',
     callback: locationTaskCallback,
   );
   ```
3. The `@pragma('vm:entry-point') void locationTaskCallback()` function runs in a separate Dart isolate, starts `geolocator.getPositionStream`, and sends each position update to the server via `http.patch('/driver/location')`.
4. Use `FlutterForegroundTask.sendDataToTask` / `receiveDataFromTask` for isolate ↔ UI communication if needed.
5. Stop the foreground task in `_handleRouteCompleted()` and in `dispose()`.
6. On Android, add the required `<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />` and `FOREGROUND_SERVICE_LOCATION` to `AndroidManifest.xml`.

---

### 6.5 Offline delivery completions are dropped

**File:** `proof_delivery.dart:35` — `OfflineService.checkAndShowOfflineSnackBar`

If the driver is offline when submitting proof of delivery, the action is entirely blocked. In areas with poor connectivity this means the driver physically cannot complete a stop.

**Fix logic:**
1. Add `hive` and `hive_flutter` to `pubspec.yaml` for local storage.
2. Define a `PendingDelivery` Hive model:
   ```dart
   @HiveType(typeId: 1)
   class PendingDelivery {
     @HiveField(0) final String stopId;
     @HiveField(1) final String photoUrl;
     @HiveField(2) final String? qrToken;
     @HiveField(3) final DateTime queuedAt;
   }
   ```
3. In `_handleSubmit`, instead of showing a blocking offline error, check connectivity: if offline, save a `PendingDelivery` to the Hive box and show "Delivery saved — will sync when online". If online, submit normally.
4. In `OfflineService`, add a `syncPendingDeliveries()` method. Subscribe to `connectivity_plus` stream. When the connection is restored, call `syncPendingDeliveries()` which iterates the Hive box and calls `_api.completeDelivery` for each entry, removing it on success.
5. Show a persistent banner in the app when there are pending offline deliveries: "X deliveries pending sync".

---

### 6.6 Upcoming route card passes empty stops list on tap

**File:** `assignments.dart:631-639`

When an upcoming route card is tapped, it navigates to `/route-preview` with `'stops': []`. The route-preview screen initiates a `getRoutePreview` fetch which works, but if the driver is offline the preview shows nothing with no error message.

**Fix logic:**
1. **Server change:** In `getAssignments`, for upcoming routes add a limited `stops` include: `include: { stops: { select: { id: true, address: true, recipient_name: true, sequence: true, status: true, tracking_token: true } } }`. This keeps the payload lightweight.
2. **Flutter change:** In `assignments.dart`, when navigating to route-preview, pass the stops from the route object instead of `[]`: `'stops': route['stops'] ?? []`.
3. In `route_preview.dart`: if the initial `stops` argument is non-empty, render those immediately (no spinner). When `getRoutePreview` succeeds, merge/replace with the full server data (which includes lat/lng for map drawing).
4. For offline state: if `getRoutePreview` throws and `stops` is empty, show an `EmptyState` widget: "Could not load route details. Check your connection."
5. If `stops` is non-empty but `getRoutePreview` fails (offline), show the stop list from the argument data with a banner "Map preview unavailable offline".

---

### 6.7 Driver settings are reset to defaults on every app launch

*(Server gap 2.6 is the root cause. This is the Flutter-side fix once the server is fixed.)*

**Fix logic:**
1. In `settings.dart`'s `initState` (or in a `SettingsProvider`), call `await _api.getSettings()` when the screen loads. Map the response fields to the toggle state variables.
2. Wrap the API call in a try/catch: on failure, fall back to in-memory defaults (don't crash).
3. On each toggle change, call `await _api.updateSettings({ [key]: newValue })` with a 500ms debounce so rapid toggles don't flood the server.
4. Cache the last known settings in `SharedPreferences` as a JSON string so the settings screen renders instantly from cache on launch before the API call resolves.

---

### 6.8 Onboarding completes without vehicle information

**File:** `auth.service.ts:165-209` — `signUpDriver`

The driver sign-up sends `vehicle_type` and `vehicle_plate` but neither field is marked required in `SignUpDriverDto`. A driver can register with empty vehicle info.

**Fix logic:**
1. In `server/src/auth/dto/auth.dto.ts`, find `SignUpDriverDto` and add decorators:
   ```ts
   @IsString() @IsNotEmpty() vehicle_type: string; // e.g. 'motorcycle', 'van', 'truck'
   @IsString() @IsNotEmpty() vehicle_plate: string;
   ```
2. In the Flutter `sign_up.dart`, ensure both the vehicle type dropdown and plate number field are marked required — do not allow the "Create Account" button to be enabled if either is empty.
3. In the `completeOnboarding` server method, add a validation step: if the driver profile has empty `vehicle_type` or `vehicle_plate`, throw `BadRequestException('Vehicle information is required to complete onboarding.')`.

---

## 7. Signature Capture — Remove or Implement

The Prisma schema has `signature_url` and `signature_name` on the `Stop` model. The proof-of-delivery screen has no signature pad.

**This requires a product decision. The two options with their full implementation paths:**

**Option A — Implement signatures:**
1. Add `flutter_signature_pad` (or `syncfusion_flutter_signaturepad`) to `pubspec.yaml`.
2. In `proof_delivery.dart`, add a `SignaturePadWidget` below the photo section. State: `Uint8List? _signatureBytes` and `String? _signatureName`.
3. Add a `TextField` for the signer's name (`_signatureName`).
4. On submit, export the signature canvas to PNG bytes: `final image = await _signaturePadController.toImage(); final bytes = await image.toByteData(format: ImageByteFormat.png)`.
5. Upload the PNG bytes to Cloudinary (same `CloudinaryService.upload` from item 6.3, but using bytes instead of a file path via `http.MultipartFile.fromBytes`).
6. Pass `signature_url` and `signature_name` in the `completeDelivery` API call body.

**Option B — Remove signatures (recommended for MVP):**
1. In `schema.prisma`, remove `signature_url String?` and `signature_name String?` from the `Stop` model.
2. Run `npx prisma migrate dev --name remove_signature_fields`.
3. Remove `signature_url` and `signature_name` from the `CompleteDeliveryDto` on the server.
4. Document that QR code scan is the sole delivery verification method.

---

## 8. Testing

**Server — no tests beyond `AppController`**

**Fix logic:**
- Create `server/src/auth/auth.service.spec.ts`:
  - Mock `PrismaService`, `RedisService`, `emailQueue`.
  - Test `signUpDriver` happy path: expects `prisma.user.create` to be called and a verification email to be queued.
  - Test duplicate email: expects `ConflictException` when `prisma.user.findUnique` returns a user.
  - Test invalid company code: expects `NotFoundException` when `prisma.company.findUnique` returns null.
- Create `server/src/driver/driver.service.spec.ts`:
  - Test the Haversine distance helper function in `updateLocation` directly with known coordinates.
  - Test `checkAndUpdateRouteStatus`: when all stops are completed, the route status should become 'completed'.
- Create `server/src/dashboard/dashboard.service.spec.ts`:
  - Test `refreshOrderStatuses`: mock stops with `time_window_end` in the past and assert `status` is updated to `'failed'`.

**Flutter — empty `test/` folder**

**Fix logic:**
- Create `client/test/proof_delivery_test.dart`:
  - Widget test: render `ProofDeliveryScreen`. Assert submit button is disabled initially.
  - Simulate photo capture (`setState(() => _capturedPhotoPath = '/fake.jpg')`). Assert button is still disabled.
  - Simulate QR scan with matching token. Assert button becomes enabled.
  - Simulate tapping submit. Assert `_api.completeDelivery` is called.
- Create `client/test/home_test.dart`:
  - Widget test: render `HomeScreen` with a mocked driver in 'offline' status.
  - Tap the duty toggle. Assert `_api.updateStatus('online')` is called.

**Web — no tests**

**Fix logic:**
- Create `web/src/features/tracking/__tests__/Tracking.test.tsx` using Vitest + React Testing Library:
  - Render the tracking page with a mock API response where `status = 'en_route'`.
  - Assert the status badge renders "En Route".
  - Update the mock to `status = 'arrived'`. Re-render. Assert the status badge updates.
- Create `web/src/utils/__tests__/format.test.ts` for any utility functions (date formatting, distance formatting).

---

## 9. What Is Working Well — Do Not Revisit

- JWT + Redis per-device refresh token rotation ✅
- Full Geoapify integration for geocoding, routing, and real route optimization (`MapService`) ✅
- Geofencing auto-arrive via Haversine (concept is correct, execution flaw is item 1.2) ✅
- BullMQ async email queue ✅
- CSV bulk import with per-row error reporting ✅
- OTP-gated workspace deactivation with 10-day delayed deletion ✅
- Stale-while-revalidate caching strategy in Flutter screens ✅
- SendGrid templates: verification, reset, tracking link, report, data cleared ✅
- Reverse geocoding on customer location confirmation ✅
- Geocode-on-create / geocode cache in `createOrder` ✅
- Driver self-registration via company code (no invite needed) ✅
- Stripe-like Paystack architecture (plan stored in BillingRecord, subscription tier enum) ✅ (only wiring missing)

---

## 10. Final Flow & Edge Case Audit Findings (3rd Pass)

### 10.1 Web and Mobile Push Notification Triggers (Missing)

Server `notification.processor.ts` only logs "TODO: emit via Socket.io". The DB notification record is created (`NotificationsService.create` works), but it is never delivered to anyone in real-time.

**Fix logic (two-phase approach):**

**Phase 1 — FCM-backed push for Flutter (mobile):**
1. Set up a Firebase project. Add your app's `google-services.json` to `client/android/app/`.
2. Add `firebase_messaging: ^X.X.X` to `pubspec.yaml`.
3. In `main.dart`, call `FirebaseMessaging.instance.requestPermission()` and:
   ```dart
   final fcmToken = await FirebaseMessaging.instance.getToken();
   await _api.registerFcmToken(fcmToken!); // new endpoint: PATCH /driver/fcm-token
   ```
4. On the server, add `fcm_token String?` to the `Driver` model in `schema.prisma`. Create a `PATCH /driver/fcm-token` endpoint that saves it.
5. Install `firebase-admin` on the server: `npm install firebase-admin`.
6. In `notification.processor.ts`, update `handleDeliver` to:
   ```ts
   const driver = await prisma.driver.findFirst({ where: { user_id: userId }, select: { fcm_token: true } });
   if (driver?.fcm_token) {
     await firebaseAdmin.messaging().send({
       token: driver.fcm_token,
       notification: { title: notification.title, body: notification.body },
       data: notification.data as Record<string, string>,
     });
   }
   ```

**Phase 2 — WebSocket for Web (fleet manager real-time):**
1. Install `@nestjs/websockets` and `socket.io` on the server.
2. Create `notifications/notifications.gateway.ts`:
   ```ts
   @WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
   export class NotificationsGateway {
     @WebSocketServer() server: Server;
     sendToUser(userId: string, payload: unknown) {
       this.server.to(`user:${userId}`).emit('notification', payload);
     }
   }
   ```
3. In `notification.processor.ts`, also call `this.gateway.sendToUser(userId, { notificationId, ... })`.
4. In the React web app, initialise a `socket.io-client` connection after login. Join the user's room: `socket.emit('join', userId)`. Listen for `'notification'` events and show a toast.

**All triggers that must fire `NotificationsService.create` (the DB step from item 2.2 must be done first):**

| Event | Who gets notified | Type |
|---|---|---|
| Route assigned to driver | Driver | `new_assignment` |
| Route start (`startRoute`) | Driver | `route_started` |
| Delivery failed | Fleet manager | `delivery_failed` |
| Order auto-expired | Fleet manager | `delivery_failed` |
| Rating received after delivery | Driver | `rating_received` |
| New driver joins company | Fleet manager | `system_alert` |
| Driver goes offline mid-route | Fleet manager | `system_alert` |
| Driver approaching stop (geofence) | Customer (email only, no in-app) | — push not needed, tracking page polls |

---

### 10.2 Order & Route Lifecycle Edge Cases

**Rejecting Routes — Driver has no way to reject an assignment**

**Fix logic:**
1. Add a `PATCH /driver/routes/:routeId/reject` endpoint to `DriverController`.
2. Server `rejectRoute` method: verify the route belongs to this driver and is in `'scheduled'` status (not yet started). Update route `status = 'unassigned'`, `driver_id = null`. Update all stops `driver_id = null`, `status = 'unassigned'`.
3. Notify the fleet manager via `NotificationsService.create({ type: 'system_alert', body: 'Driver ${driverName} rejected route ${routeName}.' })`.
4. In Flutter, in `assignments.dart`, add a "Reject" button on upcoming route cards. Call the reject endpoint and refresh the list on success.
5. In the web dashboard, flag "Rejected" routes in the Routes table in orange so the manager knows to reassign.

---

**Reassigning Failed Stops — No endpoint or UI for the fleet manager**

**Fix logic:**
1. Add `PATCH /dashboard/orders/:stopId/reassign` to `OrdersController`.
2. Server `reassignStop` method: accepts `{ driver_id?: string }`. Validates the stop is `'failed'` or `'cancelled'`. Updates `stop.status = 'assigned'`, `stop.driver_id = dto.driver_id ?? null` (null = return to pool), clears `failure_reason`, clears `arrived_at`.
3. In the web dashboard's `OrderDetail` page (item 5.1), add a "Reassign" button that appears only when the order status is `'failed'`. It opens a modal with a driver dropdown and calls the endpoint.
4. Also add a "Retry Today" quick action in the orders table that pre-fills the same driver.

---

**Offline Mutations — delivery completions blocked entirely**

This is the same as item 6.5 — already covered with the full Hive offline queue fix logic there.

---

### 10.3 Billing Edge Cases (Paystack)

**Webhooks — No controller exists for Paystack events**

**Fix logic:**
1. Create `server/src/billing/billing.controller.ts` with a public (unauthenticated) `POST /billing/webhook` endpoint.
2. Verify the Paystack webhook signature: Paystack sends an `x-paystack-signature` header (HMAC-SHA512 of the raw request body using your Paystack secret). Reject requests that fail signature verification with `401`.
3. Handle these event types:
   - `charge.success` → find the `BillingRecord` by `reference`, update `status = 'active'`, set `current_period_end`, create an `Invoice` record.
   - `subscription.disable` → set `BillingRecord.status = 'past_due'`, email the fleet manager.
   - `invoice.payment_failed` → set `status = 'past_due'`, lock the company, email the manager.
4. Register the billing module and controller in `app.module.ts`. The route must be excluded from the JWT guard (add to the `Public()` allowlist).

---

**Downgrade Logic — No orchestration when seat count decreases**

**Fix logic:**
1. In `changePlan` (`dashboard.service.ts`), after updating the `BillingRecord`, compare old `seats_included` vs new `seats_included`.
2. If the new plan has fewer seats:
   ```ts
   const currentDriverCount = await prisma.driver.count({ where: { company_id, is_active: true } });
   const excess = currentDriverCount - newSeats;
   if (excess > 0) {
     // Find the `excess` most recently joined drivers (order by created_at DESC)
     const driversToLock = await prisma.driver.findMany({
       where: { company_id, is_active: true },
       orderBy: { created_at: 'desc' },
       take: excess,
     });
     await prisma.driver.updateMany({
       where: { id: { in: driversToLock.map(d => d.id) } },
       data: { is_active: false },
     });
     // Email the manager with the list of locked drivers and instructions to re-activate on upgrade
   }
   ```
3. In the web dashboard before confirming the downgrade, show a warning: "Downgrading will deactivate X drivers. You can re-activate them by upgrading your plan."

---

## Priority Order

| Priority | Item(s) |
|---|---|
| 🔴 P0 | 1.1 — stop query status (optimization always 404s) |
| 🔴 P0 | 1.2 + 6.1 — arrived_at never set, on-time broken |
| 🔴 P0 | 6.3 — photo is local path, not uploaded URL |
| 🔴 P0 | 6.2 — QR scan accepts any barcode |
| 🟠 P1 | 2.1 — duplicate tracking emails |
| 🟠 P1 | 1.3 — manager-side route optimization still mock |
| 🟠 P1 | 2.3 — no driver seat limit |
| 🟠 P1 | 5.2 — customer QR code missing on tracking page |
| 🟠 P1 | 4 infra — env validation, retry policy, rate limiting |
| 🟠 P1 | 6.4 — background location tracking |
| 🟡 P2 | 2.2 — in-app notifications |
| 🟡 P2 | 1.10 — duplicate client-side geocoding |
| 🟡 P2 | 1.11 + 3 — cosmetic toggle, any-type violations |
| 🟡 P2 | 5 web gaps, 8 testing |
