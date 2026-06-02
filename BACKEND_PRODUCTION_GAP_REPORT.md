# RSM Wave Valley — Backend Production Gap Report

This document reports on the production gaps resolved during the backend hardening pass, identifying remaining steps needed prior to deployment.

---

## 🛡️ Solved Production Gaps & Security Risks

### 1. In-Memory Data Loss Risks
- **Issue**: Catches in controllers routed database connection errors to in-memory maps (`global.mockBookingsMap`), meaning reservations, payment records, and gate logs were wiped upon server restarts.
- **Resolution**: Removed all memory map references and catches. Server operates strictly database-first, ensuring data permanence in production MySQL.

### 2. Wildcard CORS Exploits
- **Issue**: `app.use(cors())` enabled all domains to query endpoints. Attackers could forge administrative check-in calls from cross-origin scripts.
- **Resolution**: Restrained CORS options to trusted frontend domains (`http://localhost:5173`, `http://localhost:3000`) or dynamically configurable endpoints inside environment variables.

### 3. Payment Signature Spoofing
- **Issue**: Payments with `order_MOCK_` IDs bypassed HMAC signature verifications. Attackers could spoof payments to download unpaid tickets.
- **Resolution**: Removed all bypasses. Cryptographic verification of payment signature is enforced using HMAC SHA-256 keys.

### 4. Replay & Double-Spending Attacks
- **Issue**: Bypassing uniqueness constraints allowed single Razorpay payment IDs to verify multiple bookings. Duplicate clicks also initiated duplicate orders on PAID rows.
- **Resolution**:
  - Enforced a unique database constraint check on `razorpayPaymentId` within transaction blocks.
  - Implemented transactional validations in `createPaymentOrder` and `verifyPayment` checking status is `'PENDING'`.

### 5. Midnight Admittance Glitch
- **Issue**: Standard UTC/EST servers trail Indian dates. India morning check-ins were parsed as yesterday, rejecting valid check-ins.
- **Resolution**: Standardized all dates comparisons to Indian Standard Time (IST, UTC+5:30) date boundaries.

### 6. Double Check-In Exploits
- **Issue**: Gate staff clicking "ALLOW ENTRY" concurrently could bypass checked-in validations.
- **Resolution**: Wrapped the booking lookups and updates inside `prisma.$transaction` blocks to enforce serialized check-ins.

---

## 🚀 Remaining Deployment Actions (High Priority)

### 1. Environment Secrets Seeding
The following live environment keys must be loaded in the production deployment dashboard:
- `DATABASE_URL` (live MySQL connection string)
- `RAZORPAY_KEY_ID` (live payment API merchant key)
- `RAZORPAY_SECRET` (live payment API cryptographic secret)
- `ADMIN_PIN_HASH` (SHA-256 hash of the administrative PIN, replacing default `"458921"`)
- `FRONTEND_URL` (comma-separated list of allowed frontend domain URLs for CORS, e.g. `https://rsmwavevalley.in`)

### 2. Physical Database Initialization
Run the database migrations once on the target production MySQL engine:
```bash
npx prisma migrate deploy
```
This applies the Cascading relational tables structure and indices dynamically.
