const successResponse = (res, data, message = "Success", statusCode = 200, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
    ...extra
  });
};

const errorResponse = (res, message = "Something went wrong", statusCode = 500, error = null, data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
    error: error || { code: "ERROR" }
  });
};

module.exports = {
  successResponse,
  errorResponse
};
