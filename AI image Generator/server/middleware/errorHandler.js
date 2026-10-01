const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const friendlyMessage = (err) => {
  const raw = err.message || "Server Error";

  if (
    err.name === "MongoServerSelectionError" ||
    raw.includes("SSL routines") ||
    raw.includes("tlsv1") ||
    raw.includes("ECONNREFUSED")
  ) {
    return "Cannot reach the database. Check MONGO_URI, Atlas Network Access (IP allowlist), and your internet connection.";
  }

  if (err.name === "ValidationError") {
    return Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  return raw;
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (err.name === "MongoServerSelectionError") {
    statusCode = 503;
  }

  res.status(statusCode).json({
    message: friendlyMessage(err),
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
