const express = require("express");
const router = express.Router();
const {
  verifyPin,
  getDashboardStats,
  getBookingsList,
  verifyTicket,
  checkinTicket,
  getCheckinLogs
} = require("../controllers/adminController");

const adminAuth = require("../middleware/auth");
const { validatePinAttempt, validateBookingIdPayload } = require("../middleware/validator");
const rateLimiter = require("../middleware/rateLimiter");

// 1. Strict rate limiting for administrative PIN passcode authentication attempts (max 5 per minute per IP)
const pinVerificationLimiter = rateLimiter({
  windowMs: 60000,
  max: 5,
  message: { success: false, message: "Too many verification attempts from this IP. Access blocked for 1 minute." }
});

// 2. Rate limiting for standard operational admin endpoints (max 120 per minute per IP)
const adminOperationalLimiter = rateLimiter({
  windowMs: 60000,
  max: 120,
  message: { success: false, message: "Too many operations requests. Please wait a moment." }
});

/* ==========================================
   ADMINISTRATOR ROUTING HOOKS
   ========================================== */

// 1. PIN verification gate (Rate-limited & format verified)
router.post("/verify-pin", pinVerificationLimiter, validatePinAttempt, verifyPin);

// 2. Operational dashboard management routes (Auth protected, rate-limited, & sanitized)
router.get("/dashboard", adminOperationalLimiter, adminAuth, getDashboardStats);

router.get("/bookings", adminOperationalLimiter, adminAuth, getBookingsList);

router.post("/verify-ticket", adminOperationalLimiter, adminAuth, validateBookingIdPayload, verifyTicket);

router.post("/checkin", adminOperationalLimiter, adminAuth, validateBookingIdPayload, checkinTicket);

router.get("/checkins", adminOperationalLimiter, adminAuth, getCheckinLogs);

module.exports = router;
