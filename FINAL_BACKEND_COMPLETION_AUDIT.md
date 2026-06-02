# RSM Wave Valley — Final Full-Stack Production Audit & Backend Completion Specification

**Date**: June 1, 2026  
**Auditor Role**: Senior Software Architect & Lead Backend Engineer  
**Audit Target**: Complete Full-Stack Codebase (React Frontend & Express/Node.js/Prisma Backend)  

---

## 📂 Section 1 - Current System Overview

This section maps the exact status of each full-stack subsystem, indicating what is fully functional, partially written, mocked, or currently missing from the production-ready state.

| Subsystem / Layer | Implementation Status | Current Code State | Next-Step Action Required |
| :--- | :--- | :--- | :--- |
| **Frontend UI & Routings** | **COMPLETE** | Uses standard React Router (`BrowserRouter`) in [App.jsx](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/src/App.jsx). Decouples Client and Admin screens. All screens are styled using premium high-contrast layouts. | None. Frontend matches specification exactly. |
| **Public API Services** | **COMPLETE** | Fully written in `/src/services/` using standard AJAX requests via [apiClient.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/src/utils/apiClient.js). Includes error boundaries. | None. |
| **Database Schema** | **COMPLETE** | [schema.prisma](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/prisma/schema.prisma) defines the relational MySQL tables (`Booking`, `Payment`, `Ticket`). Column types and primary keys are fully declared. | Apply recommended performance indexes. |
| **Public Booking Endpoints** | **COMPLETE** | `POST /api/bookings/create` handles creation inside `bookingController.js` and stores details in Prisma database. | Add date capacity limit checking. |
| **Payment Orders** | **COMPLETE** | `POST /api/payments/create-order` creates orders in the database and triggers Razorpay API orders. | Block order recreation for paid bookings. |
| **Payment Signature Checks** | **COMPLETE** | Standard HMAC signature checking is active inside `paymentController.js`. Logs transactions and triggers PDF generation. | Enforce transaction isolation levels. |
| **E-Ticket Compilation** | **COMPLETE** | Compiles beautiful sunlight-readable PDFs using `pdfkit` and creates QR payloads using `qrcode` in `ticketService.js`. | Use UUIDs for filenames instead of bookingId. |
| **Admin Operations** | **PARTIAL** | All 6 endpoints in `adminController.js` are integrated with Prisma model queries, but rely on DB setup. | Implement backend authentication guards. |
| **Pricing Config Endpoint** | **MISSING / MOCKED** | The frontend queries `GET /api/config/pricing`, but no route is registered on the backend. Frontend falls back to a hardcoded standard price of ₹650. | Declare pricing router and backend model. |
| **Calendar capacity API** | **MISSING / MOCKED** | The frontend queries `GET /api/capacity?date=...`, but it does not exist in backend router. Frontend falls back to open slots. | Implement date capacity query routes. |
| **Ticket Generation Status** | **MISSING / MOCKED** | The frontend polls `GET /api/tickets/status/:bookingId`, but the router file does not support it. Frontend falls back to a timeout buffer. | Implement ticket generation status query. |

---

## 🌐 Section 2 - Frontend Dependency Audit

To ensure the backend developer maps the correct endpoints, this section documents all API requests initiated from the client-side services.

### 1. File: `src/services/bookingService.js`

