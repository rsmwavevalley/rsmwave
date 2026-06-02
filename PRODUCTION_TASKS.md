# RSM Wave Valley — Full-Stack Production Implementation Roadmap

This document outlines the project-management-grade technical roadmap for transitioning the **RSM Wave Valley** backend from development mock-fallbacks to a production-grade deployment.

---

## 📅 Phase 1 — Critical Launch Blockers

These tasks represent high-severity security vulnerabilities and operational blockades that must be resolved prior to initial gate testing.

### Task 1.1: Administrative API Authentication Guard
*   **Description**: Restrict all administrative endpoints under the `/api/admin/*` routing directory using JWT authentication or request-header PIN passcode token validations.
*   **Files Involved**:
    *   `server/src/middleware/auth.js`
    *   `server/src/routes/adminRoutes.js`
*   **Reason Required**: Current admin endpoints (`/dashboard`, `/bookings`, `/verify-ticket`, `/checkin`, `/checkins`) are entirely public. Any external client can curl these REST routes to scrape bookings data or forge ticket check-ins.
*   **Risk If Ignored**: 🔴 **CRITICAL**. High-severity privacy leak exposing guest personal names, email structures, phone details, and park metrics.
*   **Estimated Complexity**: Medium

### Task 1.2: Server Timezone Offset Normalization (Midnight Admittance Glitch)
*   **Description**: Shift and parse server system date comparisons to strictly follow Indian Standard Time (IST, UTC+5:30) timezone offsets before running ticket calendar date range validation.
*   **Files Involved**:
    *   `server/src/controllers/adminController.js` (specifically `verifyTicket` and `getDashboardStats` functions)
*   **Reason Required**: Cloud servers hosted in UTC or US Eastern Standard time zones will trail trailing calendar dates. A valid ticket booked for India Morning June 2nd will be evaluated as June 1st on the server, causing it to display a `NOT_VALID_YET` badge and block the guest.
*   **Risk If Ignored**: 🔴 **CRITICAL**. Direct operational gate failure. Valid guest admissions will be rejected during morning gate checks.
*   **Estimated Complexity**: Low

### Task 1.3: Obfuscate Predictable E-Ticket Filenames
*   **Description**: Save compiled ticket PDF assets using random, unique UUID string filename structures (e.g. `/tickets/9b1deb4d-3b7d.pdf`) instead of guessable, sequential booking IDs.
*   **Files Involved**:
    *   `server/src/services/ticketService.js`
    *   `server/src/controllers/paymentController.js`
*   **Reason Required**: Currently, tickets are saved as `/tickets/${bookingId}.pdf` (e.g. `RSM-102948.pdf`). Attackers can guess sequential IDs, scan the static folder, and download tickets belonging to other guests.
*   **Risk If Ignored**: 🟠 **HIGH**. High threat of ticket theft and unauthorized gate admittance bypasses.
*   **Estimated Complexity**: Low

---

## 📅 Phase 2 — Database Integration

These tasks cover database migrations, model schema cascading, and indexing upgrades required to connect target physical MySQL engines.

### Task 2.1: MySQL Connection Seeding & Migration Execution
*   **Description**: Setup live production MySQL connection parameters in `/server/.env` under the `DATABASE_URL` key and run Prisma CLI migrations.
*   **Files Involved**:
    *   `server/prisma/schema.prisma`
    *   `server/.env`
*   **Reason Required**: Moves the backend from temporary sandboxed cache stores (`global.mockBookingsMap`) to active MySQL write-stream procedures.
*   **Command Checklist**:
    ```bash
    npx prisma migrate dev --name init_rsm_valley_relational_schema
    npx prisma generate
    ```
*   **Risk If Ignored**: 🔴 **CRITICAL**. Data loss. All guest bookings, payment logs, and check-ins will disappear on every server restart.
*   **Estimated Complexity**: Low

### Task 2.2: Relational Schema Cascading Deletion Config
*   **Description**: Define explicit cascading deletions (`onDelete: Cascade`) for relationship rows inside `schema.prisma`.
*   **Files Involved**:
    *   `server/prisma/schema.prisma`
*   **Reason Required**: By default, deleting a `Booking` record is blocked by foreign key constraints if a matching `Payment` or `Ticket` row references it. Cascades ensure clean purges.
*   **Risk If Ignored**: 🟡 **Medium**. Database pruning scripts or administrative deletions will crash with unhandled SQL database errors.
*   **Estimated Complexity**: Low

---

## 📅 Phase 3 — Payment Hardening

These tasks secure transaction gates against signature spoofing, concurrency race conditions, and duplicate transaction replays.

### Task 3.1: Enforce Signature Verification Guard
*   **Description**: Enforce cryptographic validation of payment signatures in checkout verifications and remove development signature check bypasses.
*   **Files Involved**:
    *   `server/src/controllers/paymentController.js`
*   **Reason Required**: Bypasses signature checking if a mock order ID (starts with `order_MOCK_`) is passed, allowing offline payments to succeed.
*   **Risk If Ignored**: 🔴 **CRITICAL**. Payment bypass vulnerability. Malicious users can send dummy order strings to verify payment status without paying.
*   **Estimated Complexity**: Low

### Task 3.2: Database Transaction Isolation & Concurrency Blocks
*   **Description**: Wrap payment verification SQL writes (`prisma.booking.update`, `prisma.payment.create`, and `prisma.ticket.create`) inside an isolated transactional block (`prisma.$transaction`).
*   **Files Involved**:
    *   `server/src/controllers/paymentController.js`
