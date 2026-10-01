const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getPlans,
  getPaymentConfig,
  createOrder,
  createUpiOrder,
  verifyPayment,
  markPaymentFailed,
} = require("../controllers/billingController");

const router = express.Router();

router.get("/plans", getPlans);
router.get("/config", getPaymentConfig); // public — returns UPI ID only
router.post("/order", protect, createOrder);
router.post("/upi-order", protect, createUpiOrder);
router.post("/verify", protect, verifyPayment);
router.post("/payment-failed", protect, markPaymentFailed);

module.exports = router;
