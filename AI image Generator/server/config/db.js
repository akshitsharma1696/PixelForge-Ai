const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in .env");
  }

  // family: 4 forces IPv4 — avoids common Windows TLS/Atlas handshake failures
  await mongoose.connect(uri, {
    family: 4,
    serverSelectionTimeoutMS: 15000,
  });

  console.log("MongoDB connected");
};

module.exports = connectDB;
