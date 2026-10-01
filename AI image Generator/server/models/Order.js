const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpayOrderId: { type: String, default: "", sparse: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true }, // paise (INR)
    currency: { type: String, default: "INR" },
    credits: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi_qr"],
      default: "razorpay",
    },
    upiRef: { type: String, default: "" }, // reference ID shown on QR receipt
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
