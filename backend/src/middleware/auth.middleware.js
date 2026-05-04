const User = require("../models/User.model");
const { verifyAccessToken } = require("../utils/jwt.utils");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Missing or invalid token.",
        data: null,
        error: { code: "UNAUTHORIZED" }
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (decoded.typ && decoded.typ !== "access") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid token type.",
        data: null,
        error: { code: "INVALID_TOKEN_TYPE" }
      });
    }

    const userId = decoded.userId || decoded.sub;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User no longer exists.",
        data: null,
        error: { code: "USER_MISSING" }
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Token is invalid or expired.",
      data: null,
      error: { code: "TOKEN_INVALID" }
    });
  }
};

module.exports = authMiddleware;
