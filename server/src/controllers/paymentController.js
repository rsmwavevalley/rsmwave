const crypto = require("crypto");
const prisma = require("../config/prisma");
const razorpay = require("../config/razorpay");
const { generateTicket } = require("../services/ticketService");

// ==============================
// CREATE PAYMENT ORDER
// ==============================
const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    /* =========================
       QUERY PRISMA DATABASE
    ========================= */
    const booking = await prisma.booking.findUnique({
      where: {
        bookingId
      }
    });

    if (!booking) {
      console.warn(`[ORDER FAILED] Booking not found. ID: ${bookingId}`);
      return res.status(404).json({
        success: false,
        message: "Booking record not found"
      });
    }

    // 1. Double-payment Prevention
    if (booking.paymentStatus === "PAID") {
      console.warn(`[ORDER FAILED] Double billing blocked. Booking ${bookingId} is already PAID.`);
      return res.status(400).json({
        success: false,
        message: "This booking is already paid and completed"
      });
    }

    // 2. Expired visitDate protection
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visit = new Date(booking.visitDate);
    visit.setHours(0, 0, 0, 0);
    if (visit.getTime() < today.getTime()) {
      console.warn(`[ORDER FAILED] Booking expired. ID: ${bookingId}, Date: ${booking.visitDate}`);
      return res.status(400).json({
        success: false,
        message: "Selected visit date has expired. Cannot initiate payment."
      });
    }

    const options = {
      amount: Math.round(booking.totalAmount * 100), // in paise
      currency: "INR",
      receipt: booking.bookingId
    };

    /* =========================
       CREATE RAZORPAY ORDER
    ========================= */
    const order = await razorpay.orders.create(options);
    console.log(`[RAZORPAY ORDER SUCCESS] Order issued: ${order.id}`);

    return res.status(200).json({
      success: true,
      order,
      booking: {
        bookingId: booking.bookingId,
        name: booking.name,
        email: booking.email,
        mobile: booking.mobile,
        totalAmount: booking.totalAmount
      }
    });

  } catch (error) {
    console.error("[FATAL CRASH IN createPaymentOrder]:", error);
    return res.status(500).json({
      success: false,
      message: "Order creation failed"
    });
  }
};

// ==============================
// VERIFY PAYMENT
// ==============================
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Required payment verification parameters are missing."
      });
    }

    console.log(`[PAYMENT VERIFICATION INITIATED] Booking: ${bookingId}, Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);

    // Verify HMAC Payment signature strictly using HMAC SHA-256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.warn(`[SIGNATURE VERIFICATION FAILED] Corrupted signature for booking ${bookingId}`);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature"
      });
    }

    let updatedBooking;

    try {
      /* ===================================================
         TRANSACTION SAFETY & REPLAY PROTECTION & CAPACITY
         =================================================== */
      await prisma.$transaction(async (tx) => {
        // Enforce transaction isolation
        const booking = await tx.booking.findUnique({
          where: { bookingId }
        });

        if (!booking) {
          throw new Error("BOOKING_NOT_FOUND");
        }

        if (booking.paymentStatus === "PAID") {
          throw new Error("ALREADY_PAID");
        }

        // Enforce transaction-safe capacity validation before marking as PAID
        const targetDate = new Date(booking.visitDate);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookingsResult = await tx.booking.aggregate({
          _sum: { peopleCount: true },
          where: {
            paymentStatus: "PAID",
            visitDate: { gte: startOfDay, lte: endOfDay }
          }
        });

        const totalSold = bookingsResult._sum.peopleCount || 0;
        const proposedCount = booking.peopleCount;

        if (totalSold + proposedCount > 1000) {
          throw new Error("CAPACITY_EXCEEDED");
        }

        // Update status
        await tx.booking.update({
          where: { bookingId },
          data: {
            paymentStatus: "PAID"
          }
        });

        // Log payment with unique payment ID constraint to block reuse
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "PAID",
            paidAt: new Date()
          }
        });
      }, {
        isolationLevel: "Serializable"
      });

      updatedBooking = await prisma.booking.findUnique({
        where: { bookingId }
      });

      console.log(`[DATABASE VERIFICATION SUCCESS] Payment logged and status set to PAID. ID: ${updatedBooking.id}`);
    } catch (dbError) {
      if (dbError.message === "BOOKING_NOT_FOUND") {
        return res.status(404).json({ success: false, message: "Booking record missing" });
      }
      if (dbError.message === "ALREADY_PAID") {
        return res.status(400).json({ success: false, message: "This booking has already been processed and marked PAID." });
      }
      if (dbError.message === "CAPACITY_EXCEEDED") {
        console.warn(`[PAYMENT VERIFICATION REJECTED] Capacity limit reached. Booking: ${bookingId}`);
        return res.status(400).json({
          success: false,
          message: "Payment verification failed: Selected visit date capacity exceeded."
        });
      }
      if (dbError.code === "P2002") {
        console.warn(`[REPLAY ATTACK BLOCKED] Duplicate payment token detected: ${razorpay_payment_id}`);
        return res.status(400).json({
          success: false,
          message: "Duplicate payment reference. Replay attack blocked."
        });
      }
      throw dbError; // Bubble up other exceptions
    }

    /* =========================
       GENERATE PDF E-TICKET
    ========================= */
    await generateTicket(updatedBooking);
    const relativeTicketUrl = `/tickets/${updatedBooking.bookingId}.pdf`;

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      ticket: relativeTicketUrl
    });

  } catch (error) {
    console.error("[FATAL CRASH IN verifyPayment]:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment
};