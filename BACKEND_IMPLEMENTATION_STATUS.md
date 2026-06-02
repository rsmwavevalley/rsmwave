# RSM Wave Valley — Backend Endpoint Implementation Status

This document contains a complete backend implementation inventory. It acts as a definitive specification ledger, allowing the backend developer to identify every route requiring production-ready conversion.

All Express backend endpoints operate in a **HYBRID** architectural state designed to remain fully functional, offline-resilient, and sandbox-testable without database connections or live gateways.

---

## 📋 Comprehensive Endpoint Status Ledger

### 1. `POST /api/bookings/create`
*   **Controller File**: [bookingController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/bookingController.js)
*   **Function Name**: `createBooking`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Parses standard guest body parameters. Inserts record using Prisma client `prisma.booking.create()`.
*   **Mock Fallback Logic**: If database connection fails (e.g. unmigrated database or offline), catches the initialization exception, logs detailed diagnostic logs, generates a dynamic mock booking payload with a random integer ID, and returns `201 Created` to prevent checkout crashes.
*   **Files Involved**:
    *   `server/src/controllers/bookingController.js`
    *   `server/src/routes/bookingRoutes.js`
*   **Production Readiness Score**: **75%**
*   **Risk Level**: 🟡 **Medium** (potential overbooking if slot capacity is not checked).
*   **Dependencies**: Prisma Client pool, `generateBookingId` utility.
*   **Production Replacement Required**: Remove the local mock fallback `try/catch` block. Implement a pre-creation Prisma query checking that paid guest slot aggregates on `visitDate` do not exceed 1000, and ensure production MySQL connection string exists in configurations.

---

### 2. `POST /api/payments/create-order`
*   **Controller File**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Function Name**: `createPaymentOrder`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Queries database using `prisma.booking.findUnique()` and contacts Razorpay SDK order creation (`razorpay.orders.create`).
*   **Mock Fallback Logic**: If MySQL is offline, pulls the booking from `global.mockBookingsMap` or generates a fallback guest profile. If Razorpay order creation fails due to network/credential issues, intercept the error and return a dynamically generated mock Razorpay order payload.
*   **Files Involved**:
    *   `server/src/controllers/paymentController.js`
    *   `server/src/routes/paymentRoutes.js`
*   **Production Readiness Score**: **70%**
*   **Risk Level**: 🟠 **High** (re-billing or double-spend risk if booking payment status checks are omitted).
*   **Dependencies**: Prisma Client, Razorpay SDK.
*   **Production Replacement Required**: Remove all catch-block mock creations and shared memory list checks. Block order recreation for PAID bookings. Configure live production merchant keys.

---

### 3. `POST /api/payments/verify-payment`
*   **Controller File**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Function Name**: `verifyPayment`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Compares signature hashes, sets booking status to `PAID`, logs payment rows, and generates PDF tickets.
*   **Mock Fallback Logic**: If a mock order ID is passed, bypasses signature verification. If database is offline, marks booking as `'PAID'` inside `global.mockBookingsMap` instead and compiles tickets.
*   **Files Involved**:
    *   `server/src/controllers/paymentController.js`
    *   `server/src/routes/paymentRoutes.js`
    *   `server/src/services/ticketService.js`
*   **Production Readiness Score**: **65%**
*   **Risk Level**: 🟠 **High** (payment signature spoofing vulnerability and transaction concurrency hazards).
*   **Dependencies**: Prisma, Crypto, PDFKit compiler services.
*   **Production Replacement Required**: Remove the mock order signature check bypass and shared cache mapping updates. Restrict payments database writes using secure isolated SQL transaction blocks.

---

### 4. `POST /api/admin/verify-pin`
*   **Controller File**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `verifyPin`
*   **Current Status**: **FULL MOCK IMPLEMENTATION** (Stateless configuration verify)
*   **Current Behavior**: Compares plaintext input directly against standard environment variable `process.env.ADMIN_PIN` or fallback passcode `"458921"`.
*   **Mock Fallback Logic**: None (stateless, but has default value fallback).
*   **Files Involved**:
    *   `server/src/controllers/adminController.js`
    *   `server/src/routes/adminRoutes.js`
*   **Production Readiness Score**: **80%**
*   **Risk Level**: 🟡 **Medium** (plaintext configuration vulnerability).
*   **Dependencies**: Process configurations, custom PIN rate limiter.
*   **Production Replacement Required**: Salt and hash stored credentials using standard encryption libraries (like bcrypt) and query dynamic staff accounts.

---

### 5. `GET /api/admin/dashboard`
*   **Controller File**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `getDashboardStats`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Runs Prisma aggregates and counts for today's logs.
*   **Mock Fallback Logic**: Catches database exceptions, querying and aggregating the daily statistics from the in-memory shared cache map items instead.
*   **Files Involved**:
    *   `server/src/controllers/adminController.js`
    *   `server/src/routes/adminRoutes.js`
*   **Production Readiness Score**: **65%**
*   **Risk Level**: 🔴 **Critical** (exposed public route leakages of administrative water park statistics).
*   **Dependencies**: Prisma, AdminAuth headers middleware.
*   **Production Replacement Required**: Remove the catch-block cache list queries. Implement admin auth headers protection.

---

