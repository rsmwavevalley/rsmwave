# RSM Wave Valley — Frontend API Contract Specification

This document details the complete **frontend-to-backend REST API contracts** for the RSM Wave Valley Resort system.

It is written specifically for the backend database engineer to understand exactly what parameters the React frontend transmits, what JSON payloads it expects, how it manages UI loading states, and how it handles exceptions, allowing you to implement production endpoints without needing to inspect React codebase files.

---

## 📂 Section 1 - Booking Creation Flow Contracts

### 1. `POST /api/bookings/create`

*   **Component Name**: `Booking`
*   **File Path**: `src/pages/Booking.jsx`
*   **Function Name**: `handleSubmit` (routed through `bookingService.createBooking`)
*   **HTTP Method**: `POST`
*   **Request Payload Schema**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "peopleCount": 4,
      "visitDate": "2026-06-15T00:00:00.000Z"
    }
    ```
*   **Required Response Structure**:
    ```json
    {
      "success": true,
      "message": "Booking created successfully",
      "booking": {
        "id": 99,
        "bookingId": "RSM-192038",
        "name": "John Doe",
        "email": "john@example.com",
        "mobile": "9876543210",
        "peopleCount": 4,
        "visitDate": "2026-06-15T00:00:00.000Z",
        "totalAmount": 2600,
        "paymentStatus": "PENDING",
        "isCheckedIn": false,
        "checkedInAt": null,
        "createdAt": "2026-06-01T15:40:00.000Z"
      }
    }
    ```
*   **Error Handling Logic**: Triggered via `try/catch`. If response status is not `200/201`, parses `{ "success": false, "message": "Reason details" }` and renders a Rose-colored alert box displaying the reason at the top of the wizard.
*   **Loading State Logic**: Disables the submit buttons, replacing them with a loading spinner showing "Processing Booking..." to block double submits.
*   **Frontend Validation Rules**: Name must be > 1 character, email must follow standard regex, phone number must be exactly 10 numeric digits, peopleCount must be between 1 and 10, visitDate must be today or in the future.
*   **Breaking Change Impact**: If the `booking` object or the unique alphanumeric string key `bookingId` is missing from the JSON return, the client state machine crashes, blocking payment initialization.

---

### 2. `POST /api/payments/create-order`

*   **Component Name**: `Booking` / `useBooking`
*   **File Path**: `src/hooks/useBooking.js`
*   **Function Name**: `initiatePayment` (routed through `paymentService.createOrder`)
*   **HTTP Method**: `POST`
*   **Request Payload Schema**: `{ "bookingId": "RSM-192038" }`
*   **Required Response Structure**:
    ```json
    {
      "success": true,
      "order": {
        "id": "order_PKyD768uV",
        "entity": "order",
        "amount": 260000,
        "amount_paid": 0,
        "amount_due": 260000,
        "currency": "INR",
        "receipt": "RSM-192038",
        "status": "created",
        "attempts": 0,
        "notes": [],
        "created_at": 1779999999
      },
      "booking": {
        "bookingId": "RSM-192038",
        "name": "John Doe",
        "email": "john@example.com",
        "mobile": "9876543210",
        "totalAmount": 2600
      }
    }
    ```
*   **Error Handling Logic**: Triggers standard checkout failure alert overlay: `"Checkout Interrupted - Order creation failed"`.
*   **Loading State Logic**: The screen is overlayed with a loading mask during SDK order calls.
*   **Frontend Dependencies**: Razorpay Web Checkout JS SDK (injects options into `window.Razorpay`).
*   **Breaking Change Impact**: The `order.id` (Razorpay Order ID string) and amount parameters must exist in the exact key path structure shown.

---

### 3. `POST /api/payments/verify-payment`

*   **Component Name**: `Booking` / `useBooking`
*   **File Path**: `src/hooks/useBooking.js`
*   **Function Name**: `verifyPayment` (routed through `paymentService.verifyPayment`)
*   **HTTP Method**: `POST`
*   **Request Payload Schema**:
    ```json
    {
      "razorpay_order_id": "order_PKyD768uV",
      "razorpay_payment_id": "pay_PKyJ209sE",
      "razorpay_signature": "abcdef123456789...",
      "bookingId": "RSM-192038"
    }
    ```
*   **Required Response Structure**:
    ```json
    {
      "success": true,
      "message": "Payment verified successfully",
      "paymentId": "pay_PKyJ209sE",
      "ticket": "/tickets/RSM-192038.pdf"
    }
    ```
*   **Error Handling Logic**: Displays payment validation failure pages with options to retry or contact help desks.
*   **Loading State Logic**: Replaces Razorpay frame overlays with compile spinner logs.
*   **Breaking Change Impact**: Response must return `success: true` and the `ticket` URL string (relative path) to proceed to the e-ticket download button layout.

---

### 4. `GET /api/tickets/status/:bookingId`

*   **Component Name**: `Booking` / `useBooking`
*   **File Path**: `src/services/ticketService.js`
*   **Function Name**: `pollTicketStatus`
*   **HTTP Method**: `GET`
*   **Required Response Structure**: `{ "ready": true, "ticketUrl": "/tickets/RSM-192038.pdf" }`
*   **Loading State Logic**: Renders dynamic progress spinner.
*   **Error Handling Logic**: Re-polls up to 5 times (1.5-second buffer steps) before declaring compilation timeout errors.

---

### 5. `GET /api/config/pricing`

*   **Component Name**: `Booking`
*   **File Path**: `src/services/bookingService.js`
*   **Function Name**: `getPricingConfig`
*   **HTTP Method**: `GET`
*   **Required Response Structure**:
    ```json
    {
      "ticketPrice": 650,
      "adultPrice": 650,
      "childPrice": 400,
      "weekendPrice": 750,
      "holidayPrice": 800
    }
    ```
*   **Error Handling Logic**: Gracefully loads standard hardcoded price configuration parameters if the Express endpoint is unconfigured.

---

### 6. `GET /api/capacity?date=YYYY-MM-DD`

*   **Component Name**: `Booking`
*   **File Path**: `src/services/bookingService.js`
*   **Function Name**: `getDateCapacity`
*   **HTTP Method**: `GET`
*   **Required Response Structure**:
    ```json
    {
      "totalCapacity": 1000,
      "remainingCapacity": 960,
      "soldOut": false
    }
    ```
*   **Error Handling Logic**: Falls back safely to 1000 open slots and `soldOut: false` if database connection exceptions occur.

---

## 🔒 Section 2 - Staff Administrative Portal Contracts

### 7. `POST /api/admin/verify-pin`

*   **Component Name**: `PinScreen`
*   **File Path**: `src/dashboards/admin/PinScreen.jsx`
*   **Function Name**: `handleSubmit` (routed through `adminService.verifyPin`)
*   **HTTP Method**: `POST`
*   **Request Payload Schema**: `{ "pin": "458921" }`
*   **Required Response Structure**: `{ "success": true }` or `{ "success": false, "message": "Invalid Admin PIN" }`
*   **Loading State Logic**: Keypad input is disabled during verify REST attempts.
*   **Error Handling Logic**: Shakes keypad layouts, flashes red warnings, and clears the PIN input.

---

### 8. `GET /api/admin/dashboard`

*   **Component Name**: `DashboardHome`
*   **File Path**: `src/dashboards/admin/DashboardHome.jsx`
*   **Function Name**: `loadDashboardData` (routed through `adminService.getDashboardStats`)
*   **HTTP Method**: `GET`
*   **Required Response Structure**:
    ```json
    {
      "todayBookings": 12,
      "todayVisitors": 38,
      "todayRevenue": 24700,
      "verifiedTicketsToday": 14
    }
    ```
*   **Loading State Logic**: Renders border-spinning loading components in the main manager views during aggregations.
*   **Error Handling Logic**: Displays alert banners at the top of the dashboard containing `"Could not load dashboard statistics. Check backend API connection."`.

---

### 9. `GET /api/admin/bookings`

*   **Component Name**: `BookingsList`
*   **File Path**: `src/dashboards/admin/BookingsList.jsx`
*   **Function Name**: `loadBookings` (routed through `adminService.getBookings`)
*   **HTTP Method**: `GET`
*   **Required Response Structure**:
    ```json
    [
      {
        "id": 1,
        "bookingId": "RSM-192038",
        "name": "John Doe",
        "email": "john@example.com",
        "mobile": "9876543210",
        "peopleCount": 4,
        "visitDate": "2026-06-15T00:00:00.000Z",
        "totalAmount": 2600,
        "paymentStatus": "PAID",
        "isCheckedIn": false,
        "checkedInAt": null,
        "createdAt": "2026-06-01T14:32:00.000Z"
      }
    ]
    ```
*   **Loading State Logic**: Main list renders placeholder loader bones.
*   **Error Handling Logic**: Displays empty list state and prints errors to debug consoles.

---

### 10. `POST /api/admin/verify-ticket`

*   **Component Name**: `VerifyTicket`
*   **File Path**: `src/dashboards/admin/VerifyTicket.jsx`
*   **Function Name**: `handleScan` (routed through `adminService.verifyTicket`)
*   **HTTP Method**: `POST`
*   **Request Payload Schema**: `{ "bookingId": "RSM-192038" }`
*   **Required Response Structure**:
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
*   **Loading State Logic**: Disables scanner processing hooks during verification queries.
*   **Allowed `verificationStatus` Values**: `VALID` (Green), `UNPAID` (Slate), `USED` (Red), `EXPIRED` (Red), `NOT_VALID_YET` (Orange), `NOT_FOUND` (Red).

---

### 11. `POST /api/admin/checkin`

*   **Component Name**: `VerifyTicket`
*   **File Path**: `src/dashboards/admin/VerifyTicket.jsx`
*   **Function Name**: `handleCheckin` (routed through `adminService.checkinTicket`)
*   **HTTP Method**: `POST`
*   **Request Payload Schema**: `{ "bookingId": "RSM-192038" }`
*   **Required Response Structure**: `{ "success": true, "status": "USED" }`
*   **Loading State Logic**: Renders spinner on the "ALLOW ENTRY" button.

---

### 12. `GET /api/admin/checkins`

*   **Component Name**: `CheckinHistory` / `DashboardHome`
*   **File Path**: `src/dashboards/admin/CheckinHistory.jsx`
*   **Function Name**: `loadLogs` (routed through `adminService.getCheckinLogs`)
*   **HTTP Method**: `GET`
*   **Required Response Structure**:
    ```json
    [
      {
        "bookingId": "RSM-192038",
        "name": "John Doe",
        "mobile": "9876543210",
        "guestCount": 4,
        "amount": 2600,
        "checkInTime": "2026-06-01T14:32:00.000Z",
        "operator": "GATE_STAFF_NODE"
      }
    ]
    ```
