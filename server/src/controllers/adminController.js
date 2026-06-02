const crypto = require("crypto");
const prisma = require("../config/prisma");

/**
 * Helper to calculate IST (UTC+5:30) date boundaries in UTC for database queries.
 */
const getISTDateRange = () => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (3600000 * 5.5));
  
  const startOfToday = new Date(istTime);
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(istTime);
  endOfToday.setHours(23, 59, 59, 999);

  // Convert back to absolute UTC dates for database queries
  const offsetMs = 5.5 * 3600000;
  const utcStart = new Date(startOfToday.getTime() - offsetMs);
  const utcEnd = new Date(endOfToday.getTime() - offsetMs);

  return { startOfToday: utcStart, endOfToday: utcEnd };
};

/**
 * Validate 6-digit administrator passcode
 * POST /api/admin/verify-pin
 */
const verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    
    // Hash-based admin PIN passcode validation using built-in crypto
    const adminPinHash = process.env.ADMIN_PIN_HASH || crypto.createHash("sha256").update("458921").digest("hex");
    const inputHash = crypto.createHash("sha256").update(String(pin)).digest("hex");
    
    if (inputHash === adminPinHash) {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ success: false, message: "Invalid Admin PIN" });
  } catch (err) {
    console.error("PIN check failed:", err);
    return res.status(500).json({ success: false, message: "Verification execution failed" });
  }
};

/**
 * Aggregate today's metrics KPIs using Prisma database (with Timezone alignment)
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const { startOfToday, endOfToday } = getISTDateRange();

    const todayBookings = await prisma.booking.count({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const visitorsResult = await prisma.booking.aggregate({
      _sum: {
        peopleCount: true,
      },
      where: {
        paymentStatus: "PAID", // only count paid visitors
        visitDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });
    const todayVisitors = visitorsResult._sum.peopleCount || 0;

    const revenueResult = await prisma.booking.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        paymentStatus: "PAID",
        visitDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });
    const todayRevenue = revenueResult._sum.totalAmount || 0;

    const verifiedTicketsToday = await prisma.booking.count({
      where: {
        isCheckedIn: true,
        checkedInAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    return res.status(200).json({
      todayBookings,
      todayVisitors,
      todayRevenue,
      verifiedTicketsToday,
    });
  } catch (err) {
    console.error("[FATAL CRASH IN GET /api/admin/dashboard]:", err);
    return res.status(500).json({
      success: false,
      message: "Could not load dashboard statistics. Check backend API connection."
    });
  }
};

/**
 * Retrieve list of all reservations from database
 * GET /api/admin/bookings
 */
const getBookingsList = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        id: "desc",
      },
    });
    
    return res.status(200).json(bookings);
  } catch (err) {
    console.error("[DATABASE ERROR] getBookingsList failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve bookings." });
  }
};

/**
 * Validate ticket QR scans at the entry gate using Prisma (Timezone Shift Midnight Glitch resolved)
 * POST /api/admin/verify-ticket
 */
