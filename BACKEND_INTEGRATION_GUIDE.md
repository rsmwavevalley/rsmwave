# RSM Wave Valley — Full-Stack Integration Guide

This document explains exactly how the React (Vite) frontend communicates with the Node/Express backend endpoints. It defines the mapping, payloads, validations, payment captures, and dynamic ticket status polling contracts.

---

## 🗺️ E-to-E Full-Stack API Mapping

The frontend triggers specific AJAX routes mapped directly to database-verified backend operations:

### 1. Booking Creation Wizard (`/booking` route)
- **Frontend Source**: `src/pages/Booking.jsx` (via `bookingService.createBooking`)
- **Backend Route**: `POST /api/bookings/create`
- **Request Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "peopleCount": 4,
    "visitDate": "2026-06-15T00:00:00.000Z"
  }
  ```
- **Backend Validation**:
  - `validateBookingCreation` middleware validates and sanitizes input (minimum 2 name chars, correct email schema, stripped 10-digit mobile number, visitor count 1 to 10, tomorrow or later date).
- **Backend Operation**: Enforces the 1000 slot capacity limit per date in a transaction, creates a `PENDING` booking, and returns it.
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "booking": {
      "id": 1,
      "bookingId": "RSM-192038",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "peopleCount": 4,
      "visitDate": "2026-06-15T00:00:00.000Z",
      "totalAmount": 2600,
      "paymentStatus": "PENDING"
    }
  }
  ```

---

### 2. Payment Orders & Captures Flow
This transitions the PENDING booking into a verified, PAID order.

```text
Wizard Wizard ──────> [POST /api/payments/create-order] ──────> Triggers Razorpay Popup
                                                                     │
Admittance Ticket <─── [POST /api/payments/verify-payment] <──────────┘ Signature Success
```

#### Order Creation Check
- **Frontend Source**: `src/hooks/useBooking.js` (via `paymentService.createOrder`)
- **Backend Route**: `POST /api/payments/create-order`
- **Request Payload**: `{ "bookingId": "RSM-192038" }`
- **Backend Operation**: Validates status is `PENDING`, checks date is not expired, contacts Razorpay API, and returns order details.
- **Expected Response**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order_PKyD768uV",
      "amount": 260000,
      "currency": "INR",
      "receipt": "RSM-192038"
    },
    "booking": {
      "bookingId": "RSM-192038",
      "totalAmount": 2600
    }
  }
  ```

#### Signature Verification & Ticket Compile
- **Frontend Source**: `src/hooks/useBooking.js` (via `paymentService.verifyPayment`)
- **Backend Route**: `POST /api/payments/verify-payment`
- **Request Payload**:
  ```json
  {
    "razorpay_order_id": "order_PKyD768uV",
    "razorpay_payment_id": "pay_PKyJ209sE",
    "razorpay_signature": "abcdef123456789...",
    "bookingId": "RSM-192038"
  }
  ```
- **Backend Operation**: Enforces crypt HMAC verification, marks booking `PAID` inside isolated transaction locks, blocks signature replays, and launches PDF Kit compiler.
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "paymentId": "pay_PKyJ209sE",
    "ticket": "/tickets/RSM-192038.pdf"
  }
  ```

---

### 3. Dynamic PDF Ticket Polling Loop
- **Frontend Source**: `src/services/ticketService.js` (via `pollTicketStatus`)
- **Backend Route**: `GET /api/tickets/status/:bookingId`
- **Backend Operation**: Queries database to see if `Ticket` row exists with dynamic URL.
- **Expected Response**: `{ "ready": true, "ticketUrl": "/tickets/RSM-192038.pdf" }`
- **Frontend Downloader**: If `ready` is true, pulls blob file and triggers local browser saving.

---

### 4. Admin Portals & Scan Checking
These routes are protected by the administrative PIN checks passcode authorization middleware.

#### PIN Passcode Authentication Gate
- **Frontend Route**: `/admin` (via `PinScreen.jsx` and `adminService.verifyPin`)
- **Backend Route**: `POST /api/admin/verify-pin`
- **Request Payload**: `{ "pin": "458921" }`
- **Backend Operation**: Validates input against hashed PIN configurations using built-in crypt.
- **Expected Response**: `{ "success": true }`

#### Entry Scanning Validation Badges
- **Frontend Route**: `/admin/verify-ticket` (via `VerifyTicket.jsx` and `adminService.verifyTicket`)
- **Backend Route**: `POST /api/admin/verify-ticket`
- **Request Payload**: `{ "bookingId": "RSM-192038" }`
- **Backend Operation**: Computes IST-aligned verification badges:
  - `VALID` (Green): PAID, visitDate is today, guest hasn't checked in.
  - `UNPAID` (Slate): paymentStatus is PENDING.
  - `USED` (Red): `isCheckedIn` is true.
  - `EXPIRED` (Red): `visitDate` is yesterday or earlier.
  - `NOT_VALID_YET` (Orange): `visitDate` is tomorrow or later.
  - `NOT_FOUND` (Red): Alphanumeric key lookup yields zero database records.
- **Expected Response**:
  ```json
  {
    "bookingId": "RSM-192038",
    "name": "John Doe",
    "mobile": "9876543210",
    "visitDate": "2026-06-15T00:00:00.000Z",
    "guestCount": 4,
    "amount": 2600,
    "paymentStatus": "PAID",
    "verificationStatus": "VALID"
  }
  ```

#### Check-In Admission Committal
- **Frontend Route**: `/admin/verify-ticket` (via `VerifyTicket.jsx` click "ALLOW ENTRY")
- **Backend Route**: `POST /api/admin/checkin`
- **Request Payload**: `{ "bookingId": "RSM-192038" }`
- **Backend Operation**: Enforces transactional safety, preventing duplicate scan check-ins.
- **Expected Response**: `{ "success": true, "status": "USED" }`
