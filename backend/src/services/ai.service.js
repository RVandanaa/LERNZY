const logger = require("../utils/logger");
const { buildUserPrompt, getSystemPrompt } = require("./prompt.service");

const getFallbackAnswer = ({ question, language }) => {
  const prefix =
    language === "kn"
      ? "ಈಗ ನಾನು ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ: "
      : "Here is a simple explanation: ";

  return `${prefix}${question}`;
};

const normalizeProvider = () => {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  // Backwards-compat: migrate away from OpenAI without breaking env files.
  if (provider === "openai") {
    return "gemini";
  }

  return provider;
};

const callGemini = async ({ prompt, stream }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for Gemini provider.");
  }

  const endpoint = stream
    ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent`
    : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const query = stream ? `key=${encodeURIComponent(apiKey)}&alt=sse` : `key=${encodeURIComponent(apiKey)}`;
  const url = `${endpoint}?${query}`;

  const headers = {
    "Content-Type": "application/json"
  };

  if (stream) {
    headers.Accept = "text/event-stream";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${getSystemPrompt()}\n\n${prompt}` }]
        }
      ]
    })
  });

  return response;
};

const extractGeminiText = (json) => {
  const candidates = json?.candidates || [];
  const parts = candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text).filter(Boolean).join(" ");
  return (text || "").trim();
};

const consumeGeminiStream = async (response, onToken) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/event-stream")) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let idx;

      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trimEnd();
        buffer = buffer.slice(idx + 1);

        if (!line.startsWith("data:")) {
          continue;
        }

        const payload = line.replace(/^data:\s*/, "").trim();
        if (!payload || payload === "[DONE]") {
          continue;
        }

        try {
          const json = JSON.parse(payload);
          const token = extractGeminiText(json);
          if (token) {
            onToken(token);
          }
        } catch (error) {
          // ignore partial lines
        }
      }
    }

    return;
  }

  const text = await response.text();

  // Gemini stream pseudo-JSON arrays; sanitize into valid JSON objects.
  const trimmed = text.trim();
  let inner = trimmed;

  if (inner.startsWith("[") && inner.endsWith("]")) {
    inner = inner.slice(1, -1);
  }

  const objects = inner
    .split(/}\s*,\s*{/g)
    .map((chunk, idx, arr) => {
      let part = chunk;
      if (idx > 0) part = `{${part}`;
      if (idx < arr.length - 1) part = `${part}}`;
      return part;
    });

  for (const raw of objects) {
    try {
      const json = JSON.parse(raw);
      const token = extractGeminiText(json);
      if (token) {
        onToken(token);
      }
    } catch (error) {
      // Ignore partial chunks when parsing fails mid-stream on proxies
    }
  }
};

const generateWithGemini = async ({ prompt }) => {
  const response = await callGemini({ prompt, stream: false });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gemini error (${response.status}): ${body}`);
  }

  const json = await response.json();
  return extractGeminiText(json);
};

const generateWithOllama = async ({ prompt }) => {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${getSystemPrompt()}\n\n${prompt}`,
      stream: false,
      options: {
        temperature: 0.4
      }
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama error (${response.status}): ${body}`);
  }

  const json = await response.json();
  const text = (json.response || "").trim();
  return text;
};

const streamWithOllama = async ({ prompt, onToken }) => {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${getSystemPrompt()}\n\n${prompt}`,
      stream: true,
      options: {
        temperature: 0.4
      }
    })
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama stream error (${response.status}): ${body}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffered = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffered += decoder.decode(value, { stream: true });

    let idx;

    while ((idx = buffered.indexOf("\n")) !== -1) {
      const line = buffered.slice(0, idx).trim();
      buffered = buffered.slice(idx + 1);
      if (!line) continue;

      try {
        const json = JSON.parse(line);
        if (json.response) {
          onToken(json.response);
        }
      } catch (error) {
        // ignore malformed chunk
      }
    }
  }
};

const generateTutorResponse = async ({ question, level, language }) => {
  const prompt = buildUserPrompt({ question, level, language });
  const provider = normalizeProvider();

  try {
    if (provider === "ollama") {
      const text = await generateWithOllama({ prompt });
      return {
        text: text || getFallbackAnswer({ question, language }),
        modelMeta: {
          provider: "ollama",
          model: process.env.OLLAMA_MODEL || "llama3.2"
        }
      };
    }

    const text = await generateWithGemini({ prompt });

    return {
      text: text || getFallbackAnswer({ question, language }),
      modelMeta: {
        provider: "gemini",
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash"
      }
    };
  } catch (error) {
    logger.warn("ai_provider_failed", {
      provider,
      message: error.message,
      stack: error.stack
    });

    const allowFallback =
      String(process.env.AI_FALLBACK_ENABLED || "true").toLowerCase() === "true";

    if (!allowFallback) {
      throw error;
    }

    return {
      text: getFallbackAnswer({ question, language }),
      modelMeta: {
        provider: "fallback",
        model: "local-template"
      }
    };
  }
};

const streamTutorResponse = async ({ question, level, language, onToken }) => {
  const prompt = buildUserPrompt({ question, level, language });
  const provider = normalizeProvider();

  try {
    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        const text = getFallbackAnswer({ question, language });
        onToken(text);
        return;
      }

      const response = await callGemini({ prompt, stream: true });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Gemini stream error (${response.status}): ${body}`);
      }

      await consumeGeminiStream(response, onToken);
      return;
    }

    if (provider === "ollama") {
      await streamWithOllama({ prompt, onToken });
      return;
    }

    const text = getFallbackAnswer({ question, language });
    onToken(text);
  } catch (error) {
    logger.warn("ai_stream_failed", { message: error.message });

    const allowFallback =
      String(process.env.AI_FALLBACK_ENABLED || "true").toLowerCase() === "true";

    if (!allowFallback) {
      throw error;
    }

    const text = getFallbackAnswer({ question, language });
    onToken(text);
  }
};

module.exports = {
  generateTutorResponse,
  streamTutorResponse,
  getFallbackAnswer
};
