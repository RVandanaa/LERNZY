require("dotenv").config({ override: true });

const app = require("./app");
const connectDatabase = require("./config/database");
const { initRedis } = require("./services/cache.service");
const logger = require("./utils/logger");

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await connectDatabase();
    await initRedis();

    const server = app.listen(PORT, () => {
      logger.info("server_started", { port: PORT });
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use. Update PORT in .env and restart.`);
      } else {
        logger.error("Server failed to bind", { message: error.message });
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start backend", { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