### 6. `GET /api/admin/bookings`
*   **Controller File**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `getBookingsList`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Finds many bookings using Prisma sorted descending.
*   **Mock Fallback Logic**: Catches DB connection failures, returning all records stored inside the process-wide cache map.
*   **Files Involved**:
    *   `server/src/controllers/adminController.js`
    *   `server/src/routes/adminRoutes.js`
*   **Production Readiness Score**: **70%**
*   **Risk Level**: 🔴 **Critical** (exposed public route leakages of personal visitor names, phone numbers, and emails).
*   **Dependencies**: Prisma, AdminAuth headers.
*   **Production Replacement Required**: Secure route with auth headers and remove in-memory roster fallbacks.

---

### 7. `POST /api/admin/verify-ticket`
*   **Controller File**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `verifyTicket`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Resolves scanned ticket row via Prisma unique searches. Evaluates calendar day check against today's date, returning verification statuses (`VALID`, `USED`, `EXPIRED`, etc.).
*   **Mock Fallback Logic**: Catches DB exceptions, pulling the scanned ticket record from `global.mockBookingsMap` instead to execute verification checks.
*   **Files Involved**:
    *   `server/src/controllers/adminController.js`
    *   `server/src/routes/adminRoutes.js`
*   **Production Readiness Score**: **70%**
*   **Risk Level**: 🟠 **High** (exposed lookup endpoint and timezone shift midnight glitch).
*   **Dependencies**: Prisma, AdminAuth.
*   **Production Replacement Required**: Secure route with auth headers, remove in-memory lookups, and ensure lookups filter using indices.

---

### 8. `POST /api/admin/checkin`
*   **Controller File**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `checkinTicket`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Searches booking, verifies checked-in status, and updates `isCheckedIn: true` inside MySQL using Prisma.
*   **Mock Fallback Logic**: Catches database exceptions, checking in the guest and committing status mutations inside `global.mockBookingsMap` instead.
*   **Files Involved**:
    *   `server/src/controllers/adminController.js`
    *   `server/src/routes/adminRoutes.js`
*   **Production Readiness Score**: **70%**
*   **Risk Level**: 🔴 **Critical** (unsecured endpoint permitting gate admittance spoofing).
*   **Dependencies**: Prisma, AdminAuth.
*   **Production Replacement Required**: Secure route with auth headers and wrap mutations in database transaction locks to prevent concurrent double-admittances.

---

### 9. `GET /api/admin/checkins`
*   **Controller File**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `getCheckinLogs`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Queries checked-in records using Prisma.
*   **Mock Fallback Logic**: Catches DB exceptions, compiling and sorting check-in histories from `global.mockBookingsMap` cache.
*   **Files Involved**:
    *   `server/src/controllers/adminController.js`
    *   `server/src/routes/adminRoutes.js`
*   **Production Readiness Score**: **70%**
*   **Risk Level**: 🔴 **Critical** (exposed public route leakages of check-in audits).
*   **Dependencies**: Prisma, AdminAuth.
*   **Production Replacement Required**: Secure route with auth checks and remove memory iterations in catch blocks.

---

### 10. `GET /api/tickets/status/:bookingId`
*   **Controller File**: [ticketController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/ticketController.js)
*   **Function Name**: `getTicketStatus`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Searches `prisma.ticket` for dynamic PDF paths.
*   **Mock Fallback Logic**: On database connection failures, returns `{ ready: false }` gracefully.
*   **Files Involved**:
    *   `server/src/controllers/ticketController.js`
    *   `server/src/routes/ticketRoutes.js`
*   **Production Readiness Score**: **75%**
*   **Risk Level**: 🟢 **Low** (isolated file compilation checker).
*   **Dependencies**: Prisma Client pool.
*   **Production Replacement Required**: Remove database connection fail-safe fallbacks.

---

### 11. `GET /api/config/pricing`
*   **Controller File**: [configController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/configController.js)
*   **Function Name**: `getPricingConfig`
*   **Current Status**: **FULL MOCK IMPLEMENTATION** (Stateless configuration endpoints)
*   **Current Behavior**: Exposes core water park rates in Express JSON format.
*   **Mock Fallback Logic**: None (stateless).
*   **Files Involved**:
    *   `server/src/controllers/configController.js`
    *   `server/src/routes/configRoutes.js`
*   **Production Readiness Score**: **100%**
*   **Risk Level**: 🟢 **Low** (public stateless config).
*   **Dependencies**: None.
*   **Production Replacement Required**: None for V1. Map to database configuration models in V2 only if administrators request dynamic sliders.

---

### 12. `GET /api/capacity`
*   **Controller File**: [capacityController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/capacityController.js)
*   **Function Name**: `getDateCapacity`
*   **Current Status**: **HYBRID IMPLEMENTATION**
*   **Current Behavior**: Aggregates paid ticket sums for a date from MySQL using Prisma Client.
*   **Mock Fallback Logic**: On database connection failures, falls back to maximum slots limit of 1000 open slots.
*   **Files Involved**:
    *   `server/src/controllers/capacityController.js`
    *   `server/src/routes/capacityRoutes.js`
*   **Production Readiness Score**: **75%**
*   **Risk Level**: 🟡 **Medium** (capacity overbooking fallback).
*   **Dependencies**: Prisma client pool.
*   **Production Replacement Required**: Remove standard fallback slots counts.
