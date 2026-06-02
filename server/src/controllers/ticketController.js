const prisma = require("../config/prisma");

/**
 * Retrieve compiler status of dynamic PDF ticket.
 * Allows frontend to poll and determine when PDF creation finishes.
 */
const getTicketStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // TODO: Verify target database is connected.
    const booking = await prisma.booking.findUnique({
      where: { bookingId }
    });

    if (!booking) {
      return res.status(200).json({ ready: false, message: "Booking record missing." });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { bookingId: booking.id }
    });

    return res.status(200).json({
      ready: !!ticket,
      ticketUrl: ticket ? ticket.ticketUrl : null
    });
  } catch (err) {
    console.error("Ticket status query failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ticket generation status."
    });
  }
};

module.exports = {
  getTicketStatus
};
