# VECTOR — Complete API Request Specification

> **Convention:** All requests to protected endpoints carry an `Authorization: Bearer <jwt>` header.
> The JWT is issued by Supabase Auth on sign-in.  
> `company_id` is never sent in the body — it is read server-side from the JWT claims.  
> All timestamps are ISO 8601. All IDs are UUIDs.  
> Platform legend: **[WEB]** = fleet-owner dashboard · **[MOB]** = driver mobile app · **[PUB]** = public / no auth

---

## 1. DATABASE SCHEMA (full reference)

```
companies          id · name · company_code · subscription_tier · stripe_customer_id
                   billing_email · city · state · country · logo_url · timezone
                   created_at · updated_at

users              id · company_id · email · full_name · phone · role(admin|manager|driver)
                   avatar_url · is_active · last_seen_at · created_at · updated_at

drivers            id · user_id · company_id · vehicle_type · vehicle_make · vehicle_model
                   vehicle_plate · vehicle_color · license_number
                   current_lat · current_lng · current_location_name
                   status(active|idle|offline|suspended)
                   total_deliveries · total_routes · avg_rating · rating_count
                   last_active_at · created_at · updated_at

routes             id · company_id · name · date · status(draft|scheduled|active|completed|cancelled)
                   driver_id · assigned_by · assigned_at · started_at · completed_at
                   total_stops · completed_stops · total_distance_km · estimated_duration_min
                   actual_duration_min · optimization_score · notes · created_by
                   created_at · updated_at

stops              id · route_id · company_id · driver_id · external_id
                   customer_name · customer_email · customer_phone
                   address · city · state · postal_code · country · lat · lng
                   sequence · packages · priority(low|normal|high|urgent)
                   time_window_start · time_window_end · notes
                   status(unassigned|assigned|pending|in_progress|completed|failed|returned)
                   arrived_at · completed_at · failure_reason · failure_notes
                   signature_url · photo_url · signature_name
                   customer_rating · customer_rating_comment · customer_rated_at
                   created_at · updated_at

tracking_tokens    id · stop_id · token(uuid) · customer_notified_at · expires_at · created_at

delivery_ratings   id · stop_id · driver_id · company_id · rating(1-5) · comment
                   categories{ on_time · handled_with_care · professional · followed_instructions }
                   created_at

notifications      id · user_id · company_id · type · title · body · data(json)
                   read · read_at · created_at

billing_records    id · company_id · stripe_customer_id · stripe_subscription_id
                   plan_id · status · current_period_start · current_period_end
                   cancel_at_period_end · seats_included · created_at · updated_at

invoices           id · company_id · stripe_invoice_id · amount_cents · currency
                   status · description · period_start · period_end
                   invoice_pdf_url · paid_at · created_at

api_keys           id · company_id · name · key_hash · key_prefix
                   last_used_at · expires_at · created_by · created_at · revoked_at

audit_logs         id · company_id · user_id · action · resource_type · resource_id
                   old_value · new_value · ip_address · user_agent · created_at
```

---

## 2. AUTHENTICATION (shared — both platforms)

> Both the dashboard (fleet owner) and driver app use password-only auth.  
> No biometric / fingerprint. Sign-up flows differ: drivers join via `company_code`; fleet owners create a company.

---

### POST /auth/sign-in  [WEB + MOB]

Sign in with email + password.

**Request body**
```json
{
  "email": "alex@fleetco.com",
  "password": "mypassword123"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "refresh_token": "d4a2c1...",
  "expires_in": 3600,
  "user": {
    "id": "usr_abc123",
    "email": "alex@fleetco.com",
    "full_name": "Alex Rivera",
    "role": "driver",
    "company_id": "cmp_xyz789",
    "avatar_url": null
  }
}
```

**Response 401**
```json
{ "error": "invalid_credentials", "message": "Email or password is incorrect." }
```

---

### POST /auth/sign-up/driver  [MOB]

Driver self-registration. Requires a valid `company_code` to be linked to an existing company.

**Request body**
```json
{
  "company_code": "FLEET-2024",
  "full_name": "Alex Rivera",
  "email": "alex@email.com",
  "phone": "+15551234567",
  "password": "mypassword123",
  "vehicle_type": "van",
  "vehicle_plate": "ABC-1234"
}
```

**Response 201**
```json
{
  "message": "Account created. Please verify your email.",
  "user_id": "usr_abc123",
  "company": {
    "id": "cmp_xyz789",
    "name": "Acme Logistics",
    "company_code": "FLEET-2024"
  }
}
```

**Response 404**
```json
{ "error": "invalid_company_code", "message": "No company found with that code." }
```

**Response 409**
```json
{ "error": "email_taken", "message": "An account with this email already exists." }
```

---

### POST /auth/sign-up/fleet  [WEB]

Fleet owner registration (creates a new company + first admin user).

**Request body**
```json
{
  "full_name": "Jordan Lee",
  "email": "jordan@acme.com",
  "password": "securepass123",
  "company_name": "Acme Logistics",
  "company_size": "11-50",
  "plan_id": "professional"
}
```

**Response 201**
```json
{
  "message": "Company and account created. Please verify your email.",
  "user_id": "usr_def456",
  "company": {
    "id": "cmp_xyz789",
    "name": "Acme Logistics",
    "company_code": "ACME-2024"
  },
  "checkout_url": "https://billing.stripe.com/session/..."
}
```

---

### POST /auth/verify-email  [WEB + MOB]

Submit the OTP token sent to email.

**Request body**
```json
{
  "email": "alex@email.com",
  "token": "847291"
}
```

**Response 200**
```json
{ "message": "Email verified successfully." }
```

**Response 400**
```json
{ "error": "invalid_token", "message": "Token is invalid or expired." }
```

---

### POST /auth/forgot-password  [WEB + MOB]

Trigger a password-reset email.

**Request body**
```json
{ "email": "alex@email.com" }
```

**Response 200**
```json
{ "message": "If that email exists, a reset link has been sent." }
```

---

