# RSM Wave Valley — Backend Completion Plan

This document details the definitive prioritized completion roadmap implemented to move the **RSM Wave Valley Resort & Water Park** backend from its development sandboxed/hybrid state to a production-grade live deployment.

---

## 🗺️ Chronological Completion Roadmap

The following phases have been completed sequentially to guarantee a seamless, zero-downtime, and 100% backward-compatible rollout.

```text
Phase 1: DB & Relations ──────────────────> Completed
  └── Phase 2: Booking Capacity Guards ────> Completed
        └── Phase 3: Hardened Payments ────> Completed
              └── Phase 4: Admin Gate Auth ──> Completed
```

---

## 📂 Phase 1 — Database Relations & Cascading Purges
- **Files Modified**: [schema.prisma](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/prisma/schema.prisma)
- **Work Required**:
  1. Add explicit `onDelete: Cascade` rules to relationships mapping `Payment` model and `Ticket` model to the parent `Booking`.
  2. Implement target table indexing constraints on `visitDate`, `createdAt`, and `paymentStatus` to speed up gate verification sweeps.
  3. Prepare standard schema migrations scripts (`npx prisma migrate dev`).

---

## 📂 Phase 2 — Capacity Enforcement & Booking Creation Safety
- **Files Modified**: [bookingController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/bookingController.js)
- **Work Required**:
  1. Strip all offline catch mock booking fallbacks (`global.mockBookingsMap`).
  2. Implement an IST-normalized daily capacity lookup calculating the sum of paid visitor slots booked on the target `visitDate`.
  3. Enforce a strict transaction guard (`prisma.$transaction`) to block checkouts if visitor sum limits exceed 1000 standard slots, returning a descriptive `400 Bad Request` payload.

---

## 📂 Phase 3 — Hardened Razorpay Gateways & Concurrency Protection
- **Files Modified**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
- **Work Required**:
  1. **Order Initiation (`createPaymentOrder`):** Implement database unique searches, block billing for already `'PAID'` bookings to prevent double-spending, and reject payments for expired calendar visit dates.
  2. **Cryptographic Validation (`verifyPayment`):** Enforce live HMAC SHA-256 signature verification matching expected signatures precisely. Strip mock order signature check bypasses.
  3. **Transaction Safety:** Wrap payment database updates and e-ticket registrations in isolated transaction blocks. Leverage unique constraints on `razorpayPaymentId` in model configurations to block replay attacks.

---

## 📂 Phase 4 — Admin Passcode Security & Timezone Normalization
- **Files Modified**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
- **Work Required**:
  1. **PIN Code Hashing:** Hash input passcodes using SHA-256 crypt hashes. Verify input against `process.env.ADMIN_PIN_HASH` with standard defaults fallback.
  2. **Midnight Glitch Fix:** Align system date ranges to strictly check Indian Standard Time (IST, UTC+5:30) date boundaries rather than trailing server timezones (e.g. UTC, EST).
  3. **Admittance Concurrency Lock:** Wrap gate checking updates (`isCheckedIn: true`) inside transactional checks. Reject check-ins for already checked-in tickets with a clear `Ticket already checked-in and used` message.
