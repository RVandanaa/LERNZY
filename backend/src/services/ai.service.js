const OpenAI = require("openai");

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
};

const buildPrompt = ({ question, level, language }) => {
  const languageLabel = language === "kn" ? "Kannada" : "English";

  return `
You are an AI Tutor.
Student level: ${level}.
Task:
1) Explain the concept in very simple terms.
2) Use small steps and one short practical example.
3) Keep answer concise but complete.
4) Respond only in ${languageLabel}.
Question: "${question}"
`.trim();
};

const getFallbackAnswer = ({ question, language }) => {
  const prefix =
    language === "kn"
      ? "ಈಗ ನಾನು ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ: "
      : "Here is a simple explanation: ";
  return `${prefix}${question}`;
};

const generateTutorResponse = async ({ question, level, language }) => {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!client) {
    return {
      text: getFallbackAnswer({ question, language }),
      modelMeta: {
        provider: "fallback",
        model: "local-template"
      }
    };
  }

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: "You are a patient teacher helping school and college students."
      },
      {
        role: "user",
        content: buildPrompt({ question, level, language })
      }
    ]
  });

  const text = completion.choices?.[0]?.message?.content?.trim();

  return {
    text: text || getFallbackAnswer({ question, language }),
    modelMeta: {
      provider: "openai",
      model
    }
  };
};

module.exports = {
  generateTutorResponse
};