### POST /auth/reset-password  [WEB + MOB]

Set a new password via the token from the reset email.

**Request body**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newSecurePass99"
}
```

**Response 200**
```json
{ "message": "Password updated successfully." }
```

---

### POST /auth/refresh  [WEB + MOB]

Exchange a refresh token for a new access token.

**Request body**
```json
{ "refresh_token": "d4a2c1..." }
```

**Response 200**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "new_refresh_token...",
  "expires_in": 3600
}
```

---

### POST /auth/sign-out  [WEB + MOB]

Invalidate the current session server-side.

**Request body** _(none)_

**Response 204** _(no content)_

---

## 3. FLEET DASHBOARD (Web)

> All `/dashboard/*` routes require `role: admin | manager`.

---

### 3.1 OVERVIEW PAGE — `/dashboard`

---

#### GET /dashboard/metrics  [WEB]

Loads the 4 KPI cards at the top of the overview screen.

**Query params:** none

**Response 200**
```json
{
  "active_drivers": 12,
  "active_drivers_change": "+2",
  "pending_orders": 34,
  "pending_orders_change": "-5",
  "on_time_rate": 94.2,
  "on_time_rate_change": "+3.1",
  "fuel_saved_usd": 248,
  "fuel_saved_change": "+12"
}
```

---

#### GET /dashboard/active-drivers  [WEB]

Real-time list of drivers currently on a route (sidebar widget on Overview).

**Response 200**
```json
{
  "drivers": [
    {
      "id": "drv_001",
      "name": "Alex Rivera",
      "status": "active",
      "current_location_name": "Downtown",
      "current_lat": 39.7817,
      "current_lng": -89.6501,
      "remaining_stops": 4,
      "eta_minutes": 135,
      "avatar_url": null
    }
  ]
}
```

---

#### GET /dashboard/recent-orders  [WEB]

Latest ~5 orders for the overview sidebar widget.

**Query params:** `limit=5`

**Response 200**
```json
{
  "orders": [
    {
      "id": "stp_abc",
      "external_id": "ORD-1234",
      "customer_name": "Acme Corp",
      "address": "123 Main St",
      "status": "assigned",
      "created_at": "2026-03-07T10:00:00Z"
    }
  ]
}
```

---

#### POST /dashboard/orders  [WEB]

Create a single new order (quick-add from the Overview "New Order" modal or Orders page).

**Request body**
```json
{
  "customer_name": "TechCorp LLC",
  "customer_email": "contact@techcorp.com",
  "customer_phone": "+15559876543",
  "address": "456 Market St",
  "city": "Springfield",
  "state": "IL",
  "postal_code": "62701",
  "packages": 2,
  "priority": "normal",
  "time_window_start": "09:00",
  "time_window_end": "12:00",
  "notes": "Leave at front desk"
}
```

**Response 201**
```json
{
  "id": "stp_newxyz",
  "external_id": "ORD-1241",
  "status": "unassigned",
  "tracking_token": "a1b2c3d4-...",
  "created_at": "2026-03-07T10:15:00Z"
}
```

---

### 3.2 ORDERS PAGE — `/dashboard/orders`

---

#### GET /dashboard/orders  [WEB]

Paginated, filterable list of all stops/orders for the company.

**Query params**
```
status=all|unassigned|assigned|in_progress|completed|failed   (default: all)
search=<string>         searches external_id, customer_name, address
page=1
limit=25
date=2026-03-07         (filter by route date)
driver_id=drv_001       (filter by assigned driver)
sort=created_at         (default)
order=desc              (default)
```

**Response 200**
```json
{
  "data": [
    {
      "id": "stp_abc",
      "external_id": "ORD-1234",
      "customer_name": "Acme Corp",
      "customer_phone": "+15551234567",
      "address": "123 Main St",
      "city": "Springfield",
      "packages": 2,
      "priority": "high",
      "time_window_start": "09:00",
      "time_window_end": "11:00",
      "status": "assigned",
      "route_id": "rte_xyz",
      "route_name": "Downtown Route #47",
      "driver_id": "drv_001",
      "driver_name": "Alex Rivera",
      "sequence": 3,
      "created_at": "2026-03-07T08:00:00Z",
      "completed_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 148,
    "total_pages": 6
  },
  "stats": {
    "total": 148,
    "unassigned": 12,
    "assigned": 34,
    "in_progress": 18,
    "completed": 79,
    "failed": 5
  }
}
```

---

#### POST /dashboard/orders/bulk  [WEB]

Bulk-import orders from CSV upload.

**Request body** _(multipart/form-data)_
```
file: <csv_file>
```

CSV columns expected:
```
customer_name, customer_email, customer_phone, address, city, state,
postal_code, packages, priority, time_window_start, time_window_end, notes, external_id
```

**Response 200**
```json
{
  "imported": 42,
  "skipped": 2,
  "errors": [
    { "row": 8, "reason": "Missing address" },
    { "row": 19, "reason": "Invalid time window format" }
  ]
}
```

---

#### PATCH /dashboard/orders/:stop_id  [WEB]

Update an order's details or assign it to a route/driver.

**Request body** _(send only fields being changed)_
```json
{
  "route_id": "rte_xyz",
  "driver_id": "drv_001",
  "priority": "urgent",
  "time_window_start": "10:00",
  "time_window_end": "12:00",
  "notes": "Updated instructions"
}
```

**Response 200**
```json
{
  "id": "stp_abc",
  "status": "assigned",
  "driver_id": "drv_001",
  "route_id": "rte_xyz",
  "updated_at": "2026-03-07T11:00:00Z"
}
```

---

#### DELETE /dashboard/orders/:stop_id  [WEB]

Delete an unassigned order. Orders that are `in_progress` or `completed` cannot be deleted (use cancel instead).

**Response 204** _(no content)_

**Response 409**
```json
{ "error": "cannot_delete", "message": "Cannot delete an order that is in progress or completed." }
```

---

### 3.3 DRIVERS PAGE — `/dashboard/drivers`

---

