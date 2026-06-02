const prisma = require("../config/prisma");
const generateBookingId = require("../utils/generateBookingId");

/**
 * Handle public customer booking creation request.
 * Enforces dynamic capacity limits (max 1000 slots per calendar date).
 * Removes all mock fallbacks.
 */
const createBooking = async (req, res) => {
  const { name, email, mobile, peopleCount, visitDate } = req.body;

  try {
    /* =========================
       VALIDATION
    ========================= */
    if (!name || !email || !mobile || !peopleCount || !visitDate) {
      console.warn("[BOOKING VALIDATION WARNING] Required parameters are missing.");
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const totalAmount = Number(peopleCount) * 650;
    const bookingId = generateBookingId();

    console.log(`[BOOKING INITIATION] Guest: ${name}, Count: ${peopleCount}, Date: ${visitDate}, Amount: ₹${totalAmount}`);

    // Create timezone-safe start and end times for the target visitDate (IST normalization)
    const targetDate = new Date(visitDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const proposedCount = Number(peopleCount);

    /* ===================================================
       TRANSACTION WITH CAPACITY CHECK & CREATION
       =================================================== */
    const booking = await prisma.$transaction(async (tx) => {
      // Sum peopleCount for PAID bookings on the selected visitDate
      const bookingsResult = await tx.booking.aggregate({
        _sum: {
          peopleCount: true,
        },
        where: {
          paymentStatus: "PAID",
          visitDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const totalSold = bookingsResult._sum.peopleCount || 0;

      if (totalSold + proposedCount > 1000) {
        throw new Error("CAPACITY_EXCEEDED");
      }

      return await tx.booking.create({
        data: {
          bookingId,
          name,
          email,
          mobile,
          peopleCount: proposedCount,
          visitDate: targetDate,
          totalAmount,
          paymentStatus: "PENDING"
        }
      });
    });

    console.log(`[DATABASE WRITE SUCCESS] Booking stored in MySQL. ID: ${booking.id}, Alphanumeric ID: ${booking.bookingId}`);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    if (error.message === "CAPACITY_EXCEEDED") {
      console.warn(`[BOOKING REJECTED] Capacity limit exceeded for visitDate: ${visitDate}`);
      return res.status(400).json({
        success: false,
        message: "Selected visit date is sold out or has insufficient capacity (1000 visitor slots limit)."
      });
    }

    console.error("[FATAL CRASH IN bookingController.js]:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = {
  createBooking
};