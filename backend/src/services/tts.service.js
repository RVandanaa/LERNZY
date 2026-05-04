const buildTtsUrl = ({ text, language }) => {
  // Frontend can stream from this endpoint directly.
  const query = encodeURIComponent(text);
  const lang = language === "kn" ? "kn-IN" : "en-US";
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${query}&tl=${lang}&client=tw-ob`;
};

const createSpeechPayload = ({ text, language }) => {
  return {
    provider: "google-tts-url",
    audioUrl: buildTtsUrl({ text, language }),
    mimeType: "audio/mpeg"
  };
};

module.exports = {
  createSpeechPayload
};
