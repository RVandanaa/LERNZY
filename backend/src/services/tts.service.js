const logger = require("../utils/logger");

const toDataUrl = (buffer, mimeType) => {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const createElevenLabsSpeech = async ({ text, language }) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId =
    language === "kn"
      ? process.env.ELEVENLABS_VOICE_ID_KN || process.env.ELEVENLABS_VOICE_ID
      : process.env.ELEVENLABS_VOICE_ID_EN || process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    logger.warn("elevenlabs_missing_config", {
      hasApiKey: Boolean(apiKey),
      hasVoiceId: Boolean(voiceId)
    });
    return null;
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      Accept: "audio/mpeg"
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: Number(process.env.ELEVENLABS_STABILITY || 0.4),
        similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY_BOOST || 0.75)
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    logger.warn("elevenlabs_tts_failed", {
      status: response.status,
      body: errorBody
    });
    return null;
  }

  const mimeType = response.headers.get("content-type") || "audio/mpeg";
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const maxDataUrlBytes = Number(process.env.TTS_MAX_DATA_URL_BYTES || 450000);

  if (audioBuffer.length > maxDataUrlBytes) {
    return {
      provider: "elevenlabs",
      audioUrl: null,
      mimeType,
      hint:
        "Audio generated but too large for inline data URL. Store it in object storage and return a signed URL.",
      bytes: audioBuffer.length
    };
  }

  return {
    provider: "elevenlabs",
    audioUrl: toDataUrl(audioBuffer, mimeType),
    mimeType,
    bytes: audioBuffer.length
  };
};

const createPollySpeech = async ({ text, language }) => {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    logger.warn("aws_polly_missing_config", {
      hasRegion: Boolean(region),
      hasAccessKeyId: Boolean(accessKeyId),
      hasSecretAccessKey: Boolean(secretAccessKey)
    });
    return null;
  }

  try {
    const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
    const client = new PollyClient({
      region,
      credentials: { accessKeyId, secretAccessKey }
    });

    const voiceId =
      language === "kn"
        ? process.env.AWS_POLLY_VOICE_ID_KN || "Aditi"
        : process.env.AWS_POLLY_VOICE_ID_EN || "Joanna";

    const command = new SynthesizeSpeechCommand({
      Engine: process.env.AWS_POLLY_ENGINE || "neural",
      LanguageCode: language === "kn" ? "en-IN" : "en-US",
      OutputFormat: "mp3",
      Text: text,
      VoiceId: voiceId,
      TextType: "text"
    });

    const output = await client.send(command);
    const audioStream = output?.AudioStream;

    if (!audioStream) {
      return null;
    }

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const audioBuffer = Buffer.concat(chunks);
    const mimeType = "audio/mpeg";
    const maxDataUrlBytes = Number(process.env.TTS_MAX_DATA_URL_BYTES || 450000);

    if (audioBuffer.length > maxDataUrlBytes) {
      return {
        provider: "aws-polly",
        audioUrl: null,
        mimeType,
        hint:
          "Audio generated but too large for inline data URL. Store it in object storage and return a signed URL.",
        bytes: audioBuffer.length
      };
    }

    return {
      provider: "aws-polly",
      audioUrl: toDataUrl(audioBuffer, mimeType),
      mimeType,
      bytes: audioBuffer.length
    };
  } catch (error) {
    logger.warn("aws_polly_tts_failed", {
      message: error.message
    });
    return null;
  }
};

const createSpeechPayload = async ({ text, language }) => {
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

  if (provider === "elevenlabs") {
    const elevenLabsPayload = await createElevenLabsSpeech({ text, language });
    if (elevenLabsPayload) {
      return elevenLabsPayload;
    }
  }

  if (provider === "aws-polly") {
    const pollyPayload = await createPollySpeech({ text, language });
    if (pollyPayload) {
      return pollyPayload;
    }
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
