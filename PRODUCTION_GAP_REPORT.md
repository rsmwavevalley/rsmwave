# RSM Wave Valley — Backend Production Gap Audit Report

This report identifies every code location inside the Express backend where temporary development testing fallbacks, process-wide in-memory maps (`global.mockBookingsMap`), signature checking bypasses, and mock order builders exist. 

This document serves as a prioritized migration checklist for a backend database engineer to transition the repository to a production-grade live deployment.

---

## 🔎 Detailed Gap Code Audits

### 1. Fallback Guest Booking Generation
*   **File Path**: [bookingController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/bookingController.js)
*   **Function Name**: `createBooking`
*   **Approximate Line Numbers**: 48 to 74
*   **Reason It Exists**: Intercepts database connection exceptions when the MySQL service is offline, generating a dynamic offline guest booking row to let frontend tests succeed.
*   **Exact Production Replacement**: Remove the entire `try/catch` fallback block. Ensure that database write exceptions bubble up as `500 Server Error` (or `400 Bad Request` if payload violates SQL constraints). Hook up a pre-insertion Prisma check count mapping daily visitor maximum limits (1000 guest cap).

---

### 2. Booking Lookup Fallback & Cache Writer inside Order Creation
*   **File Path**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Function Name**: `createPaymentOrder`
*   **Approximate Line Numbers**: 22 to 43
*   **Reason It Exists**: If Prisma fails to locate the booking row (because MySQL is down or the guest was created in offline mock mode), it searches the shared memory cache `global.mockBookingsMap`. If still not found, it generates a fallback mock guest profile.
*   **Exact Production Replacement**: Remove the database `try/catch` fallbacks and the `if (!booking)` mock writer logic. Keep strictly `const booking = await prisma.booking.findUnique(...)` and return `404 Not Found` if the row is missing.

---

### 3. Mock Razorpay Order Creator
*   **File Path**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Function Name**: `createPaymentOrder`
*   **Approximate Line Numbers**: 54 to 73
*   **Reason It Exists**: Prevents gateway failures if process credentials inside `.env` are dummy values or internet connectivity is down during development testing, returning a mock Razorpay order.
*   **Exact Production Replacement**: Remove the `try/catch` mock order generator inside the Razorpay SDK call. Keep strictly `const order = await razorpay.orders.create(options)` to invoke the live Razorpay API.

---

### 4. Mock Signature Verification Bypass
*   **File Path**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Function Name**: `verifyPayment`
*   **Approximate Line Numbers**: 91 to 99
*   **Reason It Exists**: Detects if an offline mock order key is used (ID begins with `"order_MOCK_"`) and bypasses HMAC cryptography calculations, allowing simulated checkouts to complete successfully.
*   **Exact Production Replacement**: Delete the signature bypass conditional statement entirely. Force strict HMAC SHA-256 validation checks for all incoming payment notifications.

---

### 5. Payment status Memory Cache Update
*   **File Path**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Function Name**: `verifyPayment`
*   **Approximate Line Numbers**: 138 to 160
*   **Reason It Exists**: Commits payment verification states (marking status as `'PAID'`) to the global shared memory map `global.mockBookingsMap` if MySQL is offline.
*   **Exact Production Replacement**: Remove the `try/catch` fallback map commits. Require standard MySQL row updates via Prisma to be successful before completing ticket PDF compilations.

---

### 6. Admin KPI Stats Memory Aggregation
*   **File Path**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `getDashboardStats`
*   **Approximate Line Numbers**: 70 to 93
*   **Reason It Exists**: Calculates visitor slots, paid earnings, and check-in aggregates from process-wide memory map lists when the primary database is unavailable.
*   **Exact Production Replacement**: Remove the `try/catch` memory loop code blocks. Rely on Prisma aggregates and index lookups.

---

### 7. Reservations Roster Memory Fallback
*   **File Path**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `getBookingsList`
*   **Approximate Line Numbers**: 110 to 116
*   **Reason It Exists**: Loads checked-out reservation ledgers from the process memory cache sorted by ID desc when MySQL is unreachable.
*   **Exact Production Replacement**: Remove `global.mockBookingsMap` queries inside the catch block.

---

### 8. Scanner Ticket Lookup Fallback
*   **File Path**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `verifyTicket`
*   **Approximate Line Numbers**: 128 to 134
*   **Reason It Exists**: If MySQL connection fails, queries `global.mockBookingsMap` for the parsed ticket ID to let gate scanning screens display the correct guest profiles.
*   **Exact Production Replacement**: Banish in-memory lookups. Rely on Prisma index-based search filters.

---

### 9. Gate Check-in Status Cache Mutation
*   **File Path**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `checkinTicket`
*   **Approximate Line Numbers**: 180 to 186 and 203 to 214
*   **Reason It Exists**: Updates the checked-in flag (`isCheckedIn = true` and `checkedInAt = timestamp`) in the memory store on database offline exceptions, dynamically marking the ticket as `USED`.
*   **Exact Production Replacement**: Remove in-memory state manipulations. Force strict SQL transactions to prevent concurrent check-in scanner bypasses.

---

### 10. checked-in Audit Roster Memory Compiler
*   **File Path**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Function Name**: `getCheckinLogs`
*   **Approximate Line Numbers**: 238 to 256
*   **Reason It Exists**: Compiles gate check-in histories by filtering and mapping checked-in rows inside `global.mockBookingsMap` if MySQL is down.
*   **Exact Production Replacement**: Remove the cache lookup and filter loop inside the catch block.

---

### 11. Silent Ticket Database Fail-safe
*   **File Path**: [ticketService.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/services/ticketService.js)
*   **Function Name**: `generateTicket` (on finish callback)
*   **Approximate Line Numbers**: 172 to 181
*   **Reason It Exists**: Catches Prisma database write exceptions when inserting compiled PDF e-ticket details in the database, allowing guests to download the generated PDF asset even if MySQL is offline.
*   **Exact Production Replacement**: Make the database insertion of ticket URL rows mandatory.

---

## 📋 Prioritized Backend Engineer Checklist

Below is the chronological, step-by-step priority queue for a backend developer to secure and deploy the server in production:

### 🔴 High Priority (Phase 1): Infrastructure & Authentication Security
1.  [ ] **DB Schema Migration**: Connect live MySQL database credentials in `.env` and execute Prisma table migration (`npx prisma migrate dev`).
2.  [ ] **Admin JWT Authorization**: Add JWT validation or header passcode check validation on `/api/admin/*` routes to secure them from public curl exploits (critical gap!).
3.  [ ] **PIN Hashing**: Update passcode PIN check in admin verification to evaluate bcrypt salted hashes instead of cleartext keys.

### 🟠 Medium Priority (Phase 2): Payment & Webhook Integrations
4.  [ ] **Live Razorpay Credentials**: Bind production merchant keys in server environments.
5.  [ ] **Webhook Capturer Endpoint**: Implement `POST /api/payments/webhook` with signature checks to record completed transactions asynchronously.
6.  [ ] **Double-Spending Locks**: Set database unique key constraints on `Payment.razorpayPaymentId` in schema and enforce locks.

### 🟡 Low Priority (Phase 3): Obfuscation & Dynamic Slots Cap
7.  [ ] **Capacity Constraint**: Add booking validator count query check to block booking creations if daily visitors exceed 1000 for a date.
8.  [ ] **PDF UUID Obfuscation**: Refactor `ticketService.js` to name compiled PDF files using secure random UUIDs instead of guessable, sequential booking IDs.
9.  [ ] **Remove Mock Cache Fallbacks**: Clean up all references to `global.mockBookingsMap` across all route controllers.