*   **Function**: `createBooking`
*   **Endpoint**: `POST /api/bookings/create`
*   **Request Payload**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "peopleCount": 4,
      "visitDate": "2026-06-15T00:00:00.000Z"
    }
    ```
*   **Expected Response**:
    ```json
    {
      "success": true,
      "message": "Booking created successfully",
      "booking": {
        "id": 1,
        "bookingId": "RSM-129481",
        "name": "John Doe",
        "email": "john@example.com",
        "mobile": "9876543210",
        "peopleCount": 4,
        "visitDate": "2026-06-15T00:00:00.000Z",
        "totalAmount": 2600,
        "paymentStatus": "PENDING",
        "isCheckedIn": false,
        "checkedInAt": null,
        "createdAt": "2026-06-01T14:32:00.000Z"
      }
    }
    ```
*   **Error Handling**: Must return proper HTTP status codes (e.g. `400 Bad Request` if field validation fails) and a clear JSON error payload `{ "success": false, "message": "Reason details" }`.
*   **Loading State UI**: Disables the submit buttons, replacing them with a loading spinner showing "Processing Booking..." to block duplicate submits.
*   **Validation Requirements**: Mobile number must be normalized to a standard 10-digit format (characters stripped). People count must fall between `1` and `10` inclusive.

---

### 2. File: `src/services/bookingService.js`

*   **Function**: `getPricingConfig`
*   **Endpoint**: `GET /api/config/pricing` (Required fallback support)
*   **Request Payload**: *None*
*   **Expected Response**:
    ```json
    {
      "ticketPrice": 650,
      "adultPrice": 650,
      "childPrice": 400,
      "weekendPrice": 750,
      "holidayPrice": 800
    }
    ```

---

### 3. File: `src/services/bookingService.js`

*   **Function**: `getDateCapacity`
*   **Endpoint**: `GET /api/capacity?date=YYYY-MM-DD`
*   **Request Payload**: Query parameters only.
*   **Expected Response**:
    ```json
    {
      "totalCapacity": 1000,
      "remainingCapacity": 940,
      "soldOut": false
    }
    ```

---

### 4. File: `src/services/paymentService.js`

*   **Function**: `createOrder`
*   **Endpoint**: `POST /api/payments/create-order`
*   **Request Payload**: `{ "bookingId": "RSM-129481" }`
*   **Expected Response**:
    ```json
    {
      "success": true,
      "order": {
        "id": "order_PKyD768uV",
        "amount": 260000,
        "currency": "INR",
        "receipt": "RSM-129481"
      },
      "booking": {
        "bookingId": "RSM-129481",
        "totalAmount": 2600
      }
    }
    ```

---

### 5. File: `src/services/paymentService.js`

*   **Function**: `verifyPayment`
*   **Endpoint**: `POST /api/payments/verify-payment`
*   **Request Payload**:
    ```json
    {
      "razorpay_order_id": "order_PKyD768uV",
      "razorpay_payment_id": "pay_PKyJ209sE",
      "razorpay_signature": "abcdef123456789...",
      "bookingId": "RSM-129481"
    }
    ```
*   **Expected Response**:
    ```json
    {
      "success": true,
      "message": "Payment verified successfully",
      "paymentId": "pay_PKyJ209sE",
      "ticket": "/tickets/RSM-129481.pdf"
    }
    ```

---

### 6. File: `src/services/ticketService.js`

*   **Function**: `pollTicketStatus`
*   **Endpoint**: `GET /api/tickets/status/${bookingId}` (Required fallback support)
*   **Request Payload**: *None*
*   **Expected Response**:
    ```json
    {
      "ready": true
    }
    ```

---

### 7. File: `src/services/adminService.js`

*   **Function**: `verifyPin`
*   **Endpoint**: `POST /api/admin/verify-pin`
*   **Request Payload**: `{ "pin": "458921" }`
*   **Expected Response**: `{ "success": true }`

---

### 8. File: `src/services/adminService.js`

*   **Function**: `getDashboardStats`
*   **Endpoint**: `GET /api/admin/dashboard`
*   **Request Payload**: *None*
*   **Expected Response**:
    ```json
    {
      "todayBookings": 12,
      "todayVisitors": 38,
      "todayRevenue": 24700,
      "verifiedTicketsToday": 14
    }
    ```

---

### 9. File: `src/services/adminService.js`

*   **Function**: `getBookings`
*   **Endpoint**: `GET /api/admin/bookings`
*   **Expected Response**: Array of complete booking objects sorted desc by id.

---

### 10. File: `src/services/adminService.js`

*   **Function**: `verifyTicket`
*   **Endpoint**: `POST /api/admin/verify-ticket`
*   **Request Payload**: `{ "bookingId": "RSM-129481" }`
*   **Expected Response**:
    ```json
    {
      "bookingId": "RSM-129481",
      "name": "John Doe",
      "mobile": "9876543210",
      "visitDate": "2026-06-15T00:00:00.000Z",
      "guestCount": 4,
      "amount": 2600,
      "paymentStatus": "PAID",
      "verificationStatus": "VALID"
    }
    ```
*   **Allowed `verificationStatus` Values**: `VALID`, `UNPAID`, `USED`, `EXPIRED`, `NOT_VALID_YET`, `NOT_FOUND`

---

### 11. File: `src/services/adminService.js`

*   **Function**: `checkinTicket`
*   **Endpoint**: `POST /api/admin/checkin`
*   **Request Payload**: `{ "bookingId": "RSM-129481" }`
*   **Expected Response**: `{ "success": true, "status": "USED" }`

---

### 12. File: `src/services/adminService.js`

*   **Function**: `getCheckinLogs`
*   **Endpoint**: `GET /api/admin/checkins`
*   **Expected Response**:
    ```json
    [
      {
        "bookingId": "RSM-129481",
        "name": "John Doe",
        "mobile": "9876543210",
        "guestCount": 4,
        "amount": 2600,
        "checkInTime": "2026-06-01T14:32:00.000Z",
        "operator": "GATE_STAFF_NODE"
      }
    ]
    ```

---

## 🔗 Section 3 - Backend Endpoint Audit

Below is a detailed engineering breakdown of every backend route registered in the Express routing tables.

### 1. `POST /api/bookings/create`
*   **Current Status**: **COMPLETE** (active database insert).
*   **Missing Logic**: No verification of ticket slots capacity for the requested `visitDate`. If the ticket limit for a date is reached (e.g. 1000 visitors), it allows overbooking.
*   **Security Gaps**: No request rate limiting. Malicious actors could run automated scripts to populate the database with pending entries.
*   **Database Dependencies**: Prisma model `Booking`.
*   **Required Improvements**: Integrate database-level count verification of existing `PAID` visitors for the given date before completing row insertion.

---

### 2. `POST /api/payments/create-order`
*   **Current Status**: **COMPLETE** (creates Razorpay order).
*   **Missing Logic**: Does not check if the selected booking has already been paid or if the `visitDate` has already expired.
*   **Security Gaps**: Anyone can pass a valid booking ID and trigger orders.
*   **Database Dependencies**: Prisma model `Booking`.
*   **Required Improvements**: Add constraints to verify that the booking status is strictly `'PENDING'` and the visit date is today or in the future before issuing orders.

---

### 3. `POST /api/payments/verify-payment`
*   **Current Status**: **COMPLETE** (validates signature, marks paid, generates PDF).
*   **Missing Logic**: Susceptible to transaction race conditions. If the client fires parallel validation requests, the database will attempt dual updates, potentially creating double rows in the `Payment` or `Ticket` tables.
*   **Security Gaps**: Replay attacks can occur if `razorpayPaymentId` uniqueness is not restricted inside database transaction procedures.
*   **Database Dependencies**: Prisma models `Booking`, `Payment`, `Ticket`.
*   **Required Improvements**: Wrap the verification logic in a secure, isolated database transaction block.

---

### 4. `GET /api/tickets/status/:bookingId`
*   **Current Status**: **MISSING** (route does not exist in `server/src/routes/ticketRoutes.js`).
*   **Missing Logic**: Fully absent.
*   **Security Gaps**: If not verified, public callers can scan ticket processing.
*   **Database Dependencies**: Prisma model `Ticket`.
*   **Required Improvements**: Map the route and perform a simple select:
    ```javascript
    const ticket = await prisma.ticket.findUnique({ where: { bookingId: booking.id } });
    return res.json({ ready: !!ticket });
    ```

---

### 5. `POST /api/admin/verify-pin`
*   **Current Status**: **COMPLETE** (passcode verification).
*   **Missing Logic**: PIN checks are hardcoded with plaintext standard values in process.env.
*   **Security Gaps**: Rate-limit brute-forcing is absent.
*   **Required Improvements**: Hash the passcode. Implement a strict request rate limiter.

---

### 6. `GET /api/admin/dashboard`
*   **Current Status**: **PARTIAL** (database skeletons exist, but endpoints are public).
*   **Missing Logic**: Computes aggregated sums (`todayRevenue`, `todayVisitors`) on every API invocation without caching.
*   **Security Gaps**: **CRITICAL**. No authentication middleware is active. Any public caller can hit `/api/admin/dashboard` and view aggregate resort metrics.
*   **Database Dependencies**: Prisma model `Booking`.
*   **Required Improvements**: Secure this endpoint with authentication middleware that validates access credentials inside request headers.

---

### 7. `GET /api/admin/bookings`
*   **Current Status**: **PARTIAL** (database query written, but public).
*   **Security Gaps**: **CRITICAL**. Anyone can access this endpoint publicly and download the complete customer booking list (including guest names, emails, and mobile phone numbers).
*   **Database Dependencies**: Prisma model `Booking`.
*   **Required Improvements**: Apply auth verification middleware.

---

### 8. `POST /api/admin/verify-ticket`
*   **Current Status**: **PARTIAL** (database search logic written, but public).
*   **Security Gaps**: **HIGH**. Unprotected public access allows malicious bots to query database record validity.
*   **Database Dependencies**: Prisma model `Booking`.
*   **Required Improvements**: Enforce auth header verification.

---

### 9. `POST /api/admin/checkin`
*   **Current Status**: **PARTIAL** (Prisma row update written, but public).
*   **Security Gaps**: **CRITICAL**. Since it lacks auth middleware, an intruder could call `/api/admin/checkin` directly with custom booking IDs and bypass gate check-ins entirely.
*   **Database Dependencies**: Prisma model `Booking`.
*   **Required Improvements**: Restrict endpoint using JWT authentication or passcode header checks.

---

### 10. `GET /api/admin/checkins`
*   **Current Status**: **PARTIAL** (query written, but public).
*   **Security Gaps**: **CRITICAL**. Exposes checked-in customer lists to the open web.
*   **Database Dependencies**: Prisma model `Booking`.
*   **Required Improvements**: Apply auth headers validation.

---

## 🗄️ Section 4 - Prisma & Database Audit

The existing Prisma configuration inside `schema.prisma` is optimized for relational mappings, but requires crucial updates to ensure production-grade security, consistency, and performance under peak resort traffic.

### 🔎 Current Database Architecture
We utilize a relational 1:1 mapping schema:
*   A `Booking` record can optionally hold a single `Payment` record and a single `Ticket` record.

### ⚠️ Current Risks & Architectural Vulnerabilities
1.  **Missing Indexes**:
    *   `Booking.visitDate`: Filtered constantly when querying expected daily visitors. Without an index, this will lead to full-table scans.
    *   `Booking.createdAt`: Filtered on every admin dashboard metric compilation.
    *   `Booking.paymentStatus` and `Booking.isCheckedIn`: Frequently combined in filters.
2.  **Relation Constraints**:
    *   The `Payment` table relates to `Booking.id` (auto-increment internal integer). However, the Razorpay transaction payload maps strictly via `bookingId` (the alphanumeric unique string).
    *   `Payment.razorpayPaymentId` is **not unique**. This permits payment signature recycling and leaves the database vulnerable to replay attacks.

### 📝 Final Recommended Production Schema
Apply the following indexes and uniqueness constraints inside [schema.prisma](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/prisma/schema.prisma):

```prisma
model Booking {
  id             Int       @id @default(autoincrement())
  bookingId      String    @unique
  name           String
  email          String
  mobile         String
  peopleCount    Int
  visitDate      DateTime
  totalAmount    Float
  paymentStatus  String    @default("PENDING")
  isCheckedIn    Boolean   @default(false)
  checkedInAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  payment        Payment?
  ticket         Ticket?

  @@index([visitDate])
  @@index([createdAt])
  @@index([paymentStatus, isCheckedIn])
}