const verifyTicket = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Structured Audit Log properties
    const logData = {
      event: "TICKET_VERIFICATION_ATTEMPT",
      bookingId,
      timestamp: new Date().toISOString(),
      operator: req.headers["x-admin-pin"] ? "ADMIN_API_CLIENT" : "GATE_STAFF_NODE",
      ip: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1"
    };

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
    });

    if (!booking) {
      logData.result = "NOT_FOUND";
      logData.message = "Ticket Not Found";
      console.log(JSON.stringify(logData));

      return res.status(200).json({
        bookingId,
        verificationStatus: "NOT_FOUND",
        verificationState: "NOT_FOUND",
        message: "Ticket Not Found",
        booking: null,
        name: "Missing Record",
        mobile: "",
        visitDate: new Date().toISOString(),
        guestCount: 0,
        amount: 0,
        paymentStatus: "UNPAID"
      });
    }

    // Convert current UTC time to IST date string (YYYY-MM-DD)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));
    const istDateString = istTime.toISOString().split("T")[0];

    // Convert booking visitDate to IST date string (YYYY-MM-DD)
    const visitTime = new Date(booking.visitDate).getTime() + (new Date(booking.visitDate).getTimezoneOffset() * 60000);
    const visitIST = new Date(visitTime + (3600000 * 5.5));
    const visitDateString = visitIST.toISOString().split("T")[0];

    // Evaluate Priorities Mutually Exclusive State Machine
    let verificationState = "VALID_FOR_ENTRY";
    let message = "Valid For Entry";

    // Handle virtual or dynamic bookingStatus
    const bookingStatus = booking.bookingStatus || "CONFIRMED";

    if (booking.paymentStatus !== "PAID") {
      verificationState = "PAYMENT_PENDING";
      message = "Payment Not Completed";
    } else if (bookingStatus === "CANCELLED") {
      verificationState = "CANCELLED";
      message = "Booking Cancelled";
    } else if (booking.isCheckedIn) {
      verificationState = "ALREADY_USED";
      message = "Ticket Already Used";
    } else if (visitDateString > istDateString) {
      verificationState = "FUTURE_VISIT_DATE";
      message = "Valid Ticket - Visit Date Not Reached";
    } else if (visitDateString < istDateString && !booking.isCheckedIn) {
      verificationState = "EXPIRED";
      message = "Visit Date Expired";
    }

    // Map backwards-compatible verificationStatus to prevent UI rendering crashes
    let verificationStatus = "VALID";
    if (verificationState === "PAYMENT_PENDING") verificationStatus = "UNPAID";
    else if (verificationState === "CANCELLED") verificationStatus = "NOT_FOUND";
    else if (verificationState === "ALREADY_USED") verificationStatus = "USED";
    else if (verificationState === "FUTURE_VISIT_DATE") verificationStatus = "NOT_VALID_YET";
    else if (verificationState === "EXPIRED") verificationStatus = "EXPIRED";

    // Commit Structured Audit Log
    logData.result = verificationState;
    logData.message = message;
    console.log(JSON.stringify(logData));

    return res.status(200).json({
      bookingId: booking.bookingId,
      name: booking.name,
      mobile: booking.mobile,
      visitDate: booking.visitDate,
      guestCount: booking.peopleCount,
      amount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      verificationStatus, // backwards-compatible badge value
      verificationState,  // new state machine key
      message,            // backend status description (single source of truth)
      booking             // complete database booking payload
    });
  } catch (err) {
    console.error("Ticket verification lookup failed:", err);
    return res.status(500).json({ success: false, message: "Verification lookup query failed" });
  }
};

/**
 * Log check-in entry to mark ticket as USED in database with transaction safety
 * POST /api/admin/checkin
 */
const checkinTicket = async (req, res) => {
  try {
    const { bookingId } = req.body;

    try {
      /* ===================================================
         TRANSACTION SAFETY & DOUBLE CHECK-IN PROTECTION
         =================================================== */
      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { bookingId },
        });

        if (!booking) {
          throw new Error("BOOKING_NOT_FOUND");
        }

        if (booking.paymentStatus !== "PAID") {
          throw new Error("UNPAID_TICKET");
        }

        if (booking.isCheckedIn) {
          throw new Error("ALREADY_CHECKED_IN");
        }

        // Commit check-in update inside MySQL database
        await tx.booking.update({
          where: { bookingId },
          data: {
            isCheckedIn: true,
            checkedInAt: new Date(),
          },
        });
      });
    } catch (dbError) {
      if (dbError.message === "BOOKING_NOT_FOUND") {
        return res.status(404).json({ success: false, message: "Booking record missing" });
      }
      if (dbError.message === "UNPAID_TICKET") {
        return res.status(400).json({ success: false, message: "Cannot check in an unpaid ticket" });
      }
      if (dbError.message === "ALREADY_CHECKED_IN") {
        return res.status(400).json({ success: false, message: "Ticket already checked-in and used" });
      }
      throw dbError; // Bubble up unexpected errors
    }

    return res.status(200).json({ success: true, status: "USED" });
  } catch (err) {
    console.error("Admittance check-in log failed:", err);
    return res.status(500).json({ success: false, message: "Check-in logging execution failed" });
  }
};

/**
 * Retrieve check-in entries audit roster from database
 * GET /api/admin/checkins
 */
const getCheckinLogs = async (req, res) => {
  try {
    const checkins = await prisma.booking.findMany({
      where: { isCheckedIn: true },
      orderBy: { checkedInAt: "desc" },
    });

    const logs = checkins.map((b) => ({
      bookingId: b.bookingId,
      name: b.name,
      mobile: b.mobile,
      guestCount: b.peopleCount,
      amount: b.totalAmount,
      checkInTime: b.checkedInAt,
      operator: "GATE_STAFF_NODE",
    }));

    return res.status(200).json(logs);
  } catch (err) {
    console.error("[DATABASE ERROR] getCheckinLogs failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve check-in logs." });
  }
};

module.exports = {
  verifyPin,
  getDashboardStats,
  getBookingsList,
  verifyTicket,
  checkinTicket,
  getCheckinLogs,
};
