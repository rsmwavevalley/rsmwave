# RSM Wave Valley — Full-Stack Production Test Plan

This document contains the definitive QA and verification test plan for the **RSM Wave Valley** water park management platform. 

It defines exactly **50 comprehensive, numbered test cases** covering every customer journey stage, payment state transition, gate scanning badge logic, database transaction lock, and deployment validation checklist to allow a backend engineer to certify the system production-ready.

---

## 🗂️ Table of Test Case Categories
*   **Category A: Guest Booking Creation & Validation (TC-01 to TC-10)**
*   **Category B: Razorpay Orders & Payments (TC-11 to TC-18)**
*   **Category C: E-Ticket Compilation & Downloads (TC-19 to TC-26)**
*   **Category D: Admin Auth & Portal Sessions (TC-27 to TC-32)**
*   **Category E: Manager Dashboard Metrics & Ledgers (TC-33 to TC-38)**
*   **Category F: Gate QR Scanning & Verification Badges (TC-39 to TC-44)**
*   **Category G: Gate Admissions Check-In & Security (TC-45 to TC-50)**

---

## 📝 Detailed Verification Test Cases

### Category A: Guest Booking Creation & Validation

#### TC-01: Successful Booking Creation with Valid Inputs
*   **Preconditions**: Host Express server is running.
*   **Steps**:
    1. Send a POST request to `/api/bookings/create` with a valid JSON payload containing guest name (`"Aarav Sharma"`), email (`"aarav@example.com"`), 10-digit mobile phone (`"9876543210"`), visitor count (`4`), and tomorrow's visit date (`"2026-06-02T00:00:00.000Z"`).
*   **Expected Result**: Status `201 Created` with booking JSON row containing paymentStatus `'PENDING'`, calculated totalAmount `2600`, and a unique alphanumeric `bookingId`.
*   **Failure Result**: Status `500 Server Error` or `400 Bad Request`.
*   **Related Files**: `/server/src/controllers/bookingController.js`, `/server/src/routes/bookingRoutes.js`

