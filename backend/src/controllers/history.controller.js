const ChatHistory = require("../models/ChatHistory.model");
const { successResponse } = require("../utils/response.utils");

const getHistory = async (req, res, next) => {
  try {
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor.trim() : "";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const query = { userId: req.user._id };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const sort = { _id: -1 };

    // Cursor mode is cheaper for large histories and avoids deep skip scans.
    if (cursor) {
      const history = await ChatHistory.find(query).sort(sort).limit(limit + 1).lean();
      const hasNextPage = history.length > limit;
      const pageItems = hasNextPage ? history.slice(0, limit) : history;
      const nextCursor = hasNextPage ? pageItems[pageItems.length - 1]?._id?.toString() : null;

      return successResponse(
        res,
        {
          history: pageItems,
          pagination: {
            mode: "cursor",
            limit,
            nextCursor,
            hasNextPage
          }
        },
        "History fetched"
      );
    }

    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      ChatHistory.find(query).sort(sort).skip(skip).limit(limit).lean(),
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
