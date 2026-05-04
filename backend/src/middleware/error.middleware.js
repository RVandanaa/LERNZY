const logger = require("../utils/logger");

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  logger.error("unhandled_error", {
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: {
      code: err.code || "INTERNAL_ERROR"
    }
  });
};

module.exports = errorHandler;
