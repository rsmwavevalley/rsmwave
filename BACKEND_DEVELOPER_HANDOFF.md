# RSM Wave Valley — Backend Developer Handoff Guide

Welcome to the definitive handoff guide for **RSM Wave Valley Resort & Water Park**. This manual is structured to allow any incoming backend/database engineer to deploy and maintain the backend without having to open React frontend code files.

---

## 🏗️ System Architecture Overview

The backend is built as a REST API using **Node.js (Express)** and **Prisma ORM (MySQL)**. 

```text
server/
├── prisma/
│   └── schema.prisma        # Prisma DB relational schema
└── src/
    ├── app.js               # Express application starter & CORS config
    ├── config/
    │   ├── prisma.js        # DB client pool instance
    │   └── razorpay.js      # Razorpay payment keys loader
    ├── controllers/
    │   ├── adminController.js    # KPIs aggregates, lookups & gate check-ins
    │   ├── bookingController.js  # Transactional guest reservations creations
    │   ├── capacityController.js # Slots sold aggregation per date
    │   ├── configController.js   # Exposes pricing structures
    │   ├── paymentController.js  # Order generation & signature verifications
    │   └── ticketController.js   # Dynamic PDF compiler status poller
    ├── middleware/
    │   ├── auth.js          # Header administrative passcode checks
    │   ├── rateLimiter.js   # IP requests rate limiting
    │   └── validator.js     # Body inputs validations & sanitizers
    ├── routes/              # Express Router routing mappings
    └── services/
        └── ticketService.js # PDFKit ticket generation & database logging
```

---

## 🗄️ Database Relational Models

We use Prisma client connected to a MySQL database:
1. **`Booking` Model**: Tracks visitor metadata (name, contact, visitDate, peopleCount, amount, paymentStatus `PENDING`/`PAID`, and check-in status `isCheckedIn`, `checkedInAt`).
2. **`Payment` Model**: Logs Razorpay orders and payment references. Mapped 1:1 with Booking.
3. **`Ticket` Model**: Stores the relative PDF path (`/tickets/RSM-XXXXXX.pdf`). Mapped 1:1 with Booking.

*All child relationships are configured with cascading deletions (`onDelete: Cascade`) to ensure referencing rows are pruned when parent booking profiles are deleted.*

---

## 🗺️ Complete API Endpoint Directory

Every endpoint communicates exclusively via JSON.

### 1. Guest Routes (Public)
- `GET /api/config/pricing`: Exposes hardcoded price rates configuration.
- `GET /api/capacity?date=YYYY-MM-DD`: Calculates date remaining capacity (max 1000 standard).
- `POST /api/bookings/create`: Input-sanitized booking creation wizard with transaction-safe capacity checks.
- `POST /api/payments/create-order`: Generates Razorpay transaction keys. Blocks duplicate payments and expired visit date payments.
- `POST /api/payments/verify-payment`: Enforces cryptographic signature verification and handles secure state updates.
- `GET /api/tickets/status/:bookingId`: Returns e-ticket compiler status (`{ ready: true, ticketUrl: "..." }`).

### 2. Admin Routes (Auth Protected - `x-admin-pin` in header)
- `POST /api/admin/verify-pin`: Validates administrative passcode attempts using SHA-256 crypt checking.
- `GET /api/admin/dashboard`: Compiles today's operational KPIs aggregates, aligned with IST date boundaries.
- `GET /api/admin/bookings`: Chronological roster lists.
- `POST /api/admin/verify-ticket`: Scanned gate validation codes resolving (`VALID`, `USED`, `EXPIRED`, `UNPAID`, `NOT_VALID_YET`, `NOT_FOUND`).
- `POST /api/admin/checkin`: Commits check-ins inside transactions to block duplicate check-in threads.
- `GET /api/admin/checkins`: Admissions history audit ledger.

---

## 🚀 Running & Deploying the System

1. **Verify Environment Configuration** in `/server/.env`:
   ```ini
   PORT=5000
   DATABASE_URL="mysql://root:Rohit%4045@localhost:3306/rsmwave"
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_SECRET="test_secret..."
   ADMIN_PIN_HASH="hashed_passcode"
   FRONTEND_URL="http://localhost:5173"
   ```
2. **Execute Database Setup**:
   ```bash
   npx prisma migrate dev --name init_rsm_valley_relational_schema
   npx prisma generate
   ```
3. **Run Dev server**:
   ```bash
   npm run dev
   ```