*   **Reason Required**: Simultaneous validation requests from laggy clients can trigger duplicate writes, causing database unique constraint violations and unhandled `500 Internal Server Error` responses.
*   **Risk If Ignored**: 🟠 **HIGH**. Guest payments will succeed on the gateway, but e-ticket PDF generation will fail, prompting checkout failure alerts on the user's browser.
*   **Estimated Complexity**: Medium

### Task 3.3: Razorpay webhook Capturer & Double-Spending Protections
*   **Description**: Build a webhook handler endpoint (`POST /api/payments/webhook`) to handle transaction confirmation signals from Razorpay asynchronously and enforce unique constraints on `Payment.razorpayPaymentId`.
*   **Files Involved**:
    *   `server/src/routes/paymentRoutes.js`
    *   `server/src/controllers/paymentController.js`
*   **Reason Required**: Ensures bookings are updated to `'PAID'` even if the guest closes the browser before the client-side redirect completes. The unique constraint blocks signature reuse across different bookings.
*   **Risk If Ignored**: 🟠 **HIGH**. Unprocessed checkouts on browser closures and replay exploits allowing single signatures to verify multiple bookings.
*   **Estimated Complexity**: High

---

## 📅 Phase 4 — Security Hardening

These tasks protect passcode keys, block cross-origin requests forgery, and secure gate entrances against check-in bypasses.

### Task 4.1: Cryptographically Salt & Hash Admin PIN Passcodes
*   **Description**: Encrypt PIN passcode secrets using standard hashing libraries (like bcrypt) before administrative portal verification checks.
*   **Files Involved**:
    *   `server/src/controllers/adminController.js`
*   **Reason Required**: Plaintext PIN values (`458921`) are highly vulnerable to server environment leakage.
*   **Risk If Ignored**: 🟠 **HIGH**. Complete administrative security breach if configurations are leaked or extracted.
*   **Estimated Complexity**: Low

### Task 4.2: Restrict CORS Configurations
*   **Description**: Configure explicit origin restrictions inside the CORS middleware, blocking wildcard permissions.
*   **Files Involved**:
    *   `server/src/app.js`
*   **Reason Required**: Wildcard CORS (`app.use(cors())`) permits malicious cross-origin websites to forge AJAX requests to `/api/admin/checkin` using the browser's credentials (CSRF).
*   **Risk If Ignored**: 🟠 **HIGH**. Cross-Origin Request Forgery (CSRF) exploits.
*   **Estimated Complexity**: Low

### Task 4.3: Gate Admittance Concurrency Locking (Select Lock)
*   **Description**: Wrap gate check-in database writes in isolated transactions utilizing row-level database locking (`SELECT ... FOR UPDATE`).
*   **Files Involved**:
    *   `server/src/controllers/adminController.js` (specifically `checkinTicket` function)
*   **Reason Required**: A ticket barcode can be scanned at different entry gates simultaneously, initiating parallel admittance threads before the first row status is committed as `'USED'`.
*   **Risk If Ignored**: 🟡 **Medium**. Duplicate check-in admittance scams.
*   **Estimated Complexity**: Medium

---

## 📅 Phase 5 — Deployment

These tasks cover persistent file hosting, alert messaging integrations, and production server environment setup.

### Task 5.1: Amazon S3 Cloud Storage Integration
*   **Description**: Install the AWS SDK and refactor the ticket generation service to stream compiled PDF tickets directly to a private Amazon S3 cloud bucket instead of local static disk storage.
*   **Files Involved**:
    *   `server/src/services/ticketService.js`
    *   `server/src/controllers/paymentController.js`
*   **Reason Required**: Transient hosting containers (like Heroku or AWS Fargate) wipe local disk storage on redeployments, deleting all guest ticket files.
*   **Risk If Ignored**: 🟠 **HIGH**. Customer download link failures on old tickets after server restarts.
*   **Estimated Complexity**: Medium

### Task 5.2: Twilio SMS & Nodemailer SMTP Alerts Integration
*   **Description**: Connect dynamic Twilio and SMTP server credentials in server configurations to trigger automatic e-ticket confirmation SMS/emails immediately upon successful payment verification.
*   **Files Involved**:
    *   `server/src/controllers/paymentController.js`
    *   `server/.env`
*   **Reason Required**: Alert notifications are currently placeholder paths.
*   **Risk If Ignored**: 🟡 **Medium**. Guests receive no confirmation messages or download links.
*   **Estimated Complexity**: Medium

### Task 5.3: Production Environment Variables Seeding
*   **Description**: Seed all dynamic production keys inside the deployment dashboard settings:
    ```ini
    DATABASE_URL="mysql://..."
    PORT=5000
    RAZORPAY_KEY_ID="rzp_live_..."
    RAZORPAY_SECRET="live_secret..."
    ADMIN_PIN="hashed_passcode"
    TWILIO_SID="AC..."
    TWILIO_AUTH_TOKEN="token..."
    SMTP_USER="smtp_user"
    SMTP_PASS="smtp_pass"
    ```
*   **Files Involved**: `/server/.env`
*   **Reason Required**: Transitions server configurations from local settings.
*   **Risk If Ignored**: 🟠 **HIGH**. Application startup failures.
*   **Estimated Complexity**: Low
