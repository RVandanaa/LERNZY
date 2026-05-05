const requireEnv = (name) => {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`${name} is required in environment variables.`);
  }
  return value;
};

const validateEnvironment = () => {
  requireEnv("MONGODB_URI");

  const hasAccessSecret = Boolean(process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
  const hasRefreshSecret = Boolean(process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

  if (!hasAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET (or JWT_SECRET) is required.");
  }

  if (!hasRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET (or JWT_SECRET) is required.");
  }

  return true;
};

module.exports = {
  validateEnvironment
};
