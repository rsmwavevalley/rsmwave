# RSM Wave Valley — Full-Stack Production Verification Audit

This report is a Senior Software Architect & Lead Backend Engineer production-readiness verification audit. It documents **6 hidden, high-severity architectural bottlenecks, race conditions, and security bypasses** present in the core server layer that are not listed in the standard gap checklists.

---

## 🚨 Detailed Production Blockers & Audit Findings

### 1. Database Transaction Isolation Failures on Checkout
*   **Severity**: 🔴 **CRITICAL**
*   **Exact File**: [paymentController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/paymentController.js)
*   **Exact Function**: `verifyPayment`
*   **Exact Line Range**: 101 to 175
*   **Reproduction Scenario**:
    1.  A guest completes payment on their phone.
    2.  Due to network lag or double-clicking, the client browser or Razorpay webhook fires two concurrent HTTP POST requests to `/api/payments/verify-payment` for the exact same `bookingId` within the same split second.
    3.  Because database updates are sequential and separate (`prisma.booking.update`, `prisma.booking.findUnique`, `prisma.payment.create`), both threads execute concurrently.
    4.  Thread A and Thread B both attempt to insert a row into the `Payment` table referencing the same `bookingId`. 
    5.  Due to the `@unique` constraint on `Payment.bookingId`, the second thread crashes with a `P2002 Unique Constraint Violation` and returns `500 Payment verification failed`, potentially causing the user's browser to display a failed screen even though they paid and the first thread marked them PAID.
*   **Production Impact**: Random payment validation crashes, double transaction logging attempts, and broken ticket compilations causing users to pay but receive checkout failure alerts.
*   **Required Fix**: Wrap the entire checkout database flow inside a single Prisma transaction block to isolate the query:
    ```javascript
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ ... });
      await tx.payment.create({ ... });
    });
    ```

---

### 2. Timezone Shift Midnight Admittance Glitch
*   **Severity**: 🔴 **CRITICAL**
*   **Exact File**: [adminController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/adminController.js)
*   **Exact Function**: `verifyTicket`
*   **Exact Line Range**: 136 to 165
*   **Reproduction Scenario**:
    1.  The park is located in Malari, Gonda, Uttar Pradesh, operating strictly in **Indian Standard Time (IST, UTC+5:30)**.
    2.  The application backend is hosted on a cloud container (e.g. AWS EC2, Heroku) whose physical system time is configured to UTC or US Eastern Standard Time (EST).
    3.  A guest booked for a visit on **June 2nd** arrives at the gate at **9:00 AM IST** on June 2nd.
    4.  The server, located in the US, reads the local system date as **June 1st, 11:30 PM**.
    5.  The date comparison evaluates `visitDate` (June 2) against `today` (June 1), classifies the ticket status as **`NOT_VALID_YET`**, and blocks the valid visitor at the gate.
*   **Production Impact**: Total operational gate failure. Valid ticket holders will be rejected by the scanner during morning hours because the remote host timezone is trailing.
*   **Required Fix**: Do not rely on server local time. Explicitly parse and normalize both server system dates and visitor dates to `Asia/Kolkata` (UTC+5:30) timezone dates using explicit offsets before executing comparisons.

---

### 3. Cross-Origin Request Forgery (CSRF) CORS Wildcard Security Leak
*   **Severity**: 🟠 **HIGH**
*   **Exact File**: [app.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/app.js)
*   **Exact Line Range**: 17 to 18
*   **Reproduction Scenario**:
    1.  The server mounts cross-origin headers globally using wildcard fallbacks: `app.use(cors())`.
    2.  An administrator with an active logged-in session cookie or session credentials stored in their browser visits a third-party malicious website on another tab.
    3.  The malicious website fires an asynchronous AJAX POST request directly to the park's administrative API `https://api.rsmwave.com/api/admin/checkin` using the parsed booking ID of a guest.
    4.  Because CORS allows all origins, the browser sends and processes the request successfully, bypassing frontend router gates.
