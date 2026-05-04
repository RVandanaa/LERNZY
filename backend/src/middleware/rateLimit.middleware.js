const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.MAX_REQUESTS_PER_MINUTE || 120),
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
    data: null,
    error: { code: "RATE_LIMIT_AUTH" }
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};
