# RSM Wave Valley — Dashboard KPI Redesign Audit & Proposal

This document outlines the architectural blueprint to transition the **RSM Wave Valley** administrator dashboard from its current layout of combined metrics into two clean, logically isolated reporting surfaces:
1. **OWNER KPIs**: Cumulative, all-time historical performance parameters (sales, cumulative gate intake, and asset valuations).
2. **OPERATIONS KPIs**: Real-time, IST-normalized crowd management and gate intake metrics for the current calendar day.

---

## 📊 1. Current Ambiguity vs. Proposed Redesign

### Current Dashboard Limitations:
- The current layout blends all-time metrics with daily operational statistics.
- **"Today's Bookings"** acts as a transactional sales card, while **"Today's Revenue"** acts as an operational capacity card (visiting today). This leads to confusion (e.g., selling ₹10,000 worth of tickets today for future visits results in a high bookings count but ₹0 revenue on the dashboard).

### Proposed Owner/Operations Separation Model:

```text
  ┌───────────────────────────────────────────────────────────┐
  │                   ADMINISTRATIVE DASHBOARD                │
  ├─────────────────────────────┬─────────────────────────────┤
  │          OWNER KPIs         │       OPERATIONS KPIs       │
  │    (Cumulative / All-Time)  │    (Real-Time / Today IST)  │
  ├─────────────────────────────┼─────────────────────────────┤
  │ * Total Revenue (₹)         │ * Expected Visitors Today   │
  │ * Total Visitors            │ * Today's Revenue (₹)       │
  │ * Total Paid Bookings       │ * Today's Admissions        │
  │ * Total Check-ins           │ * Pending Arrivals          │
  └─────────────────────────────┴─────────────────────────────┘
```

---

## 🔒 2. Exact Backend Query Logic (Prisma)

Below are the exact production-grade database queries required for all 8 metrics:

### 💼 A. OWNER KPIs (Cumulative Data)

#### 1. Total Revenue (All-Time Cash Collected)
```javascript
const totalRevenueResult = await prisma.booking.aggregate({
  _sum: { totalAmount: true },
  where: { paymentStatus: "PAID" }
});
const totalRevenue = totalRevenueResult._sum.totalAmount || 0;
```

#### 2. Total Visitors (All-Time Ticketed Guests)
```javascript
const totalVisitorsResult = await prisma.booking.aggregate({
  _sum: { peopleCount: true },
  where: { paymentStatus: "PAID" }
});
const totalVisitors = totalVisitorsResult._sum.peopleCount || 0;
```

#### 3. Total Paid Bookings (All-Time Confirmed Purchases)
```javascript
const totalPaidBookings = await prisma.booking.count({
  where: { paymentStatus: "PAID" }
});
```

#### 4. Total Check-ins (All-Time Gate Intakes)
```javascript
const totalCheckins = await prisma.booking.count({
  where: { isCheckedIn: true }
});
```

---

### ⚙️ B. OPERATIONS KPIs (Real-Time Current Date IST)

#### 1. Expected Visitors Today (Scheduled Crowd Intake)
```javascript
const expectedVisitorsResult = await prisma.booking.aggregate({
  _sum: { peopleCount: true },
  where: {
    paymentStatus: "PAID",
    visitDate: { gte: startOfToday, lte: endOfToday }
  }
});
const expectedVisitorsToday = expectedVisitorsResult._sum.peopleCount || 0;
```

#### 2. Today's Revenue (Operating Revenue Scheduled Today)
```javascript
const todayRevenueResult = await prisma.booking.aggregate({
  _sum: { totalAmount: true },
  where: {
    paymentStatus: "PAID",
    visitDate: { gte: startOfToday, lte: endOfToday }
  }
});
const todayRevenue = todayRevenueResult._sum.totalAmount || 0;
```

#### 3. Today's Admissions (Actual Checked-In Guest Groups Today)
```javascript
const todayAdmissions = await prisma.booking.count({
  where: {
    isCheckedIn: true,
    checkedInAt: { gte: startOfToday, lte: endOfToday }
  }
});
```

#### 4. Pending Arrivals (Expected Visitors Still to Arrive)
```javascript
const pendingArrivalsResult = await prisma.booking.aggregate({
  _sum: { peopleCount: true },
  where: {
    paymentStatus: "PAID",
    isCheckedIn: false,
    visitDate: { gte: startOfToday, lte: endOfToday }
  }
});
const pendingArrivals = pendingArrivalsResult._sum.peopleCount || 0;
```

---

## 📡 3. Proposed API Contract Schema

The API endpoint `/api/admin/dashboard` will be updated to expose a clean, nested JSON payload structure:

```json
{
  "success": true,
  "ownerKpis": {
    "totalRevenue": 154750,
    "totalVisitors": 238,
    "totalPaidBookings": 82,
    "totalCheckins": 74
  },
  "operationsKpis": {
    "expectedVisitorsToday": 38,
    "todayRevenue": 24700,
    "todayAdmissions": 14,
    "pendingArrivals": 24
  }
}
```

---

## 🛠️ 4. Required Modifications Plan

To finalize this redesign when the frontend code lock is lifted, the following modifications are recommended:

### 1. Backend Controller Modification
- **File**: `server/src/controllers/adminController.js` (specifically `getDashboardStats`)
- **Changes**: Integrate the 8 query aggregates shown above, compute timezone-safe IST start/end parameters, and structure the return object into `ownerKpis` and `operationsKpis`.

### 2. Frontend Dashboard Presentation Modification
- **File**: `src/dashboards/admin/DashboardHome.jsx`
- **Changes**:
  - Update grid layout to render two dedicated panels under distinct `OWNER KPIs` and `OPERATIONS KPIs` subheadings.
  - Map UI cards dynamically to read keys:
    - *Revenue Card* -> `data.ownerKpis.totalRevenue`
    - *Crowd Card* -> `data.operationsKpis.expectedVisitorsToday`
    - *Intake Card* -> `data.operationsKpis.todayAdmissions`
    - *Alert Card* -> `data.operationsKpis.pendingArrivals` (perfect for managers to monitor remaining capacity flow).