model Payment {
  id                    Int       @id @default(autoincrement())
  bookingId             Int       @unique
  razorpayOrderId       String
  razorpayPaymentId     String?   @unique  // Enforces payment signature uniqueness
  razorpaySignature     String?
  status                String    @default("PENDING")
  paidAt                DateTime?
  booking               Booking   @relation(fields: [bookingId], references: [id])
}
```

---

## 🔄 Section 5 - Booking Flow Audit

Below is the chronological path of a customer's journey from landing page booking to entering the water park gate, highlighting remaining work for each phase.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend
    participant Express as Backend Server
    participant DB as MySQL DB
    participant Razorpay

    Customer->>Frontend: Fill out form & Select Date
    Frontend->>Express: POST /api/bookings/create
    Note over Express,DB: Missing: Check Date Capacity Limits
    Express->>DB: Write Booking (PENDING)
    DB-->>Express: Return ID
    Express-->>Frontend: Return Booking Details
    Frontend->>Express: POST /api/payments/create-order
    Express->>Razorpay: Generate Razorpay Order
    Razorpay-->>Express: Return order_id
    Express->>DB: Optional Log
    Express-->>Frontend: Return order payload
    Frontend->>Customer: Launch Razorpay Overlay
    Customer->>Frontend: Pay & Complete Checkout
    Frontend->>Express: POST /api/payments/verify-payment
    Express->>Express: Validate SHA256 signature
    Note over Express,DB: Transaction Isolation Guard Needed
    Express->>DB: Update Booking (PAID) & Create Payment log
    Express->>Express: Compile PDF & QR using pdfkit
    Express->>DB: Create Ticket Record (Save path)
    Express-->>Frontend: Return Ticket URL (/tickets/RSM-...)
    Customer->>Frontend: Click E-Ticket download
    Frontend->>Customer: Download sunlight-readable PDF
    Customer->>GateStaff: Present printed QR code
    GateStaff->>Frontend: Scan QR and check status
    Frontend->>Express: POST /api/admin/verify-ticket
    Note over Express: Check: VALID, UNPAID, USED, EXPIRED, NOT_VALID_YET
    Express-->>Frontend: Return Verification Badge
    GateStaff->>Frontend: Click "ALLOW ENTRY"
    Frontend->>Express: POST /api/admin/checkin
    Express->>DB: Update isCheckedIn=true, checkedInAt=now
    Express-->>Frontend: Return success status
```

