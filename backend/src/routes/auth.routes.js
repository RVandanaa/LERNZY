const express = require("express");
const { body } = require("express-validator");
const { signup, login, refresh, logout, getMe, updateMe } = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validate.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

const strongPasswordRules = [
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must include a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must include a special character")
];

router.post(
  "/signup",
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    ...strongPasswordRules,
    body("preferredLanguage").optional().isIn(["en", "kn"]),
    body("educationLevel").optional().isIn(["beginner", "intermediate", "advanced"])
  ],
  validateRequest,
  signup
);

router.post("/login", authLimiter, [body("email").isEmail().normalizeEmail(), body("password").isString().notEmpty()], validateRequest, login);

router.post(
  "/refresh",
  authLimiter,
  [body("refreshToken").isString().trim().notEmpty()],
  validateRequest,
  refresh
);

router.post("/logout", logout);

router.get("/me", authMiddleware, getMe);

router.patch(
  "/me",
  authMiddleware,
  [
    body("name").optional().isString().trim().isLength({ min: 2, max: 80 }),
    body("preferredLanguage").optional().isIn(["en", "kn"]),
    body("educationLevel").optional().isIn(["beginner", "intermediate", "advanced"])
  ],
  validateRequest,
  updateMe
);

module.exports = router;
