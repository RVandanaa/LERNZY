const User = require("../models/User.model");
const { signToken } = require("../utils/jwt.utils");
const { successResponse, errorResponse } = require("../utils/response.utils");

const signup = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage, educationLevel } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, "Email already exists", 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      preferredLanguage,
      educationLevel
    });

    const token = signToken({ userId: user._id });

    return successResponse(
      res,
      {
        token,
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

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = signToken({ userId: user._id });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          educationLevel: user.educationLevel
        }
      },
      "Login successful"
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login
};
