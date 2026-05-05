/** Map ProfileSetup language keys → backend codes (English / Kannada only today). */
export function profileLanguageToApi(langKey) {
  if (!langKey) return "en";
  if (langKey === "kannada") return "kn";
  return "en";
}

export function gradeToEducationLevel(grade) {
  const n = Number(grade);
  if (!n || n <= 4) return "beginner";
  if (n <= 8) return "intermediate";
  return "advanced";
}
