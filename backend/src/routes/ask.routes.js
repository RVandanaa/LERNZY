const express = require("express");
const { body } = require("express-validator");
const { askQuestion } = require("../controllers/ask.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  [
    body("question")
      .isString()
      .trim()
      .isLength({ min: 3, max: 1200 })
      .withMessage("question is required"),
    body("language").optional().isIn(["en", "kn", "kannada"]),
    body("outputType").optional().isIn(["text", "voice", "sign-language"])
  ],
  validateRequest,
  askQuestion
);

module.exports = router;
