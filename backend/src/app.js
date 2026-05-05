const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const askRoutes = require("./routes/ask.routes");
const historyRoutes = require("./routes/history.routes");
const errorHandler = require("./middleware/error.middleware");
const sanitizeRequest = require("./middleware/sanitize.middleware");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const { parseAllowedOrigins } = require("./utils/cors.utils");
const { getRedisStatus } = require("./services/cache.service");
const logger = require("./utils/logger");

const app = express();

const allowedOrigins = parseAllowedOrigins();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const corsError = new Error("CORS origin denied");
      corsError.statusCode = 403;
      corsError.code = "CORS_DENIED";
      return callback(corsError);
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.use(sanitizeRequest);

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: {
      write: (msg) => logger.http(msg.trim())
    }
  })
);

app.use(globalLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Tutor backend is healthy",
    data: null,
    error: null
  });
});

app.get("/api/health/ready", (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  const redisStatus = getRedisStatus();
  const redisReady = redisStatus === "ready" || redisStatus === "connect" || redisStatus === "disabled";
  const ready = mongoReady && redisReady;

  return res.status(ready ? 200 : 503).json({
    success: ready,
    message: ready ? "Backend is ready" : "Backend is not ready",
    data: {
      services: {
        mongo: mongoReady ? "ready" : "not_ready",
        redis: redisStatus
      }
    },
    error: ready ? null : { code: "SERVICE_NOT_READY" }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/history", historyRoutes);

app.use(errorHandler);

module.exports = app;
