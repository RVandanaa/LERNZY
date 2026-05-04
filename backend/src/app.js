const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const askRoutes = require("./routes/ask.routes");
const historyRoutes = require("./routes/history.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.MAX_REQUESTS_PER_MINUTE || 100),
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*"
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(limiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Tutor backend is healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/history", historyRoutes);

app.use(errorHandler);

module.exports = app;
