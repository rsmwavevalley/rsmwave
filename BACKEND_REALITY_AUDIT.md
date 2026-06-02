# RSM Wave Valley — Final Backend Reality Audit Report

This audit classifies all registered Express backend endpoints into three architectural states:
1.  **REAL IMPLEMENTATION**: Success relies entirely on active Prisma/MySQL database rows. No fallback exists.
2.  **HYBRID IMPLEMENTATION**: Attempts real Prisma/MySQL access first. Falls back gracefully to process-wide in-memory cache stores (`global.mockBookingsMap`) upon database connection exceptions, allowing offline full-stack sandbox testing.
3.  **FULL MOCK IMPLEMENTATION**: Stateless, config-based endpoints operating in memory. No database table required.

---

## 📊 Summary of Architectural Classifications

| Route Path | Controller | Classification | Mock Fallback | Production-Ready |
| :--- | :--- | :--- | :---: | :---: |
| `POST /api/bookings/create` | `bookingController.js` | **HYBRID** | **YES** | **NO** |
| `POST /api/payments/create-order` | `paymentController.js` | **HYBRID** | **YES** | **NO** |
| `POST /api/payments/verify-payment` | `paymentController.js` | **HYBRID** | **YES** | **NO** |
| `POST /api/admin/verify-pin` | `adminController.js` | **FULL MOCK** | **NO** | **PARTIAL** |
| `GET /api/admin/dashboard` | `adminController.js` | **HYBRID** | **YES** | **NO** |
| `GET /api/admin/bookings` | `adminController.js` | **HYBRID** | **YES** | **NO** |
| `POST /api/admin/verify-ticket` | `adminController.js` | **HYBRID** | **YES** | **NO** |
| `POST /api/admin/checkin` | `adminController.js` | **HYBRID** | **YES** | **NO** |
| `GET /api/admin/checkins` | `adminController.js` | **HYBRID** | **YES** | **NO** |
| `GET /api/tickets/status/:bookingId` | `ticketController.js` | **HYBRID** | **YES** | **NO** |
| `GET /api/config/pricing` | `configController.js` | **FULL MOCK** | **NO** | **COMPLETE** |
| `GET /api/capacity` | `capacityController.js` | **HYBRID** | **YES** | **NO** |

---

## 🔎 Detailed Route Audit Specifications