### Remaining Core Work:
1.  **Capacity Validation**: Implement a pre-creation capacity query. If paid visitors + currently requested visitor counts exceed 1000 for the selected `visitDate`, the request must be blocked.
2.  **Transaction Isolation**: Ensure `POST /api/payments/verify-payment` runs in a transaction block to prevent duplicate payment creation and ticket compilation.
3.  **Filenames Obfuscation**: Instead of saving PDFs as `${bookingId}.pdf`, generate a random UUID to prevent sequential file scraping on the static directory.

---

## 💳 Section 6 - Razorpay Audit

Integrations with Razorpay are located in [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js).

### 🔍 Current Signature Verification Code
```javascript
const body = razorpay_order_id + "|" + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_SECRET)
  .update(body.toString())
  .digest("hex");
const isAuthentic = expectedSignature === razorpay_signature;
```

### ⚠️ Security Vulnerabilities & Audit Findings
1.  **No Double-Spending / Payment Reuse Prevention**: The system updates `paymentStatus` to `'PAID'` based on signature authentication. If `razorpayPaymentId` is not enforced as a unique key in the database, a malicious actor could reuse a single verified payment token to mark multiple separate bookings as PAID.
2.  **Lack of Verification Transaction Checks**: If signature verification succeeds, the backend directly updates the database. However, in production, it is highly recommended to perform an API check directly against Razorpay (`razorpay.payments.fetch(razorpay_payment_id)`) to confirm that the transaction amount corresponds to the expected booking fee before updating status.
3.  **Missing Webhook Support**: If a customer pays successfully but closes the browser before the frontend fires `verify-payment`, the booking remains marked as `'PENDING'`. **Required**: Implement a background Razorpay payment capture webhook listener endpoint (`POST /api/payments/webhook`) to handle asynchronous updates.

