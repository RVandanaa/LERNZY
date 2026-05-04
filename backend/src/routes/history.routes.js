const express = require("express");
const { query } = require("express-validator");
const { getHistory } = require("../controllers/history.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  getHistory
);

module.exports = router;