*   **Production Impact**: Complete security bypass. External malicious origins can forge administrative actions (checking in tickets, viewing passenger rosters) on behalf of logged-in staff.
*   **Required Fix**: Restrict CORS configuration strictly to your verified frontend domain and disable wildcard permissions:
    ```javascript
    app.use(cors({
      origin: process.env.CLIENT_URL || "https://resort.rsmwave.com",
      credentials: true
    }));
    ```

---

### 4. Phantom Read capacity Allocation Race Conditions
*   **Severity**: 🟠 **HIGH**
*   **Exact File**: [bookingController.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/controllers/bookingController.js)
*   **Exact Function**: `createBooking`
*   **Exact Line Range**: 35 to 65
*   **Reproduction Scenario**:
    1.  The park has a strict capacity limit of 1000 visitors per calendar date.
    2.  For a popular weekend, **998 slots** are currently sold out.
    3.  Two separate customers, Customer A (registering a group of 3) and Customer B (registering a group of 2) simultaneously submit checkouts for that date.
    4.  Thread A and Thread B execute concurrently. Both query the database and read the sum of paid slots as 998, determining that 2 slots are remaining.
    5.  Both threads validate that their request count fits the capacity, and both successfully insert their `Booking` rows, resulting in **1003 guests** booked.
*   **Production Impact**: Severe overbooking on peak holidays, leading to crowd safety issues and park capacity code violations.
*   **Required Fix**: Implement strict transactional database row-level locking (`SELECT ... FOR UPDATE` via raw SQL) when checking and allocating visitor slots to serialize booking creations.

---

### 5. File System Resource Exhaustion on write-Stream Failure
*   **Severity**: 🟡 **MEDIUM**
*   **Exact File**: [ticketService.js](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/src/services/ticketService.js)
*   **Exact Function**: `generateTicket`
*   **Exact Line Range**: 49 to 52
*   **Reproduction Scenario**:
    1.  The PDF e-ticket compiler creates a node file write-stream `fs.createWriteStream(filePath)`.
    2.  During the PDF compilation process, a filesystem exception occurs (e.g. disk quota exceeded, directory permissions violation, or file locks).
    3.  The stream emits an `'error'` event and fires `reject(err)`.
    4.  However, because the write-stream is never explicitly terminated or unlinked, a corrupt, zero-byte file remains orphaned on the local storage partition.
*   **Production Impact**: Gradual file system resource exhaustion and disk space leakage. Delivery of corrupted, empty PDF tickets to guests, resulting in gate scan errors.
*   **Required Fix**: In the stream error listener, explicitly close the write-stream and delete the partially written file before rejecting the promise:
    ```javascript
    stream.on("error", (err) => {
      stream.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
    ```

---

### 6. Relational Foreign Key Deletion Blocks
*   **Severity**: 🟡 **MEDIUM**
*   **Exact File**: [schema.prisma](file:///c:/Users/kushw/OneDrive/Desktop/testing_rsm/rsmwave-main/server/prisma/schema.prisma)
*   **Exact Line Range**: 35 to 73
*   **Reproduction Scenario**:
    1.  An administrator or database cleanup job attempts to prune old or cancelled booking records by executing `prisma.booking.delete({ where: { id: targetId } })`.
    2.  Because the `Payment` and `Ticket` models hold foreign key relations pointing to `Booking.id` but lack cascading deletion configurations, the query throws an SQL Foreign Key Constraint Violation error.
*   **Production Impact**: Operational bloat. Administrative routines cannot delete or clean up obsolete booking columns without throwing SQL constraint failures.
*   **Required Fix**: Define cascading deletes (`onDelete: Cascade`) for the relational foreign key definitions inside the schema:
    ```prisma
    model Payment {
      // ...
      booking   Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
    }

    model Ticket {
      // ...
      booking   Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
    }
    ```
