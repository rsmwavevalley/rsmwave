const express = require("express");

const router = express.Router();

const {

  createPaymentOrder,

  verifyPayment

} = require("../controllers/paymentController");



// CREATE ORDER

router.post("/create-order", createPaymentOrder);



// VERIFY PAYMENT

router.post("/verify-payment", verifyPayment);



module.exports = router;