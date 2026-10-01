const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    console.log(
      `[Auth] ${req.method} ${req.originalUrl} — Authorization header: ${header ? "present" : "MISSING"}`
    );

    if (!header || !header.startsWith("Bearer ")) {
      console.warn("[Auth] REJECTED — no Bearer token in Authorization header");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = header.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[Auth] Token decoded — userId: ${decoded.id}`);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.warn(`[Auth] REJECTED — user ${decoded.id} not found in DB`);
      return res.status(401).json({ message: "User not found" });
    }

    console.log(
      `[Auth] PASSED — user: ${user.name} (${user._id}), credits: ${user.credits}`
    );
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.warn("[Auth] REJECTED — token expired");
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }
    console.warn("[Auth] REJECTED — token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