#### GET /dashboard/drivers  [WEB]

Full driver list for the company.

**Query params**
```
search=<string>         matches name or email
status=active|idle|offline|suspended
view=board|list         (UI hint only, doesn't affect response)
```

**Response 200**
```json
{
  "drivers": [
    {
      "id": "drv_001",
      "user_id": "usr_abc",
      "name": "Alex Rivera",
      "email": "alex@email.com",
      "phone": "+15551234567",
      "avatar_url": null,
      "vehicle_type": "van",
      "vehicle_plate": "ABC-1234",
      "vehicle_make": "Ford",
      "vehicle_model": "Transit",
      "status": "active",
      "today_stops": 4,
      "completed_routes": 234,
      "avg_rating": 4.9,
      "rating_count": 198,
      "last_active_at": "2026-03-07T10:58:00Z",
      "company_code": "FLEET-2024"
    }
  ],
  "stats": {
    "total": 4,
    "active_now": 3,
    "total_routes_all_time": 991,
    "avg_rating": 4.85
  }
}
```

---

#### POST /dashboard/drivers/invite  [WEB]

Send an invite email to a new driver with the company code embedded.

**Request body**
```json
{
  "email": "newdriver@email.com",
  "full_name": "Jordan Smith"
}
```

**Response 200**
```json
{ "message": "Invite sent to newdriver@email.com" }
```

---

#### PATCH /dashboard/drivers/:driver_id  [WEB]

Update driver profile or status from the dashboard.

**Request body**
```json
{
  "status": "suspended",
  "vehicle_plate": "XYZ-9999",
  "vehicle_type": "truck"
}
```

**Response 200**
```json
{
  "id": "drv_001",
  "status": "suspended",
  "vehicle_plate": "XYZ-9999",
  "updated_at": "2026-03-07T12:00:00Z"
}
```

---

#### DELETE /dashboard/drivers/:driver_id  [WEB]

Remove a driver from the company. Marks `is_active = false` on their user record (soft delete).  
Blocked if the driver has an active route.

**Response 204** _(no content)_

**Response 409**
```json
{ "error": "driver_on_route", "message": "Cannot remove a driver with an active route." }
```

---

### 3.4 DRIVER DETAIL PAGE — `/dashboard/driver-detail?id=:driver_id`

---

#### GET /dashboard/drivers/:driver_id  [WEB]

Full driver profile + performance stats.

**Response 200**
```json
{
  "id": "drv_001",
  "name": "Alex Rivera",
  "email": "alex@email.com",
  "phone": "+15551234567",
  "avatar_url": null,
  "vehicle_type": "van",
  "vehicle_plate": "ABC-1234",
  "vehicle_make": "Ford",
  "vehicle_model": "Transit",
  "status": "active",
  "avg_rating": 4.9,
  "rating_count": 198,
  "total_deliveries": 234,
  "total_routes": 67,
  "on_time_rate": 96,
  "joined_date": "2024-01-15",
  "last_active_at": "2026-03-07T10:58:00Z",
  "company_code": "FLEET-2024"
}
```

---

#### GET /dashboard/drivers/:driver_id/history  [WEB]

Delivery history for a specific driver, filterable by time period.

**Query params**
```
period=today|week|month|all     (default: today)
page=1
limit=20
```

**Response 200**
```json
{
  "data": [
    {
      "stop_id": "stp_abc",
      "external_id": "DEL-001",
      "customer_name": "Sarah Chen",
      "address": "742 Evergreen Terrace, Springfield",
      "completed_at": "2026-03-07T10:45:00Z",
      "packages": 3,
      "had_signature": true,
      "had_photo": false,
      "time_window_start": "09:00",
      "time_window_end": "11:00",
      "on_time": true,
      "customer_rating": 5
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 234, "total_pages": 12 }
}
```

---

### 3.5 TRACKING PAGE — `/dashboard/tracking`

---

#### GET /dashboard/tracking/drivers  [WEB]

All driver locations + current route progress. This is the data source for the live map.

**Response 200**
```json
{
  "drivers": [
    {
      "id": "drv_001",
      "name": "Alex Rivera",
      "phone": "+15551234567",
      "status": "active",
      "current_lat": 39.7817,
      "current_lng": -89.6501,
      "current_location_name": "742 Evergreen Terrace, Springfield",
      "current_order_id": "DEL-001",
      "next_stop_address": "1428 Elm Street",
      "completed_today": 3,
      "remaining_stops": 4,
      "last_update": "2026-03-07T11:01:00Z"
    }
  ]
}
```

> **Realtime subscription:** Dashboard subscribes to `drivers` table changes on  
> `(current_lat, current_lng, status)` via Supabase Realtime — no polling required.

---

### 3.6 REPORTS PAGE — `/dashboard/reports`

---

#### GET /dashboard/reports/summary  [WEB]

Aggregated KPI metrics for the selected period.

**Query params**
```
period=7d|30d|90d|1y     (default: 7d)
```

**Response 200**
```json
{
  "period": "7d",
  "kpis": {
    "total_deliveries": 1247,
    "total_deliveries_change_pct": 12.5,
    "on_time_rate": 94.2,
    "on_time_rate_change_pct": 3.1,
    "avg_delivery_time_min": 38,
    "avg_delivery_time_change_pct": -8.2,
    "distance_saved_km": 342,
    "distance_saved_change_pct": 15.7
  },
  "summary_table": [
    {
      "metric": "Total Distance",
      "current": "1842 km",
      "previous": "1956 km",
      "change_pct": -5.8,
      "positive": true
    },
    {
      "metric": "Avg. Fuel Cost",
      "current": "$0.46/km",
      "previous": "$0.47/km",
      "change_pct": -2.1,
      "positive": true
    }
  ]
}
```

---

#### GET /dashboard/reports/deliveries-chart  [WEB]

Daily delivery count data for the area/bar chart.

**Query params**
```
period=7d|30d|90d|1y
```