---

## 📄 Section 7 - Ticket System Audit

### 🔎 Implementation State
*   **PDF Generation**: Uses `pdfkit` in `ticketService.js`. Compiles customer name, booking ID, visit date, guest count, and payment state cleanly.
*   **QR Encoding**: Encodes raw text strings containing:
    ```text
    Booking ID: RSM-102948
    Name: John Doe
    Mobile: 9876543210
    Visit Date: 2026-06-15T00:00:00.000Z
    ```
*   **Storage**: Writes files directly to a local server folder `../../tickets`. Exposes this folder statically via `app.use("/tickets", express.static(...))`.

### ⚠️ Potential Production Risks & Crucial Updates
1.  **Predictable URLs**: Ticket PDFs are named `${booking.bookingId}.pdf` (e.g. `RSM-102948.pdf`). Because booking IDs are sequential and easily guessable, an attacker could scan the static folder and download other guests' entry tickets.
    *   **Required Fix**: Obfuscate file storage using random UUID keys (e.g., `tickets/e4b179-8d9e-4c7a.pdf`) and map this filename in the database `Ticket.ticketUrl` column.
2.  **Ephemeral Containers Risk**: If the application is hosted on dynamic cloud containers (like Heroku or AWS Fargate), the local file system is temporary. PDF files stored in `../../tickets` will be deleted on every server redeployment.
    *   **Required Fix**: Configure a production storage adapter (like Amazon S3) to upload and serve tickets via secure CloudFront links or signed URLs.
