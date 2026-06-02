const express = require("express");
const router = express.Router();
const { createBooking } = require("../controllers/bookingController");
const { validateBookingCreation } = require("../middleware/validator");
const rateLimiter = require("../middleware/rateLimiter");

// Booking rate limiter: restrict to maximum 10 booking creation attempts per minute per IP
const bookingCreationLimit = rateLimiter({
  windowMs: 60000,
  max: 10,
  message: { success: false, message: "Too many reservation attempts from this IP. Please wait a minute and try again." }
});

/* =========================
   CREATE BOOKING
========================= */
router.post("/create", bookingCreationLimit, validateBookingCreation, createBooking);

module.exports = router;