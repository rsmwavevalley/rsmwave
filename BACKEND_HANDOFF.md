# RSM Wave Valley — Backend Development Handoff Specification

This handoff document details the full-stack system's completed backend updates, custom security architectures, and registers the remaining operations checklist for a backend database developer to deploy the resort platform in a live production environment.

The frontend client is 100% complete and fully verified. The Express backend has been updated to support production-ready operations and now includes pricing, capacity, and status APIs, a zero-dependency security middleware suite, and optimized database schema structures.

---

## 🛠️ 1. Completed System Accomplishments

The following updates have been successfully implemented, validated, and compiled in the codebase:

### A. Completed API Routes Mapped to Express
1.  **Pricing API (`GET /api/config/pricing`)**:
    *   Exposes dynamic ticket rates (`ticketPrice`, `adultPrice`, `childPrice`, `weekendPrice`, `holidayPrice`) to avoid client-side hardcoding.
2.  **Capacity API (`GET /api/capacity?date=YYYY-MM-DD`)**:
    *   Performs database aggregates of paid tickets to calculate remaining daily capacity (capacity threshold strictly capped at **1000 visitors**).
3.  **Ticket Status API (`GET /api/tickets/status/:bookingId`)**:
    *   Allows the frontend polling hooks to check when the PDF compilation stream completes, returning `{ ready: true }` and the corresponding relative path.

---

### B. Custom Security Middleware Suite
1.  **In-Memory Rate Limiter (`server/src/middleware/rateLimiter.js`)**:
    *   A custom, zero-dependency middleware that prevents IP flooding and API scraping.
    *   Enforces a strict threshold of **max 5 attempts per minute** on PIN checks, **10 attempts per minute** on booking creation, and **120 attempts per minute** on general dashboard actions.
2.  **Admin Auth Headers Gate (`server/src/middleware/auth.js`)**:
    *   Secures all administrative endpoints (`/dashboard`, `/bookings`, `/verify-ticket`, `/checkin`, `/checkins`).
    *   Validates custom request headers (`x-admin-pin` or standard `Authorization: Bearer <pin>`) against environment secrets, returning `401 Unauthorized` on unauthorized curls.
3.  **Payload Validation & Input Sanitization (`server/src/middleware/validator.js`)**:
    *   Validates and sanitizes payload parameters before database writes:
        *   **Bookings**: Cleans names, verifies email patterns, strips phone numbers to standard 10-digits, enforces visitor counts (`1-10`), and blocks past booking dates.
        *   **Admin PIN**: Enforces exactly 6 numeric digits.
        *   **Booking IDs**: Ensures non-empty alphanumeric identifiers.

---

### C. Prisma Schema Improvements
*   **Target File**: [schema.prisma](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/prisma/schema.prisma)
*   **Indexing**: Mapped query-intensive search indexes (`@@index([visitDate])`, `@@index([createdAt])`, `@@index([paymentStatus, isCheckedIn])`) to guarantee instant lookups under heavy server traffic.
*   **Payment Uniqueness**: Enforced `@unique` constraints on `Payment.razorpayPaymentId` to block duplicate payment entries or token recycling replay attacks.

---

## 📋 2. Remaining Backend Production Roadmap

To launch the water park operational dashboard live, the backend developer must complete the following 5 integration tasks:

### Task 1: MySQL Database Connection & Migration
1.  **Environment Sync**: Update the `DATABASE_URL` inside `/server/.env` with the production MySQL connection parameters:
    ```ini
    DATABASE_URL="mysql://username:secure_password@production-db-host:3306/rsm_wave_valley"
    ```
2.  **Execute Migrations**: Run the schema creation CLI inside the `/server` directory to push all indexes, tables, and constraints:
    ```bash
    npx prisma migrate dev --name initialize_rsm_resort_schema
    ```
3.  **Verify Client Compilation**: Regenerate the Prisma Client package:
    ```bash
    npx prisma generate
    ```

---

### Task 2: Razorpay Live webhook & Double-Spending Webhook (Webhook Integration)
1.  **Mount Webhook Endpoint**: Create `POST /api/payments/webhook` inside routing configurations.
2.  **Verify Webhook Signatures**: Verify the webhook payload signature securely using your Razorpay Webhook Secret.
3.  **Double-Spend Guards**: Ensure that if a payment state is already marked `'PAID'` or the `Payment` unique constraints fail, the system rejects double booking updates.

---

### Task 3: Cloud Persistent PDF E-Ticket Storage
*   **The Issue**: The backend currently saves PDF tickets inside the local `tickets/` folder. On dynamic cloud hosting containers (like Heroku or AWS Fargate), the file system is ephemeral—all local files are deleted on every server restart.
*   **Action Plan**:
    1.  Install the AWS SDK (or equivalent cloud storage library).
    2.  Refactor [ticketService.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/services/ticketService.js) to upload generated PDFs directly to an Amazon S3 private bucket.
    3.  Serve tickets using secure cloud paths mapped inside the database `Ticket.ticketUrl` column.

---

### Task 4: Twilio SMS & Nodemailer SMTP Notifications
1.  **SMTP Setup**: Update NodeMailer credentials inside `/server/.env` and trigger booking confirmation emails containing download links upon successful checkout.
2.  **Twilio Integrations**: Configure Twilio SID and Auth properties:
    *   Invoke Twilio API inside controllers to trigger instant SMS/WhatsApp notification alerts to guests containing their Booking ID and Ticket URL when checkout completes.

---

### Task 5: production Environment Keys Seeding
Ensure that the target host dashboard sets the following environment configurations:
```ini
PORT=5000
DATABASE_URL="mysql://..."
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_SECRET="live_secret..."
ADMIN_PIN="hashed_secure_pin_passcode"
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="token..."
TWILIO_FROM_NUMBER="+1..."
SMTP_USER="smtp_account_username"
SMTP_PASS="smtp_secure_password"
```

---

*This concludes the complete production implementation blueprint. All core security features, APIs, and schema indexing are fully written, tested, and ready for final deployment!*
