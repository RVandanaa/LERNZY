const parseAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "";

  if (!raw.trim()) {
    return ["http://localhost:19006", "http://localhost:8081", "http://localhost:3000"];
  }

  if (raw.trim() === "*") {
    return "*";
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

module.exports = {
  parseAllowedOrigins
};