**Response 200**
```json
{
  "data": [
    { "label": "Mon", "deliveries": 48, "on_time": 45 },
    { "label": "Tue", "deliveries": 55, "on_time": 52 },
    { "label": "Wed", "deliveries": 62, "on_time": 58 }
  ]
}
```

---

#### GET /dashboard/reports/monthly-chart  [WEB]

Monthly totals for the bar chart.

**Query params**
```
period=7d|30d|90d|1y
```

**Response 200**
```json
{
  "data": [
    { "label": "Oct", "deliveries": 980, "revenue_usd": 3200 },
    { "label": "Nov", "deliveries": 1120, "revenue_usd": 3800 }
  ]
}
```

---

#### GET /dashboard/reports/driver-performance  [WEB]

Per-driver performance leaderboard for the selected period.

**Query params**
```
period=7d|30d|90d|1y
```

**Response 200**
```json
{
  "drivers": [
    {
      "driver_id": "drv_001",
      "name": "Alex Rivera",
      "deliveries": 156,
      "avg_rating": 4.9,
      "on_time_pct": 95,
      "color": "#059669"
    }
  ]
}
```

---

#### GET /dashboard/reports/delivery-breakdown  [WEB]

Pie chart data — completed vs failed vs in-progress vs pending.

**Response 200**
```json
{
  "breakdown": [
    { "label": "Completed", "value": 342, "color": "#059669" },
    { "label": "In Progress", "value": 18, "color": "#34D399" },
    { "label": "Failed", "value": 8, "color": "#EF4444" },
    { "label": "Pending", "value": 24, "color": "#F59E0B" }
  ]
}
```

---

#### GET /dashboard/reports/export  [WEB]

Download a CSV export of the report for the selected period.

**Query params**
```
period=7d|30d|90d|1y
format=csv    (csv only for now)
```

**Response 200** _(application/octet-stream)_  
Binary CSV file download. `Content-Disposition: attachment; filename="vector-report-2026-03-07.csv"`

---

### 3.7 BILLING PAGE — `/dashboard/billing`

---

#### GET /dashboard/billing  [WEB]

Current subscription status, plan, and usage.

**Response 200**
```json
{
  "plan": {
    "id": "professional",
    "name": "Fleet Professional",
    "price_cents": 4900,
    "currency": "usd",
    "status": "active",
    "current_period_start": "2026-03-01",
    "current_period_end": "2026-04-01",
    "cancel_at_period_end": false,
    "seats_included": 25
  },
  "usage": {
    "active_drivers": 12,
    "deliveries_this_month": 342,
    "deliveries_limit": 999,
    "api_calls": 8200,
    "api_calls_limit": 50000
  },
  "payment_method": {
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2027
  }
}
```

---

#### GET /dashboard/billing/invoices  [WEB]

Billing history.

**Query params**
```
page=1
limit=10
```

**Response 200**
```json
{
  "invoices": [
    {
      "id": "inv_001",
      "stripe_invoice_id": "in_stripe_xxx",
      "amount_cents": 4900,
      "currency": "usd",
      "status": "paid",
      "description": "Fleet Professional — Monthly",
      "period_start": "2026-03-01",
      "period_end": "2026-04-01",
      "invoice_pdf_url": "https://invoices.stripe.com/...",
      "paid_at": "2026-03-01T00:00:00Z",
      "created_at": "2026-03-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 6 }
}
```

---

#### POST /dashboard/billing/change-plan  [WEB]

Switch subscription plan. Redirects to Stripe for payment if upgrading.

**Request body**
```json
{ "plan_id": "enterprise" }
```

**Response 200**
```json
{
  "status": "redirecting",
  "checkout_url": "https://billing.stripe.com/session/..."
}
```

_(If downgrading within same billing cycle, no redirect needed)_
```json
{
  "status": "updated",
  "new_plan_id": "starter",
  "effective_date": "2026-04-01"
}
```

---

#### POST /dashboard/billing/update-payment  [WEB]

Opens a Stripe-hosted session to update the payment method.

**Request body** _(none)_

**Response 200**
```json
{ "portal_url": "https://billing.stripe.com/portal/..." }
```

---

#### POST /dashboard/billing/cancel  [WEB]

Cancel subscription (takes effect at end of billing period).

**Request body** _(none)_

**Response 200**
```json
{
  "message": "Subscription will cancel on 2026-04-01.",
  "cancel_at": "2026-04-01T00:00:00Z"
}
```

---

### 3.8 SETTINGS PAGE — `/dashboard/settings`

---

#### GET /dashboard/settings  [WEB]

Load company profile, notification preferences, and API key info.

**Response 200**
```json
{
  "company": {
    "id": "cmp_xyz789",
    "name": "VECTOR Fleet Services",
    "company_code": "VECT-2024",
    "billing_email": "billing@vectorfleet.com",
    "phone": "+15550000000",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "timezone": "America/Los_Angeles",
    "logo_url": null
  },
  "notifications": {
    "email": true,
    "sms": false,
    "push": true,
    "driver_alerts": true,
    "delivery_updates": true,
    "payment_alerts": false,
    "weekly_report": true
  },
  "api_keys": [
    {
      "id": "key_001",
      "name": "Production Key",
      "key_prefix": "vect_sk_",
      "last_used_at": "2026-03-06T14:00:00Z",
      "created_at": "2024-01-15T00:00:00Z",
      "revoked_at": null
    }
  ]
}
```

---

#### PATCH /dashboard/settings/company  [WEB]

Update company profile information.

**Request body** _(send only fields being changed)_
```json
{
  "name": "Vector Logistics Inc.",
  "billing_email": "newbilling@vectorfleet.com",
  "phone": "+15559990000",
  "city": "Austin",
  "state": "TX",
  "timezone": "America/Chicago"
}
```

**Response 200**
```json
{
  "id": "cmp_xyz789",
  "name": "Vector Logistics Inc.",
  "updated_at": "2026-03-07T12:30:00Z"
}
```

---

#### PATCH /dashboard/settings/notifications  [WEB]

Save notification preference toggles.

