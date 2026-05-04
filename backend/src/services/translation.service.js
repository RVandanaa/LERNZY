const logger = require("../utils/logger");

const normalizeLanguage = (language = "en") => {
  return language === "kannada" ? "kn" : language;
};

/**
 * If Kannada requested, optionally translate EN -> kn using Google Cloud Translate REST.
 * Falls back gracefully if credentials are absent.
 */
const translateToLanguage = async ({ text, targetLanguage }) => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey || !text) {
    return text;
  }

  try {
    const url =
      `https://translation.googleapis.com/language/translate/v2` +
      `?key=${encodeURIComponent(apiKey)}`;

    const body = {
      q: text,
      target: targetLanguage,
      format: "text"
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      logger.warn("google_translate_failed", { status: response.status, body: errText });
      return text;
    }

    const json = await response.json();
    const translated =
      json?.data?.translations?.[0]?.translatedText ||
      json?.data?.translations?.[0]?.translated_text;

    return translated || text;
  } catch (error) {
    logger.warn("google_translate_exception", { message: error.message });
    return text;
  }
};

const maybeTranslate = async ({ text, language }) => {
  const normalized = normalizeLanguage(language);

  if (normalized !== "kn") {
    return text;
  }

  // If Gemini is configured correctly, prompts already ask Kannada responses.
  // Still allow post-translation polish when enabled.
  if (process.env.KANNADA_POST_TRANSLATE === "true") {
    return translateToLanguage({ text, targetLanguage: "kn" });
  }

  return text;
};

module.exports = {
  normalizeLanguage,
  maybeTranslate,
  translateToLanguage
};
