const User = require("../models/User.model");
const { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } = require("../utils/jwt.utils");
const { hashToken } = require("../utils/crypto.utils");
const { successResponse, errorResponse } = require("../utils/response.utils");
const logger = require("../utils/logger");

const issueAuthTokens = async (user) => {
  const accessToken = signAccessToken({ userId: user._id.toString() });
  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    tv: user.refreshTokenVersion || 0
  });

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage, educationLevel } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, "Email already exists", 409, { code: "EMAIL_EXISTS" }, null);
    }

    const user = await User.create({
      name,
      email,
      password,
      preferredLanguage,
      educationLevel,
      refreshTokenVersion: 0
    });

    const tokens = await issueAuthTokens(user);

    logger.info("user_signed_up", { userId: user._id.toString() });

    return successResponse(
      res,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        // Backwards-compat for older frontends expecting `token`
        token: tokens.accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          educationLevel: user.educationLevel
        }
      },
      "Signup successful",
      201
    );
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +refreshTokenHash");
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401, { code: "AUTH_INVALID" }, null);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401, { code: "AUTH_INVALID" }, null);
    }

    const tokens = await issueAuthTokens(user);

    logger.info("user_logged_in", { userId: user._id.toString() });

    return successResponse(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        educationLevel: user.educationLevel
      }
    });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "refreshToken is required", 400, { code: "REFRESH_MISSING" }, null);
    }

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return errorResponse(res, "Invalid refresh token", 401, { code: "REFRESH_INVALID" }, null);
    }

    if (decoded.typ !== "refresh") {
      return errorResponse(res, "Invalid refresh token type", 401, { code: "REFRESH_BAD_TYPE" }, null);
    }

    const user = await User.findById(decoded.userId).select("+refreshTokenHash");
    if (!user) {
      return errorResponse(res, "Unauthorized", 401, { code: "USER_MISSING" }, null);
    }

    const incomingHash = hashToken(refreshToken);
    if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      return errorResponse(res, "Unauthorized", 401, { code: "REFRESH_MISMATCH" }, null);
    }

    if (decoded.tv !== undefined && decoded.tv !== (user.refreshTokenVersion || 0)) {
      return errorResponse(res, "Unauthorized", 401, { code: "REFRESH_VERSION_MISMATCH" }, null);
    }

    const accessToken = signAccessToken({ userId: user._id.toString() });
    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
      tv: user.refreshTokenVersion || 0
    });

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    return successResponse(res, {
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return errorResponse(res, "Missing bearer token", 401, { code: "TOKEN_MISSING" }, null);
    }

    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return errorResponse(res, "Invalid token", 401, { code: "TOKEN_INVALID" }, null);
    }

    if (decoded.typ && decoded.typ !== "access") {
      return errorResponse(res, "Invalid token type", 401, { code: "TOKEN_INVALID_TYPE" }, null);
    }

    const user = await User.findById(decoded.userId || decoded.sub).select("+refreshTokenHash");
    if (user) {
      user.refreshTokenHash = undefined;
      user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
      await user.save();
    }

    logger.info("user_logged_out", { userId: decoded.userId?.toString?.() });

    return successResponse(res, null, "Logged out");
  } catch (error) {
    return next(error);
  }
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  preferredLanguage: user.preferredLanguage,
  educationLevel: user.educationLevel
});

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, "User not found", 404, { code: "USER_MISSING" }, null);
    }

    return successResponse(res, { user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, preferredLanguage, educationLevel } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, "User not found", 404, { code: "USER_MISSING" }, null);
    }

    if (typeof name === "string" && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (preferredLanguage) {
      user.preferredLanguage = preferredLanguage;
    }
    if (educationLevel) {
      user.educationLevel = educationLevel;
    }

    await user.save();

    return successResponse(res, { user: serializeUser(user) }, "Profile updated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
  getMe,
  updateMe
};
