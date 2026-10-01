const { v2: cloudinary } = require("cloudinary");

const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Audit Cloudinary Configuration (masked for safety)
const maskedSecret = apiSecret
  ? `${apiSecret.slice(0, 4)}...${apiSecret.slice(-4)} (length: ${apiSecret.length})`
  : "UNDEFINED";

console.log("[Cloudinary Config Audit]", {
  cloud_name: cloudName || "UNDEFINED",
  api_key: apiKey ? `${apiKey.slice(0, 4)}... (length: ${apiKey.length})` : "UNDEFINED",
  api_secret: maskedSecret,
  hasLeadingOrTrailingSpaces: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME !== cloudName,
    api_key: process.env.CLOUDINARY_API_KEY !== apiKey,
    api_secret: process.env.CLOUDINARY_API_SECRET !== apiSecret,
  },
});

const assertCloudinary = () => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* in server/.env");
  }
};

/**
 * Resilient Promise-based Cloudinary Upload using stream.end(buffer) directly
 */
const uploadToCloudinary = (buffer, folder = "pixelforge_generations") =>
  new Promise((resolve, reject) => {
    try {
      assertCloudinary();
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        return reject(new Error("Invalid image buffer from generator"));
      }

      console.log("[CLOUDINARY] Upload starting... buffer size:", buffer.length);
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image", // Explicitly set resource_type
        },
        (error, result) => {
          if (error) {
            console.error("FULL CLOUDINARY ERROR:", JSON.stringify(error, null, 2));
            const err = new Error(
              `Cloudinary Upload Failed: ${error.message || JSON.stringify(error)}`
            );
            err.statusCode = error.http_code || 403;
            err.raw = error;
            return reject(err);
          }
          console.log("[CLOUDINARY] Upload completed");
          console.log("[CLOUDINARY] Public ID:", result.public_id);
          console.log("[CLOUDINARY] Secure URL:", result.secure_url);
          resolve(result);
        }
      );

      // Use .end(buffer) directly instead of streamifier for better stability
      stream.end(buffer);
    } catch (err) {
      console.error("FULL CLOUDINARY ERROR (sync):", err);
      err.statusCode = err.statusCode || 500;
      reject(err);
    }
  });

const uploadImageBuffer = uploadToCloudinary;

const uploadImageUrl = async (url, folder = "pixelforge_generations") => {
  assertCloudinary();
  return cloudinary.uploader.upload(url, { folder, resource_type: "image" });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadImageBuffer,
  uploadImageUrl,
};


