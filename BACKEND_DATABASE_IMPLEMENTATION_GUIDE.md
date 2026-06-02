# RSM Wave Valley — Backend Database Implementation Guide

This document acts as a definitive reference manual detailing the database schemas setup, migrations steps, indices constraints, and concurrency transaction isolation designs for **RSM Wave Valley Resort**.

---

## 🗄️ Relational Schema & Cascading Deletions

The database schema defined in `/server/prisma/schema.prisma` uses explicit relations mapping. It includes **Cascading Deletions** (`onDelete: Cascade`) to ensure referencing rows are pruned when parent booking profiles are purged.

```mermaid
classDiagram
    class Booking {
        Int id (PK)
        String bookingId (UQ)
        String name
        String email
        String mobile
        Int peopleCount
        DateTime visitDate
        Float totalAmount
        String paymentStatus
        Boolean isCheckedIn
        DateTime checkedInAt
    }
    class Payment {
        Int id (PK)
        Int bookingId (FK, UQ)
        String razorpayOrderId
        String razorpayPaymentId (UQ)
        String status
        DateTime paidAt
    }
    class Ticket {
        Int id (PK)
        Int bookingId (FK, UQ)
        String ticketUrl
        DateTime generatedAt
    }
    Booking "1" -- "0..1" Payment : onDelete Cascade
    Booking "1" -- "0..1" Ticket : onDelete Cascade
```

### Prisma Schema Definitions snippet:
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
  razorpayPaymentId     String?   @unique
  razorpaySignature     String?
  status                String    @default("PENDING")
  paidAt                DateTime?
  booking               Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model Ticket {
  id             Int       @id @default(autoincrement())
  bookingId      Int       @unique
  ticketUrl      String
  generatedAt    DateTime  @default(now())
  booking        Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}
```

---

## ⚡ Indexing Strategy

To maintain maximum performance under heavy traffic periods (e.g. holiday entry gates checking), we set explicit index arrays:
1. `@@index([visitDate])`: Crucial for daily capacity checks (`getDateCapacity`). It accelerates aggregated checks of slots sold.
2. `@@index([createdAt])`: Optimizes sorting queries inside chronological admin reservations dashboards.
3. `@@index([paymentStatus, isCheckedIn])`: Accelerates multi-parameter operational audits.

---

## 🔒 Transaction Safety & Isolation Designs

Every critical operations controller is isolated inside atomic database transactions (`prisma.$transaction`) to protect data integrity:

### 1. Booking Creation Capacity Lock
- **Strategy**: Before writing new bookings, the transaction aggregates total paid visitor sums scheduled for `visitDate`. If the `sum + proposed peopleCount` exceeds 1000, it throws an error and rolls back the database.

### 2. Payments Verification
- **Strategy**: Inside payment confirmation writes, the transaction isolates booking lookups and updates. It verifies the current status is `PENDING`. It logs payment rows using unique constraint checks on `razorpayPaymentId`. This completely blocks payment replay attacks or concurrent double-processing.

### 3. Entry Check-In Gate Guard
- **Strategy**: During barcode scans check-ins, the transaction locks the booking. It checks if `isCheckedIn` is true, and updates status only if false. Parallel scanner entry threads are serialized, blocking check-in bypass scams.

---

## 🚀 Migration Procedures

1. **Verify environment connections URL** inside `server/.env`:
   ```ini
   DATABASE_URL="mysql://username:password@hostname:3306/dbname"
   ```
2. **Apply migrations schema**:
   ```bash
   npx prisma migrate dev --name init_rsm_valley_relational_schema
   ```
3. **Regenerate client models**:
   ```bash
   npx prisma generate
   ```
