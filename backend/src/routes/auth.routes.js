const express = require("express");
const { body } = require("express-validator");
const { signup, login } = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("preferredLanguage").optional().isIn(["en", "kn"]),
    body("educationLevel").optional().isIn(["beginner", "intermediate", "advanced"])
  ],
  validateRequest,
  signup
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isString().notEmpty()],
  validateRequest,
  login
);

module.exports = router;
