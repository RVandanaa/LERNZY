const jwt = require("jsonwebtoken");

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET or JWT_SECRET is missing in environment variables.");
  }

  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET or JWT_SECRET is missing in environment variables.");
  }

  return secret;
};

const signAccessToken = (payload = {}) => {
  return jwt.sign({ ...payload, typ: "access" }, getAccessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  });
};

const signRefreshToken = (payload = {}) => {
  return jwt.sign({ ...payload, typ: "refresh" }, getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
