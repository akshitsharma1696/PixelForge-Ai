require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { razorpayWebhook } = require("./controllers/billingController");

const authRoutes = require("./routes/authRoutes");
const generateRoutes = require("./routes/generateRoutes");
const imageRoutes = require("./routes/imageRoutes");
const billingRoutes = require("./routes/billingRoutes");
const socialRoutes = require("./routes/socialRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Razorpay webhook needs raw body for signature verification
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "PixelForge AI" });
});

app.use("/api/auth", authRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/payments", billingRoutes);
app.use("/api/social", socialRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`PixelForge API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    if (
      error.message.includes("whitelist") ||
      error.message.includes("IP") ||
      error.name === "MongoServerSelectionError"
    ) {
      console.error(
        "\n→ Fix: MongoDB Atlas → Network Access → Add Current IP Address\n  (or temporarily allow 0.0.0.0/0 for local development)\n"
      );
    }
    process.exit(1);
  }
};

start();