**Request body**
```json
{
  "email": true,
  "sms": true,
  "push": true,
  "driver_alerts": true,
  "delivery_updates": true,
  "payment_alerts": true,
  "weekly_report": false
}
```

**Response 200**
```json
{ "message": "Notification preferences saved." }
```

---

#### POST /dashboard/settings/api-keys  [WEB]

Generate a new API key for this company. The full key is only returned once.

**Request body**
```json
{
  "name": "Shopify Integration",
  "expires_at": "2027-03-07T00:00:00Z"
}
```

**Response 201**
```json
{
  "id": "key_002",
  "name": "Shopify Integration",
  "key": "vect_sk_live_a4b8c2d1e5f9g3h7xxxx",
  "key_prefix": "vect_sk_",
  "created_at": "2026-03-07T12:00:00Z",
  "warning": "Copy this key now. It will not be shown again."
}
```

---

#### DELETE /dashboard/settings/api-keys/:key_id  [WEB]

Revoke an API key immediately.

**Response 204** _(no content)_

---

### 3.9 NOTIFICATIONS PAGE — `/dashboard/notifications`

---

#### GET /dashboard/notifications  [WEB]

Paginated notification list for the logged-in admin/manager.

**Query params**
```
category=all|orders|drivers|system     (default: all)
read=true|false|all                     (default: all)
page=1
limit=20
```

**Response 200**
```json
{
  "data": [
    {
      "id": "notif_001",
      "type": "delivery_failed",
      "category": "orders",
      "title": "Delivery missed time window",
      "body": "DEL-003 (Lisa Anderson) was not delivered within the 3:00–5:00 PM window.",
      "data": { "stop_id": "stp_abc", "route_id": "rte_xyz" },
      "read": false,
      "read_at": null,
      "created_at": "2026-03-07T10:30:00Z"
    }
  ],
  "unread_count": 4,
  "pagination": { "page": 1, "limit": 20, "total": 10 }
}
```

---

#### PATCH /dashboard/notifications/:notification_id  [WEB]

Mark a single notification as read.

**Request body**
```json
{ "read": true }
```

**Response 200**
```json
{
  "id": "notif_001",
  "read": true,
  "read_at": "2026-03-07T12:00:00Z"
}
```

---

#### POST /dashboard/notifications/mark-all-read  [WEB]

Mark all (or all in a category) as read.

**Request body**
```json
{ "category": "orders" }
```
_(omit `category` or send `"all"` to mark everything)_

**Response 200**
```json
{ "updated_count": 4 }
```

---

#### DELETE /dashboard/notifications/:notification_id  [WEB]

Dismiss (delete) a single notification.

**Response 204** _(no content)_

---

#### DELETE /dashboard/notifications  [WEB]

Bulk dismiss all notifications in a category.

**Query params**
```
category=all|orders|drivers|system
```

**Response 200**
```json
{ "deleted_count": 7 }
```

---

## 4. DRIVER MOBILE APP

> All `/driver/*` routes (and their non-prefixed equivalents) require `role: driver`.

---

### 4.1 HOME PAGE — `/home`

---

#### GET /driver/home  [MOB]

The driver's dashboard — today's summary, active route card, quick stats.

**Response 200**
```json
{
  "driver": {
    "id": "drv_001",
    "name": "Alex Rivera",
    "avatar_url": null,
    "status": "active"
  },
  "today": {
    "has_active_route": true,
    "route_id": "rte_xyz",
    "route_name": "Downtown Route #47",
    "total_stops": 8,
    "completed_stops": 3,
    "remaining_stops": 5,
    "estimated_finish_time": "2026-03-07T15:30:00Z",
    "next_stop": {
      "id": "stp_abc",
      "customer_name": "Sarah Chen",
      "address": "742 Evergreen Terrace",
      "city": "Springfield",
      "eta_minutes": 8
    }
  },
  "stats": {
    "completed_today": 3,
    "on_time_today": 3,
    "weekly_deliveries": 27,
    "avg_rating": 4.9
  },
  "unread_notifications": 2
}
```

---

#### PATCH /driver/status  [MOB]

Driver manually sets their own status (go online / take a break / go offline).

**Request body**
```json
{ "status": "idle" }
```

**Response 200**
```json
{
  "id": "drv_001",
  "status": "idle",
  "updated_at": "2026-03-07T12:00:00Z"
}
```

---

#### PATCH /driver/location  [MOB]

GPS ping — updates the driver's current lat/lng. Called every ~15–30 seconds while on a route.

**Request body**
```json
{
  "lat": 39.7892,
  "lng": -89.6445,
  "accuracy_meters": 8,
  "speed_kmh": 45,
  "heading_degrees": 180
}
```

**Response 200**
```json
{ "received": true, "timestamp": "2026-03-07T11:02:00Z" }
```

---

### 4.2 ASSIGNMENTS PAGE — `/assignments`

---

#### GET /driver/assignments  [MOB]

Today's assigned stops + completed ones. This is the main list the driver sees.

**Query params**
```
date=2026-03-07     (defaults to today)
```

**Response 200**
```json
{
  "route": {
    "id": "rte_xyz",
    "name": "Downtown Route #47",
    "status": "active",
    "date": "2026-03-07",
    "total_stops": 8,
    "completed_stops": 3
  },
  "stops": {
    "active": [
      {
        "id": "stp_001",
        "sequence": 1,
        "external_id": "DEL-001",
        "customer_name": "Sarah Chen",
        "address": "742 Evergreen Terrace",
        "city": "Springfield",
        "packages": 3,
        "priority": "high",
        "time_window_start": "09:00",
        "time_window_end": "11:00",
        "status": "in_progress",
        "notes": "Ring doorbell twice",
        "lat": 39.7817,
        "lng": -89.6501
      }
    ],
    "pending": [
      {
        "id": "stp_002",
        "sequence": 2,
        "external_id": "DEL-002",
        "customer_name": "Mike Johnson",
        "address": "1428 Elm Street",
        "city": "Springfield",
        "packages": 1,
        "priority": "normal",
        "time_window_start": "11:00",
        "time_window_end": "13:00",
        "status": "assigned",
        "notes": "Leave at front desk",
        "lat": 39.8011,
        "lng": -89.6388
      }
    ],
    "completed": [
      {
        "id": "stp_000",
        "sequence": 0,
        "external_id": "DEL-000",
        "customer_name": "John Doe",
        "address": "100 Oak St",
        "city": "Springfield",
        "packages": 1,
        "priority": "normal",
        "status": "completed",
        "completed_at": "2026-03-07T09:30:00Z",
        "customer_rating": 5
      }
    ]
  }
}
```

