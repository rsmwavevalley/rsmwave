const prisma = require("../config/prisma");

/**
 * Retrieve remaining guest slots capacity for a targeted calendar date.
 * Counts all paid booking people Count and subtracts it from 1000.
 */
const getDateCapacity = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date query parameter is required." });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format. Expected YYYY-MM-DD." });
    }

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // TODO: Connect database connection pool. Calculates paid visitor sums for selected visitDate.
    const bookingsResult = await prisma.booking.aggregate({
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
    const totalCapacity = 1000; // standard water park operational daily capacity limit
    const remainingCapacity = Math.max(0, totalCapacity - totalSold);
    const soldOut = remainingCapacity <= 0;

    return res.status(200).json({
      totalCapacity,
      remainingCapacity,
      soldOut,
    });
  } catch (err) {
    console.error("Capacity query failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve date capacity parameters."
    });
  }
};

module.exports = {
  getDateCapacity,
};
