# Vector API Documentation

This document explicitly defines all endpoints exposed by the Vector server, the expected inputs, outputs, and authorization rules, tailored to support the Vector web frontend.

---

## Global Concepts

**Base URL**: `/` (typically prepended with `/api/v1` or similar, check server config)

**Authorization**: 
Most endpoints require a valid JWT Access Token sent in the generic `Authorization` header:
`Authorization: Bearer <access_token>`

Roles involved:
- **Public**: No token required.
- **Admin**: The fleet owner/admin. Can manage everything.
- **Manager**: A dispatcher. Can manage routes, drivers, and orders.
- **Driver**: Can only read assigned routes, update status.

---

## 1. Authentication (`/auth`)

### 1.1 Sign In
- **Method**: `POST`
- **Endpoint**: `/auth/sign-in`
- **Auth**: Public
- **Input (JSON)**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "device_id": "optional-device-identifier"
  }
  ```
- **Output (200 OK)**:
  ```json
  {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "admin|manager|driver",
      "company_id": "uuid"
    },
    "device_id": "string"
  }
  ```

### 1.2 Sign Up Fleet (Admin)
- **Method**: `POST`
- **Endpoint**: `/auth/sign-up/fleet`
- **Auth**: Public
- **Input**:
  ```json
  {
    "email": "admin@company.com",
    "password": "password123",
    "full_name": "John Doe",
    "company_name": "Fast Delivery LLC",
    "plan_id": "pro-tier"
  }
  ```
- **Output (201 Created)**:
  ```json
  {
    "message": "Company and account created. Please verify your email.",
    "user_id": "uuid",
    "company": {
      "id": "uuid",
      "name": "Fast Delivery LLC",
      "company_code": "FLEET-XXXXXX"
    },
    "checkout_url": "url-string"
  }
  ```

### 1.3 Sign Up Driver
- **Method**: `POST`
- **Endpoint**: `/auth/sign-up/driver`
- **Auth**: Public
- **Input**:
  ```json
  {
    "email": "driver@company.com",
    "password": "password123",
    "full_name": "Jane Driver",
    "phone": "+1234567890",
    "company_code": "FLEET-XXXXXX",
    "vehicle_type": "van", // optional
    "vehicle_plate": "ABC-1234" // optional
  }
  ```
- **Output (201 Created)**: Similar to fleet setup message.

### 1.4 Verify Email
- **Method**: `POST`
- **Endpoint**: `/auth/verify-email`
- **Auth**: Public
- **Input**:
  ```json
  {
    "email": "user@example.com",
    "token": "123456"
  }
  ```

### 1.5 Refresh Token
- **Method**: `POST`
- **Endpoint**: `/auth/refresh`
- **Auth**: Public
- **Input**:
  ```json
  {
    "refresh_token": "eyJhbG..."
  }
  ```
- **Output (200 OK)**: Returns new `access_token` and `refresh_token` identical to Sign In.

### 1.6 Forgot Password
- **Method**: `POST`
- **Endpoint**: `/auth/forgot-password`
- **Auth**: Public
- **Input**: `{ "email": "user@example.com" }`

### 1.7 Reset Password
- **Method**: `POST`
- **Endpoint**: `/auth/reset-password`
- **Auth**: Public
- **Input**:
  ```json
  {
    "token": "reset-uuid",
    "new_password": "NewPassword123!"
  }
  ```

### 1.8 Sign Out
- **Method**: `POST`
- **Endpoint**: `/auth/sign-out`
- **Auth**: Logged In User
- **Input**: None
- **Output (204 No Content)**: Token revoked

---

## 2. Dashboard - Overview (`/dashboard`)

### 2.1 Get Metrics
- **Method**: `GET`
- **Endpoint**: `/dashboard/metrics`
- **Auth**: Admin, Manager
- **Output**: Returns dashboard KPIs (e.g., total drivers, active routes, deliveries completed).

### 2.2 Get Active Drivers
- **Method**: `GET`
- **Endpoint**: `/dashboard/active-drivers`
- **Auth**: Admin, Manager
- **Output**: Array of active drivers.

### 2.3 Get Recent Orders
- **Method**: `GET`
- **Endpoint**: `/dashboard/recent-orders`
- **Auth**: Admin, Manager
- **Output**: Array of recent orders.

---

## 3. Dashboard - Orders (`/dashboard/orders`)

### 3.1 List Orders
- **Method**: `GET`
- **Endpoint**: `/dashboard/orders`
- **Auth**: Admin, Manager
- **Query Params**: 
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `search` (string, optional)
  - `status` (string, optional)
- **Output**: Paginated list of orders.

### 3.2 Create Order
- **Method**: `POST`
- **Endpoint**: `/dashboard/orders`
- **Auth**: Admin, Manager
- **Input**: 
  ```json
  {
    "customer_name": "String",
    "customer_email": "String (optional)",
    "customer_phone": "String (optional)",
    "address": "String",
    "city": "String (optional)",
    "state": "String (optional)",
    "postal_code": "String (optional)",
    "packages": 1, // Optional, Min 1
    "priority": "LOW|NORMAL|HIGH|URGENT", // Optional enum
    "time_window_start": "String (optional)",
    "time_window_end": "String (optional)",
    "notes": "String (optional)"
  }
  ```
- **Output**: The created order object.

### 3.3 Update Order
- **Method**: `PATCH`
- **Endpoint**: `/dashboard/orders/:stop_id`
- **Auth**: Admin, Manager
- **Input**: Same as Create Order, but all fields optional, plus:
  ```json
  {
    "route_id": "String (optional)",
    "driver_id": "String (optional)"
  }
  ```

### 3.4 Delete Order
- **Method**: `DELETE`
- **Endpoint**: `/dashboard/orders/:stop_id`
- **Auth**: Admin, Manager
- **Output (204 No Content)**

### 3.5 Bulk Import
- **Method**: `POST`
- **Endpoint**: `/dashboard/orders/bulk`
- **Auth**: Admin, Manager
- **Input**: `{ "orders": [ { /* CreateOrderDto */ } ] }`

---

## 4. Dashboard - Drivers (`/dashboard/drivers`)

### 4.1 List Drivers
- **Method**: `GET`
- **Endpoint**: `/dashboard/drivers`
- **Auth**: Admin, Manager
- **Query Params**: `page`, `limit`, `search`, `status`
- **Output**: Paginated list of drivers.

### 4.2 Invite Driver
- **Method**: `POST`
- **Endpoint**: `/dashboard/drivers/invite`
- **Auth**: Admin, Manager
- **Input**: 
  ```json
  {
    "full_name": "String",
    "email": "driver@example.com",
    "phone": "String",
    "vehicle_type": "String (optional)",
    "vehicle_plate": "String (optional)"
  }
  ```

### 4.3 Get Driver Detail
- **Method**: `GET`
- **Endpoint**: `/dashboard/drivers/:driver_id`
- **Auth**: Admin, Manager

### 4.4 Update Driver
- **Method**: `PATCH`
- **Endpoint**: `/dashboard/drivers/:driver_id`
- **Auth**: Admin, Manager
- **Input**:
  ```json
  {
    "full_name": "String (optional)",
    "phone": "String (optional)",
    "status": "active|idle|offline|suspended", // optional
    "vehicle_type": "String (optional)",
    "vehicle_plate": "String (optional)"
  }
  ```

### 4.5 Delete Driver
- **Method**: `DELETE`
- **Endpoint**: `/dashboard/drivers/:driver_id`
- **Auth**: Admin, Manager
- **Output (204 No Content)**

---

## 5. Routes (`/routes`)

### 5.1 List Routes
- **Method**: `GET`
- **Endpoint**: `/routes`
- **Auth**: Admin, Manager
- **Query**: Filters

### 5.2 Create Route
- **Method**: `POST`
- **Endpoint**: `/routes`
- **Auth**: Admin, Manager
- **Input**: Route creation payload (JSON).

### 5.3 Get Route Detail
- **Method**: `GET`
- **Endpoint**: `/routes/:route_id`
- **Auth**: Admin, Manager, Driver (if assigned)

### 5.4 Update Route
- **Method**: `PATCH`
- **Endpoint**: `/routes/:route_id`
- **Auth**: Admin, Manager
- **Input**: Route update payload (JSON).

### 5.5 Delete Route
- **Method**: `DELETE`
- **Endpoint**: `/routes/:route_id`
- **Auth**: Admin, Manager
- **Output (204 No Content)**

### 5.6 Optimize Route
- **Method**: `POST`
- **Endpoint**: `/routes/:route_id/optimize`
- **Auth**: Admin, Manager

### 5.7 Assign Route
- **Method**: `POST`
- **Endpoint**: `/routes/:route_id/assign`
- **Auth**: Admin, Manager
- **Input**: `{ "driver_id": "uuid" }`

---

## 6. Real-time Tracking (`/dashboard/tracking`)

### 6.1 Get Live Drivers
- **Method**: `GET`
- **Endpoint**: `/dashboard/tracking/drivers`
- **Auth**: Admin, Manager
- **Output**: Returns real-time coordinates of drivers.

---

## 7. Reports (`/dashboard/reports`)

Most report endpoints accept the following query parameters:
- `start_date` (string)
- `end_date` (string)
- `driver_id` (string)
- `format` (json|csv|pdf)

### 7.1 Report Summary
- **Method**: `GET`
- **Endpoint**: `/dashboard/reports/summary`
- **Auth**: Admin, Manager

### 7.2 Report Charts
- **Method**: `GET`
- **Endpoint**: `/dashboard/reports/charts`
- **Auth**: Admin, Manager

### 7.3 Driver Performance
- **Method**: `GET`
- **Endpoint**: `/dashboard/reports/performance`
- **Auth**: Admin, Manager
- **Query Params**: Same as above plus pagination (`page`, `limit`).

### 7.4 Export CSV
- **Method**: `GET`
- **Endpoint**: `/dashboard/reports/export`
- **Auth**: Admin, Manager
- **Output**: CSV file.

---

## 8. Billing (`/dashboard/billing`)
*All require Admin or Manager*

- `GET /dashboard/billing`: Returns current plan and billing stats.
- `GET /dashboard/billing/invoices`: Returns list of past invoices.
- `POST /dashboard/billing/plan`: Updates the current plan.
  ```json
  {
    "plan_id": "String",
    "billing_cycle": "monthly|annual" // optional
  }
  ```
- `POST /dashboard/billing/payment-method`: Provides URL/intent to update card.
- `DELETE /dashboard/billing/cancel`: Cancels current plan (returns 200 OK).

---

## 9. Settings (`/dashboard/settings`)
*All require Admin or Manager*

- `GET /dashboard/settings`: Returns company settings.
- `PATCH /dashboard/settings`: Updates company settings.
  ```json
  {
    "name": "String (optional)",
    "billing_email": "String (optional)",
    "timezone": "String (optional)"
  }
  ```
- `POST /dashboard/settings/api-keys`: Creates a developer API key.
  ```json
  {
    "name": "String"
  }
  ```
- `DELETE /dashboard/settings/api-keys/:key_id`: Revokes an API key (returns 204 No Content).

---

## 10. Notifications (`/dashboard/notifications`)

- `GET /dashboard/notifications`: Returns paginated user notifications.
- `PATCH /dashboard/notifications/:notification_id/read`: Marks a notification as read.
- `POST /dashboard/notifications/read-all`: Marks all as read.
- `DELETE /dashboard/notifications/:notification_id`: Deletes a notification (returns 204 No Content).