---

### 4.3 ROUTE PREVIEW PAGE — `/route-preview`

---

#### GET /driver/routes/:route_id/preview  [MOB]

Full route detail before the driver starts it — map polyline, stop list, optimization stats.

**Response 200**
```json
{
  "route": {
    "id": "rte_xyz",
    "name": "Downtown Route #47",
    "date": "2026-03-07",
    "status": "scheduled",
    "total_stops": 8,
    "total_distance_km": 42.8,
    "estimated_duration_min": 204,
    "optimization_score": 87,
    "notes": null
  },
  "stops": [
    {
      "id": "stp_001",
      "sequence": 1,
      "customer_name": "Sarah Chen",
      "address": "742 Evergreen Terrace",
      "city": "Springfield",
      "packages": 3,
      "priority": "high",
      "time_window_start": "09:00",
      "time_window_end": "11:00",
      "lat": 39.7817,
      "lng": -89.6501,
      "notes": "Ring doorbell twice"
    }
  ],
  "polyline": "eoijHx...encoded_polyline_string"
}
```

---

#### POST /driver/routes/:route_id/start  [MOB]

Driver taps "Start Route". Sets route status to `active` and the first stop to `in_progress`.

**Request body** _(none)_

**Response 200**
```json
{
  "route_id": "rte_xyz",
  "status": "active",
  "started_at": "2026-03-07T09:00:00Z",
  "first_stop_id": "stp_001"
}
```

---

### 4.4 NAVIGATION PAGE — `/navigation`

---

#### GET /driver/stops/:stop_id  [MOB]

Detailed info for the current stop during navigation.

**Response 200**
```json
{
  "id": "stp_001",
  "sequence": 1,
  "external_id": "DEL-001",
  "customer_name": "Sarah Chen",
  "customer_phone": "+15551234567",
  "address": "742 Evergreen Terrace",
  "city": "Springfield",
  "lat": 39.7817,
  "lng": -89.6501,
  "packages": 3,
  "priority": "high",
  "time_window_start": "09:00",
  "time_window_end": "11:00",
  "notes": "Ring doorbell twice",
  "status": "in_progress",
  "next_stop": {
    "id": "stp_002",
    "sequence": 2,
    "address": "1428 Elm Street",
    "city": "Springfield",
    "distance_km": 2.3,
    "eta_minutes": 8
  }
}
```

---

#### PATCH /driver/stops/:stop_id/arrive  [MOB]

Driver taps "I've arrived". Timestamps the arrival.

**Request body**
```json
{
  "lat": 39.7818,
  "lng": -89.6502
}
```

**Response 200**
```json
{
  "stop_id": "stp_001",
  "status": "in_progress",
  "arrived_at": "2026-03-07T09:25:00Z"
}
```

---

#### PATCH /driver/stops/:stop_id/skip  [MOB]

Mark stop as skipped (moved to end of route for retry). Does not mark as failed yet.

**Request body**
```json
{ "reason": "Traffic — will retry after next stop" }
```

**Response 200**
```json
{
  "stop_id": "stp_001",
  "status": "pending",
  "new_sequence": 7
}
```

---

### 4.5 PROOF OF DELIVERY PAGE — `/proof-delivery`

---

#### POST /driver/stops/:stop_id/complete  [MOB]

Submit proof of delivery and mark the stop as completed.  
Uses `multipart/form-data` to attach the photo file.

**Request body** _(multipart/form-data)_
```
photo_file: <image_file>         (optional, JPEG/PNG, max 5MB)
signature_data: <base64_string>  (optional, canvas PNG export)
signature_name: "J. Smith"       (optional, name of signer)
notes: "Left with neighbour"     (optional)
```

**Response 200**
```json
{
  "stop_id": "stp_001",
  "status": "completed",
  "completed_at": "2026-03-07T09:45:00Z",
  "photo_url": "https://storage.supabase.co/object/public/proof/stp_001_photo.jpg",
  "signature_url": "https://storage.supabase.co/object/public/proof/stp_001_sig.png",
  "route_progress": {
    "completed_stops": 4,
    "total_stops": 8,
    "remaining_stops": 4
  },
  "next_stop_id": "stp_002"
}
```

---

#### POST /driver/stops/:stop_id/fail  [MOB]

Mark a stop as failed (could not deliver).

**Request body**
```json
{
  "failure_reason": "no_answer",
  "failure_notes": "Knocked three times, no response. Left attempted delivery notice.",
  "photo_file": "<optional_multipart_image>"
}
```

**Response 200**
```json
{
  "stop_id": "stp_001",
  "status": "failed",
  "failure_reason": "no_answer",
  "completed_at": "2026-03-07T09:50:00Z",
  "next_stop_id": "stp_002"
}
```

---

### 4.6 HISTORY PAGE — `/history`

---

#### GET /driver/history  [MOB]

Completed routes for the driver, grouped/filtered by period.

**Query params**
```
period=week|month|year|all     (default: week)
page=1
limit=10
```

**Response 200**
```json
{
  "data": [
    {
      "route_id": "rte_001",
      "name": "Downtown Route #47",
      "date": "2026-03-07",
      "date_label": "Today",
      "total_stops": 12,
      "completed_stops": 12,
      "failed_stops": 0,
      "duration_min": 204,
      "distance_km": 42.8,
      "avg_customer_rating": 4.9,
      "stops_timeline": [
        {
          "address": "123 Main St",
          "customer_name": "John Doe",
          "completed_at": "2026-03-07T09:15:00Z",
          "status": "completed"
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 34 },
  "period_stats": {
    "total_routes": 7,
    "total_deliveries": 84,
    "total_distance_km": 298,
    "avg_rating": 4.85
  }
}
```

