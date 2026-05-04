const ChatHistory = require("../models/ChatHistory.model");
const { successResponse } = require("../utils/response.utils");

const getHistory = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const history = await ChatHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    return successResponse(res, { history }, "History fetched");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHistory
};
