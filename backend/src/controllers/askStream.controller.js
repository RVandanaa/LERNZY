const ChatHistory = require("../models/ChatHistory.model");
const { streamTutorResponse } = require("../services/ai.service");
const { normalizeLanguage, maybeTranslate } = require("../services/translation.service");
const logger = require("../utils/logger");

const sendSse = (res, event, payload) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

/**
 * Streams AI tokens as SSE. Final event includes assembled explanation text.
 *
 * Frontend usage (recommended): fetch(...) with ReadableStream, not browser EventSource.
 */
const streamAskQuestion = async (req, res, next) => {
  try {
    const { question, language = "en", outputType = "text" } = req.body;
    const normalizedLanguage = normalizeLanguage(language);
    const level = req.user.educationLevel || "beginner";

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // Express + proxies: disable buffering where possible (nginx)
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    let assembled = "";

    await streamTutorResponse({
      question,
      level,
      language: normalizedLanguage,
      onToken: (token) => {
        assembled += token;
        sendSse(res, "token", { token });
      }
    });

    const translated = await maybeTranslate({
      text: assembled,
      language: normalizedLanguage
    });

    // Persistence is intentionally simplified for streaming MVP (final text only).
    try {
      await ChatHistory.create({
        userId: req.user._id,
        question,
        responseText: translated,
        language: normalizedLanguage,
        outputType,
        modelMeta: { provider: "stream", model: process.env.GEMINI_MODEL || process.env.OLLAMA_MODEL }
      });
    } catch (error) {
      logger.warn("history_save_failed_stream", { message: error.message });
    }

    sendSse(res, "done", {
      explanationStream: assembled,
      explanation: translated,
      language: normalizedLanguage,
      outputType,
      translationNote:
        normalizedLanguage === "kn"
          ? "For Kannada fidelity, configure GOOGLE_TRANSLATE_API_KEY and call /api/ask for richer pipeline."
          : null
    });

    res.end();
  } catch (error) {
    logger.error("stream_ask_failed", { message: error.message, stack: error.stack });

    try {
      sendSse(res, "error", { message: error.message || "Stream failed" });
      res.end();
    } catch (innerError) {
      return next(innerError);
    }
  }
};

module.exports = {
  streamAskQuestion
};