3.  **Unsigned QR Payload**: Because the QR payload is raw text, an attacker could forge custom QR codes containing fake bookings.
    *   **Required Fix**: Sign the booking ID using a server secret key (HMAC-SHA256) and embed this signature inside the QR payload (e.g., `bookingId:RSM-102948;signature:8f7e2d...`). The scanner route must validate this signature before checking eligibility.

---

## 🖥️ Section 8 - Admin Dashboard Audit

The administrative dashboard utilizes high-contrast views designed to remain readable under heavy sunlight.

### 🔎 Component Inspections
1.  **Authentication**: Front-end handles authorization checks locally. Backend lacks actual authentication gates.
2.  **Dashboard Metrics**: Queries database totals for bookings, expected visitors, paid revenue, and check-ins today.
    *   **Performance Warning**: In a production environment with thousands of historical records, running raw Prisma counts and aggregates (`_sum`) on every page load will bottleneck performance.
    *   **Required Fix**: Store today's statistics in an in-memory cache (like Redis) or create a persistent daily analytics summary table that updates asynchronously.
3.  **Verification**: Compiles dates and evaluates the 5 required gate states. This logic is correct and robust, but needs UTC-to-IST conversion offsets to avoid midnight validation glitches.
4.  **Check-In Admittance**: Directly sets database status to `isCheckedIn: true`.
    *   **Database Lock Required**: Must run as a transaction query to prevent multi-device bypass scams.

---

## 🔒 Section 9 - Security Audit

Below is a prioritized list of security findings identified in the full-stack architecture.

