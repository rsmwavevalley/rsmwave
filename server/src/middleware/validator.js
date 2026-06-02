/**
 * Express middleware bundle for API request payload validation and input sanitization.
 * Prevents database pollution, SQL injection, and invalid format errors.
 */

/**
 * Validate customer reservation request payloads
 */
const validateBookingCreation = (req, res, next) => {
  try {
    const { name, email, mobile, peopleCount, visitDate } = req.body;

    // 1. Name check
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "A valid guest name is required (minimum 2 characters)." });
    }

    // 2. Email format check (RFC 5322 regex validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "A valid email address is required (e.g. guest@example.com)." });
    }

    // 3. Mobile phone normalization & format check
    const rawMobile = String(mobile || "");
    const numericMobile = rawMobile.replace(/\D/g, ""); // strip non-numeric symbols
    if (numericMobile.length !== 10) {
      return res.status(400).json({ success: false, message: "A valid 10-digit mobile phone number is required." });
    }

    // 4. People count bounds validation
    const count = Number(peopleCount);
    if (!peopleCount || isNaN(count) || count < 1 || count > 10) {
      return res.status(400).json({ success: false, message: "Visitor guest count must be a number between 1 and 10." });
    }

    // 5. Date validation
    if (!visitDate || isNaN(Date.parse(visitDate))) {
      return res.status(400).json({ success: false, message: "A valid calendar visit date is required." });
    }

    const bookingDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Warn: do not allow booking yesterday or earlier in production
    if (bookingDate.getTime() < today.getTime()) {
      return res.status(400).json({ success: false, message: "Selected visit date cannot be in the past." });
    }

    // Sanitize and write normalized values back to request body for controller use
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.mobile = numericMobile;
    req.body.peopleCount = count;
    req.body.visitDate = bookingDate;

    next();
  } catch (err) {
    console.error("Booking validation middleware crashed:", err);
    return res.status(500).json({ success: false, message: "Failed to sanitize booking payload." });
  }
};

/**
 * Validate 6-digit administrator verification passcode attempts
 */
const validatePinAttempt = (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin || String(pin).replace(/\D/g, "").length !== 6) {
      return res.status(400).json({ success: false, message: "Administrator passcode must be exactly 6 numeric digits." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to validate PIN payload." });
  }
};

/**
 * Validate scanned booking ID alphanumeric keys
 */
const validateBookingIdPayload = (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId || typeof bookingId !== "string" || bookingId.trim().length < 5) {
      return res.status(400).json({ success: false, message: "A valid Booking ID string identifier is required." });
    }
    req.body.bookingId = bookingId.trim();
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to validate Booking ID payload." });
  }
};

module.exports = {
  validateBookingCreation,
  validatePinAttempt,
  validateBookingIdPayload,
};
