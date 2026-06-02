const express = require("express");
const router = express.Router();
const { getTicketStatus } = require("../controllers/ticketController");

// General test route
router.get("/", (req, res) => {
  res.send("Ticket Route Working");
});

// Query compiler status of E-Ticket PDF
router.get("/status/:bookingId", getTicketStatus);

module.exports = router;