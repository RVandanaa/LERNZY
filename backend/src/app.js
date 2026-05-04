const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const askRoutes = require("./routes/ask.routes");
const historyRoutes = require("./routes/history.routes");
const errorHandler = require("./middleware/error.middleware");
const sanitizeRequest = require("./middleware/sanitize.middleware");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const { parseAllowedOrigins } = require("./utils/cors.utils");
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
    origin: allowedOrigins,
    credentials: allowedOrigins !== "*"
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

app.use("/api/auth", authRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/history", historyRoutes);

app.use(errorHandler);

module.exports = app;
