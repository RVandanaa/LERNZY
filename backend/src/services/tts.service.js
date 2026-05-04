const logger = require("../utils/logger");

const createSpeechPayload = ({ text, language }) => {
  const provider = process.env.TTS_PROVIDER || "browser";

  // Default: safest + free-ish path — let the frontend use Web Speech / native TTS.
  if (!provider || provider === "browser") {
    return {
      provider: "browser",
      audioUrl: null,
      mimeType: null,
      hint: "Use device/browser TTS (Web Speech API) with the explanation text.",
      locale: language === "kn" ? "kn-IN" : "en-US",
      voiceHint: language === "kn" ? "Kannada" : "English"
    };
  }

  if (provider === "elevenlabs" && process.env.ELEVENLABS_API_KEY) {
    logger.warn("tts_placeholder", { message: "ElevenLabs URL generation requires your account voice + API integration." });

    return {
      provider: "elevenlabs",
      audioUrl: null,
      mimeType: "audio/mpeg",
      hint: "Wire ElevenLabs text-to-speech in TTS_PROVIDER integration (server-side)."
    };
  }

  if (provider === "aws-polly") {
    return {
      provider: "aws-polly",
      audioUrl: null,
      mimeType: "audio/mpeg",
      hint: "Use AWS SDK Polly GenerateSpeech and return a signed URL or stream."
    };
  }

  return {
    provider,
    audioUrl: null,
    mimeType: null,
    hint: "Unknown TTS_PROVIDER. Falling back to browser TTS suggestion.",
    locale: language === "kn" ? "kn-IN" : "en-US"
  };
};

module.exports = {
  createSpeechPayload
};