---

### 4.7 PROFILE PAGE — `/profile`

---

#### GET /driver/profile  [MOB]

The driver's own profile + rating summary.

**Response 200**
```json
{
  "id": "drv_001",
  "user_id": "usr_abc",
  "name": "Alex Rivera",
  "email": "alex@email.com",
  "phone": "+15551234567",
  "avatar_url": null,
  "vehicle_type": "van",
  "vehicle_plate": "ABC-1234",
  "vehicle_make": "Ford",
  "vehicle_model": "Transit",
  "avg_rating": 4.9,
  "rating_count": 198,
  "total_deliveries": 234,
  "total_routes": 67,
  "company": {
    "name": "Acme Logistics",
    "company_code": "FLEET-2024"
  },
  "joined_date": "2024-01-15",
  "recent_ratings": [
    { "rating": 5, "comment": "Super fast!", "created_at": "2026-03-07T09:50:00Z" },
    { "rating": 4, "comment": "On time.", "created_at": "2026-03-06T15:30:00Z" }
  ]
}
```

---

#### PATCH /driver/profile  [MOB]

Update the driver's own profile.

**Request body** _(send only fields being changed)_
```json
{
  "full_name": "Alex Rivera Jr.",
  "phone": "+15559990000",
  "vehicle_plate": "NEW-9999",
  "vehicle_make": "Mercedes",
  "vehicle_model": "Sprinter"
}
```

**Response 200**
```json
{
  "id": "drv_001",
  "name": "Alex Rivera Jr.",
  "phone": "+15559990000",
  "updated_at": "2026-03-07T12:00:00Z"
}
```

---

#### POST /driver/profile/avatar  [MOB]

Upload or replace the driver's profile photo.

**Request body** _(multipart/form-data)_
```
avatar_file: <image_file>    (JPEG/PNG, max 2MB)
```

**Response 200**
```json
{ "avatar_url": "https://storage.supabase.co/object/public/avatars/drv_001.jpg" }
```

---

### 4.8 SETTINGS PAGE — `/settings`  (Mobile)

---

#### GET /driver/settings  [MOB]

Load the driver's personal notification + app preferences.

**Response 200**
```json
{
  "notifications": {
    "push": true,
    "email": true,
    "sms": false
  },
  "preferences": {
    "dark_mode": false,
    "language": "en",
    "distance_unit": "metric",
    "auto_optimize": true,
    "voice_guidance": true
  }
}
```

---

#### PATCH /driver/settings  [MOB]

Save updated preferences.

**Request body**
```json
{
  "notifications": {
    "push": true,
    "email": false,
    "sms": true
  },
  "preferences": {
    "dark_mode": true,
    "voice_guidance": false,
    "distance_unit": "imperial"
  }
}
```

**Response 200**
```json
{ "message": "Settings saved." }
```

---

### 4.9 NOTIFICATIONS PAGE — `/notifications`  (Mobile)

---

#### GET /driver/notifications  [MOB]

The driver's own notification feed.

**Query params**
```
read=all|true|false     (default: all)
page=1
limit=20
```

**Response 200**
```json
{
  "data": [
    {
      "id": "notif_abc",
      "type": "new_assignment",
      "title": "New route assigned",
      "body": "North Side Route - 6 stops — starting at 9:00 AM.",
      "data": { "route_id": "rte_xyz" },
      "read": false,
      "created_at": "2026-03-07T08:45:00Z"
    }
  ],
  "unread_count": 2,
  "pagination": { "page": 1, "limit": 20, "total": 5 }
}
```

---

#### PATCH /driver/notifications/:notification_id  [MOB]

Mark a notification as read.

**Request body**
```json
{ "read": true }
```

**Response 200**
```json
{ "id": "notif_abc", "read": true, "read_at": "2026-03-07T11:00:00Z" }
```

---

#### POST /driver/notifications/mark-all-read  [MOB]

Mark all driver notifications as read.

**Request body** _(none)_

**Response 200**
```json
{ "updated_count": 2 }
```

---

### 4.10 ONBOARDING — `/onboarding`

---

#### POST /driver/onboarding  [MOB]

Completes the driver onboarding flow (vehicle info, license, etc.) after email verification.  
Called once from the Onboarding screen.

**Request body**
```json
{
  "vehicle_type": "van",
  "vehicle_make": "Ford",
  "vehicle_model": "Transit",
  "vehicle_plate": "ABC-1234",
  "vehicle_color": "White",
  "license_number": "DL-987654"
}
```

**Response 200**
```json
{
  "driver_id": "drv_001",
  "message": "Profile complete. Welcome to VECTOR.",
  "redirect": "/home"
}
```

---

## 5. CUSTOMER TRACKING (Public)

> No authentication. The customer receives `/track?token=<uuid>` via SMS/email.  
> The token is a `tracking_tokens.token` value.  
> Only non-sensitive fields of the stop are exposed.

---

#### GET /track  [PUB]

Resolve a tracking token to delivery status. Called when the customer opens their link.

**Query params**
```
token=a1b2c3d4-uuid-from-sms
```

**Response 200**
```json
{
  "tracking_id": "VCT-20260307-1234",
  "status": "out_for_delivery",
  "customer_name": "Sarah Chen",
  "package_count": 2,
  "address": "742 Evergreen Terrace, Springfield, IL",
  "estimated_time_window": "2:30 PM – 4:00 PM",
  "driver": {
    "name": "Alex Rivera",
    "rating": 4.9,
    "total_deliveries": 234,
    "vehicle": "Ford Transit · ABC-1234",
    "phone": "+15551234567"
  },
  "company": {
    "name": "Acme Logistics",
    "logo_url": null
  },
  "timeline": [
    { "label": "Order received", "time": "8:00 AM", "done": true },
    { "label": "Route assigned", "time": "8:45 AM", "done": true },
    { "label": "Driver picked up", "time": "9:30 AM", "done": true },
    { "label": "Out for delivery", "time": "11:15 AM", "done": true },
    { "label": "Delivered", "time": null, "done": false }
  ],
  "already_rated": false
}
```

