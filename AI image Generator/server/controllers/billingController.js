const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const User = require("../models/User");

/** Amounts in paise (INR) for Razorpay India */
const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 100,
    amount: 49900,
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 350,
    amount: 99900,
  },
  studio: {
    id: "studio",
    name: "Studio",
    credits: 1000,
    amount: 249900,
  },
};

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw Object.assign(
      new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."),
      { statusCode: 500 }
    );
  }

  return new Razorpay({ key_id, key_secret });
};

const creditUserForOrder = async (order) => {
  if (!order || order.status === "completed") return false;

  order.status = "completed";
  await order.save();

  await User.findByIdAndUpdate(order.user, {
    $inc: { credits: order.credits },
  });

  return true;
};

exports.getPlans = (req, res) => {
  res.json({
    currency: "INR",
    plans: Object.values(PLANS).map((p) => ({
      id: p.id,
      name: p.name,
      credits: p.credits,
      price: p.amount / 100,
      amount: p.amount,
      currency: "INR",
      highlighted: p.id === "pro",
      features:
        p.id === "starter"
          ? ["100 credits", "Text-to-image", "Community gallery"]
          : p.id === "pro"
            ? [
                "350 credits",
                "Image-to-image & variations",
                "Upscale + BG remove",
                "Priority queue",
              ]
            : [
                "1000 credits",
                "All Pro tools",
                "Commercial license",
                "Team folders",
              ],
    })),
  });
};

/** Return safe public payment configuration (UPI ID) */
exports.getPaymentConfig = (req, res) => {
  const upiId = process.env.UPI_ID || "";
  console.log("[QR PAYMENT] getPaymentConfig called, UPI_ID configured:", Boolean(upiId));
  res.json({ upiId });
};

/** Create a PENDING UPI QR order record — NO credits awarded yet */
exports.createUpiOrder = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      res.status(400);
      throw new Error("Invalid plan");
    }

    const upiId = process.env.UPI_ID;
    if (!upiId) {
      res.status(500);
      throw new Error("UPI ID is not configured on the server. Set UPI_ID in .env");
    }

    // Generate a short human-readable reference like PIXEL-A1B2C3
    const upiRef = "PIXEL-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const order = await Order.create({
      user: req.user._id,
      razorpayOrderId: "",
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      currency: "INR",
      credits: plan.credits,
      paymentMethod: "upi_qr",
      upiRef,
      status: "pending",
    });

    const amountInRupees = plan.amount / 100;
    // UPI deep-link URI (encodes amount so UPI apps pre-fill it)
    const upiUri =
      `upi://pay?pa=${encodeURIComponent(upiId)}` +
      `&pn=PixelForge` +
      `&am=${amountInRupees}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(`PixelForge ${plan.name} - ${upiRef}`)}`;

    console.log("[QR PAYMENT] Package selected:", plan.name);
    console.log("[QR PAYMENT] Server-calculated amount (INR):", amountInRupees);
    console.log("[QR PAYMENT] Credits:", plan.credits);
    console.log("[QR PAYMENT] Payment reference:", upiRef);
    console.log("[QR PAYMENT] Transaction created:", order._id);

    res.status(201).json({
      orderId: order._id,
      upiRef,
      upiId,
      upiUri,
      amount: amountInRupees,
      credits: plan.credits,
      planId: plan.id,
      planName: plan.name,
      status: "pending",
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/** Create a Razorpay order for a credit pack */
exports.createOrder = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      res.status(400);
      throw new Error("Invalid plan");
    }

    if (!Number.isInteger(plan.amount) || plan.amount <= 0) {
      res.status(400);
      throw new Error("Invalid amount for selected plan");
    }

    const razorpay = getRazorpay();

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: plan.amount,
        currency: "INR",
        receipt: `pf_${req.user._id.toString().slice(-8)}_${Date.now()}`,
        notes: {
          userId: String(req.user._id),
          planId: plan.id,
          credits: String(plan.credits),
        },
      });
    } catch (apiError) {
      res.status(502);
      throw new Error(
        apiError?.error?.description ||
          apiError?.message ||
          "Failed to create Razorpay order"
      );
    }

    await Order.create({
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      currency: "INR",
      credits: plan.credits,
      status: "pending",
    });

    res.status(201).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planId: plan.id,
      planName: plan.name,
      credits: plan.credits,
      prefill: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/** Verify checkout payment signature, then credit the user */
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error("Missing Razorpay payment response fields");
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(500);
      throw new Error("Razorpay is not configured on the server");
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(String(razorpay_signature), "utf8");
    const valid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!valid) {
      const failed = await Order.findOne({
        razorpayOrderId: razorpay_order_id,
        user: req.user._id,
      });
      if (failed && failed.status === "pending") {
        failed.status = "failed";
        await failed.save();
      }
      res.status(400);
      throw new Error("Invalid payment signature");
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    if (order.status === "completed") {
      const user = await User.findById(req.user._id);
      return res.json({
        success: true,
        alreadyProcessed: true,
        credits: user.credits,
        added: 0,
        orderId: order.razorpayOrderId,
      });
    }

    await creditUserForOrder(order);
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      credits: user.credits,
      added: order.credits,
      orderId: order.razorpayOrderId,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    if (error.code === "ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH") {
      res.status(400);
      return next(new Error("Invalid payment signature"));
    }
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/** Mark order failed / cancelled from the client (no credits granted) */
exports.markPaymentFailed = async (req, res, next) => {
  try {
    const { razorpay_order_id, reason } = req.body;
    if (!razorpay_order_id) {
      res.status(400);
      throw new Error("razorpay_order_id is required");
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.status === "pending") {
      order.status = "failed";
      await order.save();
    }

    res.json({
      success: false,
      status: order.status,
      message: reason || "Payment cancelled or failed",
    });
  } catch (error) {
    next(error);
  }
};

/** Razorpay webhook — verify signature before crediting */
exports.razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ message: "Missing webhook signature" });
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    let valid = false;
    try {
      valid = crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
      );
    } catch {
      valid = false;
    }

    if (!valid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody);

    if (
      event.event === "payment.captured" ||
      event.event === "order.paid"
    ) {
      const paymentEntity =
        event.payload?.payment?.entity || event.payload?.order?.entity;
      const orderId =
        paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = event.payload?.payment?.entity?.id || "";

      if (orderId) {
        const order = await Order.findOne({ razorpayOrderId: orderId });
        if (order && order.status !== "completed") {
          if (paymentId) order.razorpayPaymentId = paymentId;
          await creditUserForOrder(order);
        }
      }
    }

    if (event.event === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        const order = await Order.findOne({ razorpayOrderId: orderId });
        if (order && order.status === "pending") {
          order.status = "failed";
          await order.save();
        }
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error.message);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