#### TC-02: Booking Creation - Missing Name Payload
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` omitting the `"name"` property.
*   **Expected Result**: Status `400 Bad Request` with message `"A valid guest name is required"`.
*   **Failure Result**: Status `201 Created` or `500 Server Error`.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-03: Booking Creation - Invalid Email Schema
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` with `"email": "aaravsharma"`.
*   **Expected Result**: Status `400 Bad Request` with message `"A valid email address is required"`.
*   **Failure Result**: Creation succeeds or throws SQL database errors.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-04: Booking Creation - Non-10-Digit Mobile Phone
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` with `"mobile": "98765"`.
*   **Expected Result**: Status `400 Bad Request` with message `"A valid 10-digit mobile phone number is required"`.
*   **Failure Result**: Creation succeeds or database truncates string.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-05: Booking Creation - Guest Count Less Than 1
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` with `"peopleCount": 0`.
*   **Expected Result**: Status `400 Bad Request` with message `"Visitor guest count must be a number between 1 and 10"`.
*   **Failure Result**: Status `201 Created` with totalAmount `0`.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-06: Booking Creation - Guest Count Greater Than 10
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` with `"peopleCount": 11`.
*   **Expected Result**: Status `400 Bad Request` with message `"Visitor guest count must be a number between 1 and 10"`.
*   **Failure Result**: Succeeds.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-07: Booking Creation - Past Visit Date Selection
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` with `"visitDate": "2020-01-01T00:00:00.000Z"`.
*   **Expected Result**: Status `400 Bad Request` with message `"Selected visit date cannot be in the past"`.
*   **Failure Result**: Row generated for past visit date.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-08: Booking Creation - Future Visit Date Selection
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` with `"visitDate": "2026-08-15T00:00:00.000Z"`.
*   **Expected Result**: Status `201 Created`.
*   **Failure Result**: Fails with date errors.
*   **Related Files**: `/server/src/controllers/bookingController.js`

#### TC-09: Booking Creation - Missing Visit Date Payload
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` omitting the `"visitDate"` key.
*   **Expected Result**: Status `400 Bad Request` with message `"A valid calendar visit date is required"`.
*   **Failure Result**: Crashes with null parse errors.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-10: Booking Creation - Input Sanitization
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/bookings/create` with names containing trailing spaces (`"  John Doe  "`) and capital letters email (`"GUEST@EXAMPLE.COM"`).
*   **Expected Result**: Created booking row trims name to `"John Doe"` and lowercase email to `"guest@example.com"`.
*   **Failure Result**: Saves raw un-sanitized values.
*   **Related Files**: `/server/src/middleware/validator.js`

---

### Category B: Razorpay Orders & Payments

#### TC-11: Successful Payment Order Creation
*   **Preconditions**: Valid booking exists in database.
*   **Steps**: Send POST to `/api/payments/create-order` with `{ "bookingId": "RSM-192841" }`.
*   **Expected Result**: Status `200 OK` with Razorpay order payload containing unique receipt, amount, and order ID.
*   **Failure Result**: Status `500 Server Error`.
*   **Related Files**: `/server/src/controllers/paymentController.js`

#### TC-12: Order Creation - Non-Existent Booking ID Lookup
*   **Preconditions**: Server running.
*   **Steps**: Send POST to `/api/payments/create-order` with `{ "bookingId": "RSM-FAKEID" }`.
*   **Expected Result**: Returns mock order fallback gracefully or triggers proper `404 Not Found` if database is connected.
*   **Failure Result**: Crashes with unhandled null references.
*   **Related Files**: `/server/src/controllers/paymentController.js`

#### TC-13: Order Creation - Re-Ordering for Paid Booking
*   **Preconditions**: Booking exists with paymentStatus `'PAID'`.
*   **Steps**: Send POST to `/api/payments/create-order` with the PAID booking's ID.
*   **Expected Result**: Server blocks order generation, returning a warning that the booking is already PAID.
*   **Failure Result**: Issues another payment order, leading to double-billing risks.
*   **Related Files**: `/server/src/controllers/paymentController.js`

#### TC-14: Order Creation - Expired Booking ID Lookup
*   **Preconditions**: Booking exists in database but visitDate is in the past.
*   **Steps**: Send POST to `/api/payments/create-order` for the expired booking.
*   **Expected Result**: Server rejects order creation, indicating the booking date has expired.
*   **Failure Result**: Issues payment order for expired ticket.
*   **Related Files**: `/server/src/controllers/paymentController.js`

#### TC-15: Successful Payment Signature Verification
*   **Preconditions**: Booking exists, payment order completed.
*   **Steps**: Send POST to `/api/payments/verify-payment` containing order ID, payment ID, signature, and booking ID.
*   **Expected Result**: Status `200 OK`, booking status updated to `'PAID'`, Payment row created, and ticket PDF successfully written.
*   **Failure Result**: Returns `400 Bad Request` or signature rejection.
*   **Related Files**: `/server/src/controllers/paymentController.js`, `/server/src/services/ticketService.js`

#### TC-16: Verification - Invalid HMAC Cryptographic Signature
*   **Preconditions**: Booking exists.
*   **Steps**: Send POST to `/api/payments/verify-payment` with a corrupted/fake signature.
*   **Expected Result**: Rejects verification with status `400 Bad Request` and message `"Payment verification failed: Invalid signature"`.
*   **Failure Result**: Marks booking as PAID and issues ticket.
*   **Related Files**: `/server/src/controllers/paymentController.js`

#### TC-17: Verification - Duplicate Payment Token Replay Attack
*   **Preconditions**: Signature verified once.
*   **Steps**: Send the exact same payload to `/verify-payment` concurrently or sequentially for a second booking.
*   **Expected Result**: Fails with SQL constraint errors or unique key rejections on `razorpayPaymentId`.
*   **Failure Result**: Marks second booking as PAID.
*   **Related Files**: `/server/prisma/schema.prisma`

#### TC-18: Verification - Concurrent Verification Race Condition
*   **Preconditions**: Rapid requests.
*   **Steps**: Fire two identical POST requests to `/verify-payment` for same bookingId simultaneously.
*   **Expected Result**: Handled cleanly via isolated transactions; second request is rejected while first commits successfully.
*   **Failure Result**: Handlers crash, leaving booking paid but ticket ungenerated.
*   **Related Files**: `/server/src/controllers/paymentController.js`

---

### Category C: E-Ticket Compilation & Downloads

#### TC-19: Successful E-Ticket PDF Creation
*   **Preconditions**: Booking status updated to PAID.
*   **Steps**: Trigger payment validation success.
*   **Expected Result**: PDFKit successfully writes high-contrast PDF containing name, guests count, date, amount, and an uncorrupted QR code.
*   **Failure Result**: Fails silently, leaving zero-byte files.
*   **Related Files**: `/server/src/services/ticketService.js`

#### TC-20: Ticket Status Poll - Immediate Read Check
*   **Preconditions**: PDF finishes compiling.
*   **Steps**: Send GET to `/api/tickets/status/RSM-192841`.
*   **Expected Result**: Returns `{ "ready": true, "ticketUrl": "/tickets/RSM-192841.pdf" }`.
*   **Failure Result**: Returns ready false.
*   **Related Files**: `/server/src/controllers/ticketController.js`

#### TC-21: Ticket Status Poll - Missing Booking ID
*   **Preconditions**: Server running.
*   **Steps**: Send GET to `/api/tickets/status/RSM-MISSED`.
*   **Expected Result**: Returns `{ "ready": false, "message": "Booking record missing." }`.
*   **Failure Result**: Crashes with null pointer errors.
*   **Related Files**: `/server/src/controllers/ticketController.js`

#### TC-22: Ticket Status Poll - Pending Compilation State
*   **Preconditions**: Payment succeeded, PDF stream is still open and compiling.
*   **Steps**: Query `/api/tickets/status/RSM-192841` mid-compilation.
*   **Expected Result**: Returns `{ "ready": false }`.
*   **Failure Result**: Returns true prematurely, causing guests to download incomplete files.
*   **Related Files**: `/server/src/controllers/ticketController.js`

#### TC-23: Ticket PDF - Local Write-Stream Directory Failure
*   **Preconditions**: Local `/tickets` directory permissions set to read-only.
*   **Steps**: Trigger ticket compilation.
*   **Expected Result**: Stream error caught cleanly, write-stream closed, zero-byte file deleted, and promise rejected safely.
*   **Failure Result**: Server hangs, leaks file descriptor, and keeps corrupt files.
*   **Related Files**: `/server/src/services/ticketService.js`

#### TC-24: Ticket PDF - Obfuscated Filename UUID Verification
*   **Preconditions**: Ticket generated.
*   **Steps**: Verify file name in storage folder.
*   **Expected Result**: Filename is random UUID format (`9b1deb4d.pdf`), not booking ID.
*   **Failure Result**: Filename is sequential/guessable guest booking ID.
*   **Related Files**: `/server/src/services/ticketService.js`

#### TC-25: Ticket PDF - S3 Cloud Bucket Persistent Serving
*   **Preconditions**: Server restarts.
*   **Steps**: Restart dynamic cloud host container, request old ticket download.
*   **Expected Result**: Ticket fetched successfully from AWS S3 cloud bucket bucket.
*   **Failure Result**: Link breaks because local files were wiped on restart.
*   **Related Files**: `/server/src/services/ticketService.js`

#### TC-26: Ticket Download - Virtual Link Click Triggers
*   **Preconditions**: E-ticket URL returned to React.
*   **Steps**: Click download button in frontend.
*   **Expected Result**: Browser initiates file download named `RSM-Ticket-RSM-192841.pdf` successfully.
*   **Failure Result**: Opens file raw in browser tab or breaks.
*   **Related Files**: `/src/services/ticketService.js`

---

### Category D: Admin Auth & Portal Sessions

#### TC-27: Successful PIN Passcode Verification
*   **Preconditions**: Admin PIN passcode set.
*   **Steps**: Send POST to `/api/admin/verify-pin` with `{ "pin": "458921" }`.
*   **Expected Result**: Status `200 OK` with JSON `{ "success": true }`.
*   **Failure Result**: Rejection or status errors.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-28: Verification - Invalid PIN Attempt
*   **Preconditions**: Keypad active.
*   **Steps**: Send POST to `/api/admin/verify-pin` with `{ "pin": "111111" }`.
*   **Expected Result**: Status `400 Bad Request` with message `"Invalid Admin PIN"`.
*   **Failure Result**: Status 200 success.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-29: Verification - Non-Numeric Passcode Payload
*   **Preconditions**: Keypad active.
*   **Steps**: Send POST to `/api/admin/verify-pin` with `{ "pin": "abc" }`.
*   **Expected Result**: Status `400 Bad Request` with message `"Administrator passcode must be exactly 6 numeric digits"`.
*   **Failure Result**: Succeeds.
*   **Related Files**: `/server/src/middleware/validator.js`

#### TC-30: Session Persistence - sessionStorage State Hook
*   **Preconditions**: PIN verified successfully on browser.
*   **Steps**: Refresh the `/admin/dashboard` page.
*   **Expected Result**: sessionStorage reads credentials, session persists, and dashboard loads without redirecting back to PIN screen.
*   **Failure Result**: Logs operator out instantly.
*   **Related Files**: `/src/hooks/useAdminAuth.jsx`

#### TC-31: Auth Guard - Accessing /bookings Without Admin Token
*   **Preconditions**: Unauthenticated session.
*   **Steps**: Send direct HTTP GET request to `/api/admin/bookings`.
*   **Expected Result**: Returns `401 Unauthorized` and blocks access.
*   **Failure Result**: Returns roster list of guests.
*   **Related Files**: `/server/src/middleware/auth.js`

#### TC-32: Rate Limiting - Block Brute Forcing on /verify-pin
*   **Preconditions**: Rate limiter active.
*   **Steps**: Send 6 concurrent failed PIN attempts from same IP within one minute.
*   **Expected Result**: Sixth attempt blocked with status `429 Too Many Requests` and rate limit warning message.
*   **Failure Result**: Continues verifying PIN, allowing dictionary attacks.
*   **Related Files**: `/server/src/middleware/rateLimiter.js`

---

### Category E: Manager Dashboard Metrics & Ledgers

#### TC-33: Dashboard Stats - Today's Bookings Aggregate
*   **Preconditions**: Bookings created today.
*   **Steps**: Load admin dashboard `/admin/dashboard`.
*   **Expected Result**: Metric card shows exact count of reservations created today.
*   **Failure Result**: Shows 0 or counts historical bookings.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-34: Dashboard Stats - Today's Expected Visitors Sum
*   **Preconditions**: Guest bookings exist for today.
*   **Steps**: Load admin dashboard `/admin/dashboard`.
*   **Expected Result**: Metric card shows exact sum of `peopleCount` for today's visitors.
*   **Failure Result**: Shows wrong aggregates.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-35: Dashboard Stats - Today's PAID Revenue Sum
*   **Preconditions**: PAID guest bookings exist for today.
*   **Steps**: Load admin dashboard `/admin/dashboard`.
*   **Expected Result**: Card displays correct Indian currency sum (₹) ofpaid bookings today.
*   **Failure Result**: Counts pending or unpaid sums.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-36: Dashboard Stats - Checked-In Admissions Roster Count
*   **Preconditions**: Guests checked-in today.
*   **Steps**: Load admin dashboard.
*   **Expected Result**: Card displays correct count of checked-in tickets today.
*   **Failure Result**: Miscalculates totals.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-37: Dashboard - Caching KPI Calculations
*   **Preconditions**: Massive booking database.
*   **Steps**: Query stats endpoint repeatedly.
*   **Expected Result**: Stats compile fast without SQL aggregate timeout.
*   **Failure Result**: Database query logs show duplicate full-table scans, locking database.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-38: Bookings Roster Ledger sorted Desc by ID
*   **Preconditions**: Bookings database populated.
*   **Steps**: Query `/api/admin/bookings`.
*   **Expected Result**: List returns records chronologically descending (latest creations first).
*   **Failure Result**: Unsorted or ascending order.
*   **Related Files**: `/server/src/controllers/adminController.js`

---

### Category F: Gate QR Scanning & Verification Badges

#### TC-39: Scanning Verify - VALID Badge Criteria
*   **Preconditions**: Booking PAID, visitDate is today, not checked-in.
*   **Steps**: Scan ticket QR code at gate scanner.
*   **Expected Result**: Scanner display shifts to Green badge showing **VALID** status.
*   **Failure Result**: Shows invalid or expired.
*   **Related Files**: `/server/src/controllers/adminController.js`, `/src/dashboards/admin/VerifyTicket.jsx`

#### TC-40: Scanning Verify - UNPAID Badge Criteria
*   **Preconditions**: Booking created, payment status `'PENDING'`.
*   **Steps**: Scan ticket QR code.
*   **Expected Result**: Scanner displays Slate badge showing **UNPAID** status; blocks admittance.
*   **Failure Result**: Renders VALID badge.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-41: Scanning Verify - USED Badge Criteria
*   **Preconditions**: Booking PAID, has been checked-in.
*   **Steps**: Scan same ticket QR code again.
*   **Expected Result**: Scanner displays Red badge showing **USED** status; blocks double-admittance.
*   **Failure Result**: Renders VALID again.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-42: Scanning Verify - EXPIRED Badge Criteria
*   **Preconditions**: Booking visitDate is yesterday or prior.
*   **Steps**: Scan ticket QR code.
*   **Expected Result**: Scanner displays Red badge showing **EXPIRED** status; blocks entry.
*   **Failure Result**: Renders VALID.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-43: Scanning Verify - NOT_VALID_YET Badge Criteria
*   **Preconditions**: Booking visitDate is tomorrow or later.
*   **Steps**: Scan ticket QR code.
*   **Expected Result**: Scanner displays Orange badge showing **NOT_VALID_YET** status; blocks entry.
*   **Failure Result**: Admits guest prematurely.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-44: Scanning Verify - NOT_FOUND Badge Criteria
*   **Preconditions**: Ticket QR code contains fake booking ID.
*   **Steps**: Scan ticket QR code.
*   **Expected Result**: Scanner displays Red badge showing **NOT_FOUND** status; blocks admittance.
*   **Failure Result**: Succeeds or crashes.
*   **Related Files**: `/server/src/controllers/adminController.js`

---

### Category G: Gate Admissions Check-In & Security

#### TC-45: Successful Guest Entrance Admittance Check-In
*   **Preconditions**: Scanner displays VALID badge.
*   **Steps**: Click "ALLOW ENTRY" button.
*   **Expected Result**: Sends check-in POST, status updated to `USED`, gate entry timestamp set, and response `{ success: true, status: "USED" }` returned.
*   **Failure Result**: Fails, leaving check-in un-committed.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-46: Check-In - Ticket already USED and Checked-In Block
*   **Preconditions**: isCheckedIn is true.
*   **Steps**: Attempt direct POST request to `/api/admin/checkin` with the USED booking ID.
*   **Expected Result**: Status `400 Bad Request` with message `"Ticket already checked-in and used"`.
*   **Failure Result**: Overwrites check-in time and re-registers admittance log.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-47: Check-In - Concurrency Gate Scans Select Lock Race Condition
*   **Preconditions**: Two gate staff scan same barcode simultaneously.
*   **Steps**: Both click "ALLOW ENTRY" at the same microsecond.
*   **Expected Result**: Database transaction locks booking row; Thread A updates successfully, Thread B receives immediate rejection.
*   **Failure Result**: Both threads admit guests, leading to duplicate entrance.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-48: Checked-In Logs - Chronological Audit Roster Check
*   **Preconditions**: Check-ins completed.
*   **Steps**: Query `/api/admin/checkins`.
*   **Expected Result**: Roster contains checked-in visitor list sorted by check-in time descending.
*   **Failure Result**: Wrong sorting or missing logs.
*   **Related Files**: `/server/src/controllers/adminController.js`

#### TC-49: CORS Security - Bypassing Wildcard Domain Permissions
*   **Preconditions**: Server running.
*   **Steps**: Send direct GET request to `/api/admin/bookings` from a third-party cross-origin domain.
*   **Expected Result**: Request blocked by browser CORS policy.
*   **Failure Result**: Exposes guest databases to foreign scripts.
*   **Related Files**: `/server/src/app.js`

#### TC-50: Deployment Validation - Environment Secrets Startup Checks
*   **Preconditions**: Seeding production environments.
*   **Steps**: Start backend server.
*   **Expected Result**: Server loads and runs successfully, securely reading all required properties.
*   **Failure Result**: Crashes due to missing database pool parameters or gateway key variables.
*   **Related Files**: `/server/src/app.js`, `/server/.env`
