const fs = require("fs");
const path = require("path");

let cachedPrompts = null;

const loadPrompts = () => {
  if (cachedPrompts) {
    return cachedPrompts;
  }

  const promptsPath = path.join(__dirname, "..", "config", "prompts.json");
  const raw = fs.readFileSync(promptsPath, "utf8");
  cachedPrompts = JSON.parse(raw);
  return cachedPrompts;
};

const buildUserPrompt = ({ question, level, language }) => {
  const prompts = loadPrompts();
  const languageLabel = language === "kn" ? "Kannada" : "English";

  return prompts.userPromptTemplate
    .replaceAll("{level}", level)
    .replaceAll("{languageLabel}", languageLabel)
    .replaceAll("{question}", question);
};

const getSystemPrompt = () => {
  const prompts = loadPrompts();
  return prompts.systemTutor;
};

module.exports = {
  buildUserPrompt,
  getSystemPrompt
};
