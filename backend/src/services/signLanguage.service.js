const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 24);
};

const toGesturePayload = ({ text, language }) => {
  const tokens = tokenize(text);

  return {
    animationSet: language === "kn" ? "kn-basic-v1" : "en-basic-v1",
    gestures: tokens.map((token) => ({
      token,
      gestureId: `g_${token}`,
      animationUrl: `https://cdn.example.com/sign/${language}/g_${token}.json`
    }))
  };
};

module.exports = {
  toGesturePayload
};