### 🔴 CRITICAL SEVERITY: Exposed Administrative REST APIs
*   **Description**: Every endpoint under `/api/admin/*` (`/dashboard`, `/bookings`, `/verify-ticket`, `/checkin`, `/checkins`) is completely public. There is no session check or header token validation in Express. An attacker could curl the bookings endpoint and obtain names, emails, and mobile phone numbers.
*   **Remediation**: Create an authentication middleware (`server/src/middleware/auth.js`) that validates a secure token or checks an `Authorization` header containing the validated PIN session. Register this middleware on all administrative route configurations.

---

### 🟠 HIGH SEVERITY: Predictable E-Ticket Filenames
*   **Description**: Ticket PDF documents are saved in a static folder using predictable sequential booking IDs (`RSM-102948.pdf`). Attackers can guess filenames and download tickets belonging to other guests.
*   **Remediation**: Save PDF documents using a secure UUID format (`tickets/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.pdf`).

---

### 🟠 HIGH SEVERITY: Plaintext Passcode Configurations
*   **Description**: The entry gate PIN is evaluated as plaintext standard values (`458921`) in controllers, making it highly vulnerable to extraction or configuration leaks.
*   **Remediation**: Store the administrative PIN passcode as a secure hashed string (e.g., bcrypt) inside configuration properties or server databases.

---

### 🟡 MEDIUM SEVERITY: Lack of API Request Rate Limiting
*   **Description**: Endpoints like `POST /api/bookings/create` and `POST /api/admin/verify-pin` are vulnerable to request flooding and brute-force cracking.
*   **Remediation**: Integrate `express-rate-limit` middleware on all public endpoints.

---

### 🟡 MEDIUM SEVERITY: Double-Spending / Signature Reuse
*   **Description**: The signature validator verifies authenticity but does not check if the payment token has already been registered in the database, potentially allowing multiple bookings to share a single payment confirmation.
*   **Remediation**: Set a database unique constraint on `Payment.razorpayPaymentId`.

---

## 🚀 Section 10 - Production Deployment Audit

Prior to launch, the following system requirements must be configured to transition the environment from local development to production.

### 1. SSL Certificates & HTTPS
*   **Why**: Required for production. The Razorpay checkout modal **will fail to load** on standard HTTP production pages. SSL is also necessary to encrypt the administrative PIN in transit.

### 2. Ephemeral Storage Solutions (Transient Hosting)
*   **Why**: Cloud platforms like Heroku or AWS Fargate clean local disk storage on restarts, which would erase all generated ticket PDFs.
*   **Remediation**: Implement a cloud storage adapter (e.g., AWS S3 SDK) in `ticketService.js` to stream generated PDFs directly to an S3 bucket and serve them via secure CloudFront paths.

### 3. Required Environment Variables
Seed these configurations in the production environment:
*   `DATABASE_URL`: Production MySQL connection string (e.g. `mysql://user:pass@host:3306/db`).
*   `PORT`: Port binding for server instance.
*   `RAZORPAY_KEY_ID`: Live Razorpay API Key.
*   `RAZORPAY_SECRET`: Live Razorpay API Secret.
*   `ADMIN_PIN`: A secure, hashed administrator passcode.
*   `VITE_API_URL` (Frontend): Absolute domain path to the production backend.
*   `VITE_RAZORPAY_KEY_ID` (Frontend): Live Razorpay client key.

---

## 📋 Section 11 - Backend Developer Execution Plan

This multi-phase implementation plan outlines the steps for a backend developer to transition the codebase to a secure, database-integrated production environment.

### Phase 1: Database Schema & Migration Optimizations
*   **Target Files**: `server/prisma/schema.prisma`
*   **Action**:
    1.  Add performance indexes to search fields (`visitDate`, `createdAt`, `isCheckedIn`, `paymentStatus`).
    2.  Set `razorpayPaymentId` as unique in the `Payment` table to prevent replay attacks.
    3.  Run the migration command:
        ```bash
        npx prisma migrate dev --name optimize_indexing_and_payment_uniqueness
        ```