**Response 404**
```json
{ "error": "not_found", "message": "Tracking link is invalid or has expired." }
```

---

#### POST /track/rate  [PUB]

Customer submits a delivery rating. Rate-limited to 1 submission per token.

**Query params**
```
token=a1b2c3d4-uuid-from-sms
```

**Request body**
```json
{
  "rating": 5,
  "comment": "Super fast delivery, handled with care!",
  "categories": {
    "on_time": true,
    "handled_with_care": true,
    "professional": true,
    "followed_instructions": false
  }
}
```

**Response 201**
```json
{
  "message": "Thank you for your feedback!",
  "rating": 5
}
```

**Response 409**
```json
{ "error": "already_rated", "message": "This delivery has already been rated." }
```

**Response 422**
```json
{ "error": "not_delivered", "message": "Ratings can only be submitted after delivery is complete." }
```

---

## 6. ROUTES (Fleet owner creates, assigns, optimizes)

> These endpoints support the route-building flow available from the dashboard  
> and from the driver's "New Route" screen (for self-assigned routes, if permitted).

---

#### GET /routes  [WEB]

List all routes for the company.

**Query params**
```
date=2026-03-07
status=draft|scheduled|active|completed|cancelled
driver_id=drv_001
page=1
limit=20
```

**Response 200**
```json
{
  "data": [
    {
      "id": "rte_xyz",
      "name": "Downtown Route #47",
      "date": "2026-03-07",
      "status": "active",
      "driver_id": "drv_001",
      "driver_name": "Alex Rivera",
      "total_stops": 8,
      "completed_stops": 3,
      "total_distance_km": 42.8,
      "estimated_duration_min": 204,
      "optimization_score": 87,
      "created_at": "2026-03-07T07:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 12 }
}
```

---

#### POST /routes  [WEB + MOB]

Create a new route with a set of stops.

**Request body**
```json
{
  "name": "North Side Route",
  "date": "2026-03-08",
  "driver_id": "drv_001",
  "notes": "Avoid highway 44",
  "stops": [
    {
      "customer_name": "Jane Smith",
      "customer_phone": "+15552345678",
      "address": "456 Market Street",
      "city": "Springfield",
      "postal_code": "62702",
      "packages": 2,
      "priority": "normal",
      "time_window_start": "09:00",
      "time_window_end": "12:00",
      "notes": "Gate code 1234",
      "lat": 39.7950,
      "lng": -89.6420
    }
  ],
  "optimize": true
}
```

**Response 201**
```json
{
  "id": "rte_new",
  "name": "North Side Route",
  "date": "2026-03-08",
  "status": "scheduled",
  "driver_id": "drv_001",
  "total_stops": 1,
  "total_distance_km": 18.3,
  "estimated_duration_min": 62,
  "optimization_score": 91,
  "stops": [
    {
      "id": "stp_new001",
      "sequence": 1,
      "tracking_token": "b2c3d4e5-..."
    }
  ]
}
```

---

#### POST /routes/:route_id/optimize  [WEB]

Re-run route optimization on an existing route. Returns the new stop order.

**Request body** _(none)_

**Response 200**
```json
{
  "route_id": "rte_xyz",
  "optimization_score": 92,
  "distance_saved_km": 4.2,
  "time_saved_min": 18,
  "new_stop_order": [
    { "stop_id": "stp_003", "sequence": 1 },
    { "stop_id": "stp_001", "sequence": 2 },
    { "stop_id": "stp_002", "sequence": 3 }
  ]
}
```

---

#### PATCH /routes/:route_id  [WEB]

Update route metadata or reassign to a different driver.

**Request body**
```json
{
  "driver_id": "drv_002",
  "name": "Downtown Route #47 (Revised)",
  "notes": "New instructions from manager"
}
```

**Response 200**
```json
{
  "id": "rte_xyz",
  "driver_id": "drv_002",
  "updated_at": "2026-03-07T12:00:00Z"
}
```

---

#### DELETE /routes/:route_id  [WEB]

Delete a route in `draft` or `scheduled` status. Active/completed routes cannot be deleted.

**Response 204** _(no content)_

**Response 409**
```json
{ "error": "route_active", "message": "Cannot delete a route that is active or completed." }
```

---

## 7. REALTIME SUBSCRIPTIONS (Supabase Realtime channels)

These are not HTTP requests — they are WebSocket subscriptions managed by the Supabase client.

| Channel | Table | Filter | Events | Consumer |
|---|---|---|---|---|
| `drivers-location` | `drivers` | `company_id=eq.{id}` | UPDATE | Dashboard Tracking map |
| `stops-status` | `stops` | `company_id=eq.{id}` | UPDATE | Dashboard Orders board |
| `notifications-admin` | `notifications` | `user_id=eq.{uid}` | INSERT | Dashboard notification badge |
| `my-route` | `routes` | `driver_id=eq.{id}` | UPDATE | Driver Home + Assignments |
| `my-stops` | `stops` | `driver_id=eq.{id}` | UPDATE | Driver Navigation |
| `notifications-driver` | `notifications` | `user_id=eq.{uid}` | INSERT | Driver notification badge |

---

## 8. ERROR RESPONSE FORMAT (all endpoints)

```json
{
  "error": "machine_readable_code",
  "message": "Human-readable explanation.",
  "details": {}
}
```

**Common HTTP status codes used:**

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No content (DELETE success) |
| 400 | Bad request / validation failure |
| 401 | Unauthenticated (missing or expired JWT) |
| 403 | Forbidden (wrong role or wrong company) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, constraint violation) |
| 422 | Unprocessable (business rule violation) |
| 429 | Rate limited |
| 500 | Internal server error |
