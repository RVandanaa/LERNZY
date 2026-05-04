const sanitize = require("express-mongo-sanitize");

/**
 * Removes keys that contain prohibited characters from req.body / query / params.
 */
const sanitizeRequest = sanitize({
  replaceWith: "_"
});

module.exports = sanitizeRequest;
