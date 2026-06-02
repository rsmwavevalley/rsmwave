const express = require("express");
const router = express.Router();
const { getPricingConfig } = require("../controllers/configController");

// Retrieve core pricing configs
router.get("/pricing", getPricingConfig);

module.exports = router;
