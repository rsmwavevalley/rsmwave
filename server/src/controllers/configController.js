/**
 * Retrieve dynamic ticket pricing configuration rules.
 * Matches client services standard defaults exactly.
 */
const getPricingConfig = async (req, res) => {
  try {
    // TODO: Connect this to a backend database table if pricing needs to be dynamically adjusted by administrators.
    // Standard system V1 operational pricing is hardcoded below.
    return res.status(200).json({
      ticketPrice: 650,
      adultPrice: 650,
      childPrice: 400,
      weekendPrice: 750,
      holidayPrice: 800,
    });
  } catch (err) {
    console.error("Config pricing query failed:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve pricing configurations" });
  }
};

module.exports = {
  getPricingConfig,
};
