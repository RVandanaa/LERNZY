const parseAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "";
  const devDefaults = ["http://localhost:19006", "http://localhost:8081", "http://localhost:3000"];

  if (!raw.trim()) {
    return devDefaults;
  }

  if (raw.trim() === "*") {
    // Never allow wildcard in backend CORS policy.
    return devDefaults;
  }

  const parsed = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length ? parsed : devDefaults;
};

module.exports = {
  parseAllowedOrigins
};
