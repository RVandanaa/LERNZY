const normalizeLanguage = (language = "en") => {
  return language === "kannada" ? "kn" : language;
};

const translateToKannada = async (text) => {
  // Keep service interface async so a real provider can plug in later.
  const dictionary = {
    "Hello": "ನಮಸ್ಕಾರ",
    "Thank you": "ಧನ್ಯವಾದಗಳು",
    "Let us solve this step by step.": "ಇದನ್ನು ಹಂತ ಹಂತವಾಗಿ ಪರಿಹರಿಸೋಣ."
  };

  return dictionary[text] || text;
};

const maybeTranslate = async ({ text, language }) => {
  const normalized = normalizeLanguage(language);

  if (normalized === "kn") {
    return translateToKannada(text);
  }

  return text;
};

module.exports = {
  normalizeLanguage,
  maybeTranslate
};
