# VECTOR Fleet API Documentation

The VECTOR Fleet API is built to serve the React web portal (used by Fleet Owners) and the React Native mobile app (used by Drivers).

> **Authentication**: All endpoints (except public Auth endpoints like signin/signup) require a valid JWT Access Token passed in the `Authorization` header as a Bearer token.
> **Role-Based Access**: Endpoints are split by roles (`owner` or `driver`). The Fleet Owner has access to `/dashboard/*` endpoints. Drivers have access to `/driver/*` endpoints.

---

## 🔒 Authentication

### 1. `POST /auth/signup`
**Description**: Registers a new fleet owner and creates a new company record.
* **Authorized**: Public
* **Input Body**:
  * `company_name` (string, required)
  * `email` (string, required) - Valid email format
  * `password` (string, required) - Minimum 8 characters
* **Expected Output**:
  * `201 Created`
  * Body: `{ "access_token": "jwt_string", "refresh_token": "jwt_string", "user": { "id": "...", "role": "owner", ... } }`

### 2. `POST /auth/signin`
**Description**: Authenticates an existing user (Owner or Driver) and returns token pairs.
* **Authorized**: Public
* **Input Body**:
  * `email` (string, required)
  * `password` (string, required)
* **Expected Output**:
  * `200 OK`
  * Body: `{ "access_token": "...", "refresh_token": "...", "user": { ... } }`

### 3. `POST /auth/refresh`
**Description**: Refreshes an expired access token using a valid refresh token.
* **Authorized**: Public (Requires refresh token in body or HttpOnly cookie depending on config)
* **Input Body**:
  * `refresh_token` (string, required)
* **Expected Output**:
  * `200 OK`
  * Body: `{ "access_token": "..." }`

### 4. `POST /auth/logout`
**Description**: Invalidates the current refresh token.
* **Authorized**: Authenticated (Any role)
* **Input Body**:
  * `refresh_token` (string, required)
* **Expected Output**:
  * `200 OK`

---

## 📊 Dashboard (Fleet Owner)

All endpoints in this section require the `owner` role.

### 1. `GET /dashboard/overview`
**Description**: Returns top-level metrics for the dashboard overview.
* **Authorized**: Owner
* **Input**: None
* **Expected Output**:
  * `200 OK`
  * Body: `{ "metrics": { "active_drivers": 12, "completed_orders": 45, "on_time_rate": 98.5, "total_revenue": 14500 }, "recent_activity": [...] }`

### 2. `GET /dashboard/orders`
**Description**: Fetches a paginated list of orders for the fleet.
* **Authorized**: Owner
* **Input Query Params**:
  * `page` (number, default: 1)
  * `limit` (number, default: 20)
  * `status` (string, optional: "pending", "assigned", "in_progress", "completed", "failed")
* **Expected Output**:
  * `200 OK`
  * Body: `{ "orders": [ { "id": "...", "customer_name": "...", "status": "pending", ... } ], "total": 150, "page": 1 }`

### 3. `POST /dashboard/orders`
**Description**: Creates a new delivery order.
* **Authorized**: Owner
* **Input Body**:
  * `customer_name` (string, required)
  * `customer_phone` (string, required)
  * `pickup_address` (string, required)
  * `delivery_address` (string, required)
  * `lat` (number, required)
  * `lng` (number, required)
  * `time_window_start` (ISO date string, optional)
  * `time_window_end` (ISO date string, optional)
* **Expected Output**:
  * `201 Created`
  * Body: `{ "id": "...", "tracking_number": "VECT-...", ... }`

### 4. `PATCH /dashboard/orders/:id`
**Description**: Updates fields of an existing order.
* **Authorized**: Owner
* **Input Param**: `id` (string)
* **Input Body**: Partial Order object (e.g. `status`, `driver_id`)
* **Expected Output**:
  * `200 OK`

### 5. `DELETE /dashboard/orders/:id`
**Description**: Deletes a specific order.
* **Authorized**: Owner
* **Input Param**: `id` (string)
* **Expected Output**: `204 No Content`

### 6. `POST /dashboard/orders/import`
**Description**: Bulk import orders via JSON array.
* **Authorized**: Owner
* **Input Body**: Array of Order objects.
* **Expected Output**: `201 Created` with summary of imported rows.

### 7. `GET /dashboard/drivers`
**Description**: Fetches all drivers associated with the fleet.
* **Authorized**: Owner
* **Expected Output**:
  * `200 OK`
  * Body: `{ "drivers": [ { "id": "...", "name": "...", "status": "active", ... } ] }`

### 8. `POST /dashboard/drivers/invite`
**Description**: Invites a new driver via email/SMS.
* **Authorized**: Owner
* **Input Body**:
  * `email` (string, required)
  * `name` (string, required)
  * `phone` (string, required)
* **Expected Output**: `201 Created`

### 9. `DELETE /dashboard/drivers/:id`
**Description**: Removes a driver from the fleet.
* **Authorized**: Owner
* **Input Param**: `id` (string)
* **Expected Output**: `204 No Content`

### 10. `GET /dashboard/routes`
**Description**: Fetches delivery routes.
* **Authorized**: Owner
* **Expected Output**: `200 OK` with array of routes.

### 11. `POST /dashboard/routes/optimize`
**Description**: Calls mapbox algorithms to optimize delivery paths for a given set of orders.
* **Authorized**: Owner
* **Input Body**:
  * `order_ids` (string[], required)
  * `driver_id` (string, required)
* **Expected Output**: `200 OK` with an optimized `Route` object.

### 12. `GET /dashboard/settings`
**Description**: Gets company profile, notification prefs, and API keys.
* **Authorized**: Owner
* **Expected Output**: `200 OK` with `{ "company": { ... }, "notifications": { ... } }`

### 13. `PATCH /dashboard/settings/company`
**Description**: Updates company operating details.
* **Authorized**: Owner
* **Input Body**: Partial Company object (`name`, `email`, `phone`, etc.)
* **Expected Output**: `200 OK`

### 14. `PATCH /dashboard/settings/notifications`
**Description**: Updates notification preferences.
* **Authorized**: Owner
* **Input Body**: configuration booleans.
* **Expected Output**: `200 OK`

### 15. `GET /dashboard/billing`
**Description**: Gets Stripe subscription information.
* **Authorized**: Owner
* **Expected Output**: `200 OK` with `{ "plan": "pro", "current_period_end": "..." }`

### 16. `POST /dashboard/billing/plan`
**Description**: Changes the subscription plan via Stripe.
* **Authorized**: Owner
* **Input Body**: `plan_id` (string: "free", "pro", "enterprise")
* **Expected Output**: `200 OK` containing checkout URL if upgrading to paid plan.

---

## 🚚 Driver App (Mobile Context)

All endpoints in this section require the `driver` role.

### 1. `GET /driver/route/active`
**Description**: Gets the current active route assigned to the driver.
* **Expected Output**: `200 OK` with full route and order objects.

### 2. `POST /driver/telemetry`
**Description**: Reports current GPS coordinates to the server.
* **Input Body**:
  * `lat` (number)
  * `lng` (number)
  * `speed` (number)
  * `bearing` (number)
* **Expected Output**: `200 OK`

### 3. `PATCH /driver/orders/:id/status`
**Description**: Updates order status (e.g. from `in_progress` to `completed`).
* **Input Param**: `id` (string, order ID)
* **Input Body**:
  * `status` (string, required)
  * `proof_of_delivery_url` (string, optional)
  * `notes` (string, optional)
* **Expected Output**: `200 OK`
