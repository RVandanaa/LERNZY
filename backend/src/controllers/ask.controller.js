const ChatHistory = require("../models/ChatHistory.model");
const { generateTutorResponse } = require("../services/ai.service");
const { normalizeLanguage, maybeTranslate } = require("../services/translation.service");
const { createSpeechPayload } = require("../services/tts.service");
const { toGesturePayload } = require("../services/signLanguage.service");
const { successResponse } = require("../utils/response.utils");

const askQuestion = async (req, res, next) => {
  try {
    const { question, language = "en", outputType = "text" } = req.body;
    const normalizedLanguage = normalizeLanguage(language);
    const level = req.user.educationLevel || "beginner";

    const aiResult = await generateTutorResponse({
      question,
      level,
      language: normalizedLanguage
    });

    const translatedText = await maybeTranslate({
      text: aiResult.text,
      language: normalizedLanguage
    });

    const responsePayload = {
      question,
      language: normalizedLanguage,
      outputType,
      explanation: translatedText
    };

    if (outputType === "voice") {
      responsePayload.tts = createSpeechPayload({
        text: translatedText,
        language: normalizedLanguage
      });
    }

    if (outputType === "sign-language") {
      responsePayload.signLanguage = toGesturePayload({
        text: translatedText,
        language: normalizedLanguage
      });
    }

    await ChatHistory.create({
      userId: req.user._id,
      question,
      responseText: translatedText,
      language: normalizedLanguage,
      outputType,
      tts: responsePayload.tts,
      signLanguage: responsePayload.signLanguage,
      modelMeta: aiResult.modelMeta
    });

    return successResponse(res, responsePayload, "Answer generated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  askQuestion
};
