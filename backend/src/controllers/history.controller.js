const ChatHistory = require("../models/ChatHistory.model");
const { successResponse } = require("../utils/response.utils");

const getHistory = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    const [history, total] = await Promise.all([
      ChatHistory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ChatHistory.countDocuments(query)
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return successResponse(
      res,
      {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      "History fetched"
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHistory
};
