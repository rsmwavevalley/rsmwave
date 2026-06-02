const express = require("express");
const router = Router = express.Router();
const { getDateCapacity } = require("../controllers/capacityController");

// Query date slots capacity limits
router.get("/", getDateCapacity);

module.exports = router;
