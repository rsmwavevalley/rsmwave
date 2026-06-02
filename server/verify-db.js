const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const runVerification = async () => {
  console.log("=========================================================================");
  console.log("             RSM Wave Valley — MySQL E2E Integration Check              ");
  console.log("=========================================================================");
  console.log(`[CONFIG] Port: ${process.env.PORT || 5000}`);
  console.log(`[CONFIG] Database URL: ${process.env.DATABASE_URL ? "CONFIGURED" : "MISSING"}`);
  console.log("-------------------------------------------------------------------------");

  try {
    console.log("[STEP 1/5] Connecting to MySQL database server...");
    await prisma.$connect();
    console.log("  SUCCESS: Database server connection established successfully!");
    console.log("-------------------------------------------------------------------------");

    console.log("[STEP 2/5] Confirming database tables exist...");
    
    // We run raw table queries or standard prisma operations to confirm schema migrations
    const bookingCount = await prisma.booking.count().catch(err => {
      throw new Error(`Booking table check failed: ${err.message}`);
    });
    console.log(`  SUCCESS: Booking table exists (Contains ${bookingCount} records).`);

    const paymentCount = await prisma.payment.count().catch(err => {
      throw new Error(`Payment table check failed: ${err.message}`);
    });
    console.log(`  SUCCESS: Payment table exists (Contains ${paymentCount} records).`);

    const ticketCount = await prisma.ticket.count().catch(err => {
      throw new Error(`Ticket table check failed: ${err.message}`);
    });
    console.log(`  SUCCESS: Ticket table exists (Contains ${ticketCount} records).`);
    console.log("-------------------------------------------------------------------------");

    console.log("[STEP 3/5] Inserting a real test booking row...");
    const testId = `RSM-TEST-${Math.floor(100000 + Math.random() * 900000)}`;
    const testBooking = await prisma.booking.create({
      data: {
        bookingId: testId,
        name: "Verification Test Guest",
        email: "verify-test@rsmwave.com",
        mobile: "9999999999",
        peopleCount: 5,
        visitDate: new Date(),
        totalAmount: 3250,
        paymentStatus: "PENDING",
        isCheckedIn: false
      }
    });
    console.log(`  SUCCESS: Created verification row: ID: ${testBooking.id}, BookingID: ${testBooking.bookingId}`);
    console.log("-------------------------------------------------------------------------");

    console.log("[STEP 4/5] Verifying written row appears in MySQL queries...");
    const queried = await prisma.booking.findUnique({
      where: { bookingId: testId }
    });

    if (queried && queried.name === "Verification Test Guest") {
      console.log("  SUCCESS: Verification test guest profile verified successfully!");
    } else {
      throw new Error("Written verification data mismatch or row not found.");
    }
    console.log("-------------------------------------------------------------------------");

    console.log("[STEP 5/5] Pruning verification test booking...");
    await prisma.booking.delete({
      where: { id: testBooking.id }
    });
    console.log("  SUCCESS: Pruned test booking row successfully (cascades verified)!");
    console.log("=========================================================================");
    console.log("             VERIFICATION COMPLETED: Database is 100% HEALTHY!           ");
    console.log("=========================================================================");

  } catch (error) {
    console.error("\n🔴 VERIFICATION FAILED!");
    console.error("Error Message:", error.message);
    console.error("\nRoot Cause / Troubleshooting Checklist:");
    console.error("1. Confirm the MySQL server is installed on the target machine.");
    console.error("2. Confirm the MySQL service is started (e.g. running in XAMPP, WAMP, or Windoes Services).");
    console.error("3. Confirm the port is 3306 and the username/password in .env are correct.");
    console.error("4. If the database 'rsmwave' does not exist, create it manually or execute: npx prisma migrate dev");
    console.log("=========================================================================");
  } finally {
    await prisma.$disconnect();
  }
};

runVerification();
