const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        details: result.array().map((item) => ({
          field: item.path,
          message: item.msg
        }))
      }
    });
  }

  return next();
};

module.exports = validateRequest;