### 1. `POST /api/bookings/create`
*   **Controller**: [bookingController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/bookingController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Writes guest metadata inside the database using `prisma.booking.create()`. If MySQL is offline, catches the initialization exception, writes diagnostics to console, and returns a dynamic fallback booking row with a 201 status.
*   **Production-Ready**: **NO** (rely on mock fallback if DB is down).
*   **Mock Fallback**: **YES** (active).
*   **Required Backend Work**: Remove the local mock fallback try/catch, implement a Prisma visitor count query checking that paid guest slot aggregates on `visitDate` do not exceed 1000, and ensure production MySQL connection string exists in configurations.

---

### 2. `POST /api/payments/create-order`
*   **Controller**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Searches for booking using `prisma.booking.findUnique()`. If connection fails, fetches the booking from `global.mockBookingsMap` memory store. Attempts standard Razorpay order generation; on SDK connection timeouts, generates a dynamic mock order payload.
*   **Production-Ready**: **NO** (allows order bypasses and fallback mock orders).
*   **Mock Fallback**: **YES** (active).
*   **Required Backend Work**: Configure live production merchant keys. Remove all signature-check bypasses and mock Razorpay order creations from handlers. Enforce check constraint that booking status is strictly `'PENDING'` before ordering.

---

### 3. `POST /api/payments/verify-payment`
*   **Controller**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Validates HMAC signature (bypassing if mock order is used). Attempts to commit transaction logs inside `Booking`, `Payment`, and `Ticket` models. If MySQL is offline, stores `'PAID'` state in `global.mockBookingsMap` and runs ticket PDF generation successfully.
*   **Production-Ready**: **NO** (uses fallback signature checks and skips MySQL verification).
*   **Mock Fallback**: **YES** (active).
*   **Required Backend Work**: Enforce unique constraints on `Payment.razorpayPaymentId` in the schema. Wrap signature validation in a database transaction block, and implement Razorpay payment capture webhook listener.

---

### 4. `POST /api/admin/verify-pin`
*   **Controller**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Classification**: **FULL MOCK IMPLEMENTATION** (Stateless configuration verify)
*   **Current Behavior**: Compares user input string directly against standard environment variable `process.env.ADMIN_PIN` or fallback passcode `"458921"`.
*   **Production-Ready**: **PARTIAL** (functional, but insecure).
*   **Mock Fallback**: **NO** (stateless).
*   **Required Backend Work**: Store the PIN passcode as a securely salted hash (e.g. bcrypt) instead of a cleartext variable. Mount rate limit middleware (active!).

---

### 5. `GET /api/admin/dashboard`
*   **Controller**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Queries count and aggregate sums for today's metrics. On database connection refusal, compiles and aggregates statistics from entries stored in the `global.mockBookingsMap` cache.
*   **Production-Ready**: **NO** (lacks API endpoint authorization middleware and relies on in-memory stats aggregates).
*   **Mock Fallback**: **YES** (active).
*   **Required Backend Work**: Apply administrative auth header check middleware. Optimize query indexing and store dashboard counts inside memory caches (like Redis) to prevent bottlenecking production database pools.

---

### 6. `GET /api/admin/bookings`
*   **Controller**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Queries all `Booking` entries sorted descending. On database connection refusal, retrieves entries from `global.mockBookingsMap`.
*   **Production-Ready**: **NO** (unsecured admin route, uses fallback memory store).
*   **Mock Fallback**: **YES** (active).
*   **Required Work**: Apply auth middleware. Remove the mock memory roster fallback logic.

---

### 7. `POST /api/admin/verify-ticket`
*   **Controller**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Searches database for unique `bookingId`. Falls back to `global.mockBookingsMap` if MySQL is offline. Evaluates calendar visit date thresholds against local date times (`VALID`, `USED`, `EXPIRED`, `NOT_VALID_YET`, `UNPAID`).
*   **Production-Ready**: **NO** (uses mock fallbacks and lacks backend auth checks).
*   **Mock Fallback**: **YES** (active).
*   **Required Work**: Apply auth checks and ensure lookups filter using indices.

---

### 8. `POST /api/admin/checkin`
*   **Controller**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Validates reservation status in MySQL or `global.mockBookingsMap`. Sets `isCheckedIn: true` and checked-in timestamp inside `prisma.booking.update()`. Falls back to caching check-ins in memory if MySQL connection fails.
*   **Production-Ready**: **NO** (unsecure endpoint, uses fallbacks, and lacks lock protections).
*   **Mock Fallback**: **YES** (active).
*   **Required Work**: Secure administrative endpoint routes. Wrap check-in updating inside serial transaction locks to prevent concurrency bypass scans.

---

### 9. `GET /api/admin/checkins`
*   **Controller**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Queries checked-in records. Falls back to compiling checked-in logs from `global.mockBookingsMap` if MySQL is offline.
*   **Production-Ready**: **NO** (unsecure admin route, uses fallbacks).
*   **Mock Fallback**: **YES** (active).
*   **Required Work**: Apply auth headers middleware.

---

### 10. `GET /api/tickets/status/:bookingId`
*   **Controller**: [ticketController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/ticketController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Queries the database to determine if a compiled PDF row exists for the booking ID. If MySQL is offline, returns `{ ready: false }`.
*   **Production-Ready**: **NO** (uses mock fallback).
*   **Mock Fallback**: **YES** (active).
*   **Required Work**: Remove the fallback catch-block checks.

---

### 11. `GET /api/config/pricing`
*   **Controller**: [configController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/configController.js)
*   **Classification**: **FULL MOCK IMPLEMENTATION** (Stateless configuration endpoints)
*   **Current Behavior**: Exposes core system V1 standard pricing schemas in Express JSON format.
*   **Production-Ready**: **COMPLETE** (stateless architecture meets resort V1 requirements exactly).
*   **Mock Fallback**: **NO** (stateless by design).
*   **Required Work**: Hook up database configuration tables *only* if the administrator requests dynamic pricing sliders in administrative views in V2.

---

### 12. `GET /api/capacity`
*   **Controller**: [capacityController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/capacityController.js)
*   **Classification**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Aggregates paid ticket sums for a date from MySQL. If connection fails, falls back to maximum slots limit of 1000 open slots.
*   **Production-Ready**: **NO** (uses fallback slots totals).
*   **Mock Fallback**: **YES** (active).
*   **Required Work**: Remove standard fallback slots counts.
