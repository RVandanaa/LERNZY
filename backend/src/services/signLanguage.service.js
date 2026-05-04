const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 24);
};

const toGesturePayload = ({ text, language }) => {
  const provider = process.env.SIGN_LANGUAGE_PROVIDER || "lexicon-demo";

  if (process.env.SIGN_LANGUAGE_COMING_SOON === "true") {
    return {
      provider: "disabled",
      status: "coming_soon",
      message: "Sign-language animation playback is planned; integrate MediaPipe/HamNoSys or curated clips."
    };
  }

  const tokens = tokenize(text);

  return {
    provider,
    status: "demo_lexicon",
    animationSet: language === "kn" ? "kn-basic-v1" : "en-basic-v1",
    gestures: tokens.map((token) => ({
      token,
      gestureId: `g_${token}`,
      animationUrl: `https://cdn.example.com/sign/${language}/g_${token}.json`,
      disclaimer: "Replace with authoritative ISL datasets + licensed motion clips."
    }))
  };
};

module.exports = {
  toGesturePayload
};
