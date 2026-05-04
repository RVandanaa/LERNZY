require("dotenv").config({ override: true });

const connectDatabase = require("../config/database");
const User = require("../models/User.model");

const run = async () => {
  try {
    await connectDatabase();

    const email = "demo@aitutor.com";
    const existing = await User.findOne({ email });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log("Demo user already exists.");
      process.exit(0);
    }

    await User.create({
      name: "Demo User",
      email,
      password: "Password123!",
      preferredLanguage: "en",
      educationLevel: "beginner"
    });

    // eslint-disable-next-line no-console
    console.log("Demo user created: demo@aitutor.com / Password123!");
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

run();