*   **Complexity**: Low  
*   **Expected Outcome**: Optimized database indices and unique payment constraints mapped to MySQL.

---

### Phase 2: Administrative API Authentication & Protection
*   **Target Files**:
    *   `server/src/middleware/auth.js` [NEW]
    *   `server/src/routes/adminRoutes.js`
    *   `server/src/controllers/adminController.js`
*   **Action**:
    1.  Create validation middleware inside `server/src/middleware/auth.js` that checks for a valid session token or secure key inside incoming request headers.
    2.  Apply this security middleware to all `/api/admin/*` route configurations.
    3.  Hash the admin passcode and integrate a secure rate limiter on `/api/admin/verify-pin` to block brute-force scanners.
*   **Complexity**: Medium  
*   **Expected Outcome**: Completely secured, private administrative API routes.

---

### Phase 3: Public Booking Limits & Validation Guards
*   **Target Files**:
    *   `server/src/controllers/bookingController.js`
    *   `server/src/routes/bookingRoutes.js`
*   **Action**:
    1.  Add request rate limiting to public booking creation routes.
    2.  Before inserting a booking record, execute a database count of paid visitors scheduled for the requested `visitDate`. Block booking creation if the limit is exceeded.
*   **Complexity**: Medium  
*   **Expected Outcome**: Enforced park capacity rules and protection against spam booking requests.

---

### Phase 4: E-Ticket Compilation & URL Obfuscation
*   **Target Files**:
    *   `server/src/routes/ticketRoutes.js`
    *   `server/src/services/ticketService.js`
*   **Action**:
    1.  Implement the missing `/api/tickets/status/:bookingId` query endpoint in `ticketRoutes.js`.
    2.  Refactor PDF generation to save tickets using random UUIDs instead of sequential booking IDs.
    3.  Integrate an S3 storage adapter to upload generated PDFs directly to cloud buckets.
*   **Complexity**: Medium  
*   **Expected Outcome**: Obfuscated ticket file retrieval paths and cloud-persistent E-ticket storage.

---

### Phase 5: Razorpay Integrity & Asynchronous Webhooks
*   **Target Files**:
    *   `server/src/controllers/paymentController.js`
    *   `server/src/routes/paymentRoutes.js`
*   **Action**:
    1.  Implement a webhook listener endpoint `/api/payments/webhook` to handle asynchronous payment confirmation signals from Razorpay.
    2.  Wrap database updates and PDF generation inside an isolated transaction block to prevent concurrent verification race conditions.
*   **Complexity**: High  
*   **Expected Outcome**: A robust, double-spending-proof payment flow with fallback support for closed browser windows during checkout.

---

## 📊 Section 12 - Final Readiness Score

| Metric | Score | Findings & Evidence from the Codebase |
| :--- | :--- | :--- |
| **Frontend Readiness** | **100%** | All UI pages are complete and highly styled. Application state routing is fully operational, client services use standard API structures, and scanner features are verified. |
| **Backend Readiness** | **65%** | Standard Express skeletons, public booking creation, and payment verification are implemented. However, the admin endpoints lack authentication gates, capacity checks are missing, and the ticket status route is absent. |
| **Database Readiness** | **80%** | Prisma client definitions map relational schemas correctly, but search fields lack performance indexing and unique signature constraints are missing in the payment table. |
| **Payment Readiness** | **90%** | Standard Razorpay order APIs and signature HMAC checks are written, but webhook listeners and double-spending protection are missing. |
| **Admin Dashboard Readiness** | **70%** | Component metrics templates and gate verification states are designed, but endpoints are public and lack database search optimizations. |
| **Production Readiness Score** | **75%** | The core application is highly functional, but requires administrative security gates, capacity checks, and payment integrations before production launch. |

---

*This document is the final technical audit report for RSM Wave Valley. A backend developer can complete the entire production integration by following the steps outlined in the execution plan above.*
