require("dotenv").config({ override: true });

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await connectDatabase();
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        // eslint-disable-next-line no-console
        console.error(`Port ${PORT} is already in use. Update PORT in .env and restart.`);
      } else {
        // eslint-disable-next-line no-console
        console.error("Server failed to bind:", error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

startServer();
