const ChatHistory = require("../models/ChatHistory.model");
const { generateTutorResponse } = require("../services/ai.service");
const { normalizeLanguage, maybeTranslate } = require("../services/translation.service");
const { createSpeechPayload } = require("../services/tts.service");
const { toGesturePayload } = require("../services/signLanguage.service");
const { successResponse } = require("../utils/response.utils");
const logger = require("../utils/logger");
const {
  cacheGetJSON,
  cacheSetJSON,
  buildAskCacheKey
} = require("../services/cache.service");

const askQuestion = async (req, res, next) => {
  try {
    const { question, language = "en", outputType = "text" } = req.body;
    const normalizedLanguage = normalizeLanguage(language);
    const level = req.user.educationLevel || "beginner";

    const cacheKey = buildAskCacheKey({ question, language: normalizedLanguage, level, outputType });
    const ttlSeconds = Number(process.env.AI_CACHE_TTL_SECONDS || 3600);

    const cached = await cacheGetJSON(cacheKey);

    if (cached) {
      return successResponse(res, cached, "Answer generated (cached)");
    }

    const aiResult = await generateTutorResponse({
      question,
      level,
      language: normalizedLanguage
    });

    const finalText = await maybeTranslate({
      text: aiResult.text,
      language: normalizedLanguage
    });

    const [tts, signLanguage] = await Promise.all([
      Promise.resolve(outputType === "voice" ? createSpeechPayload({
        text: finalText,
        language: normalizedLanguage
      }) : null),
      Promise.resolve(outputType === "sign-language" ? toGesturePayload({
        text: finalText,
        language: normalizedLanguage
      }) : null)
    ]);

    const responsePayload = {
      question,
      language: normalizedLanguage,
      outputType,
      explanation: finalText,
      ...(outputType === "voice" ? { tts } : {}),
      ...(outputType === "sign-language" ? { signLanguage } : {}),
      modelMeta: aiResult.modelMeta,
      sse: {
        streamUrl: "/api/ask/stream",
        hint: "Use POST /api/ask/stream for token streaming (SSE fetch)."
      }
    };

    try {
      await ChatHistory.create({
        userId: req.user._id,
        question,
        responseText: finalText,
        language: normalizedLanguage,
        outputType,
        tts: responsePayload.tts || undefined,
        signLanguage: responsePayload.signLanguage || undefined,
        modelMeta: aiResult.modelMeta
      });
    } catch (error) {
      logger.warn("history_save_failed", { message: error.message });
    }

    cacheSetJSON(cacheKey, responsePayload, ttlSeconds).catch(() => null);

    return successResponse(res, responsePayload, "Answer generated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  askQuestion
};
