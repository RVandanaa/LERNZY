import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Resolved API prefix including `/api` (e.g. http://10.0.2.2:5001/api).
 * Override anytime via app.json → expo.extra.apiBaseUrl (physical devices / prod).
 */
const extraRaw = Constants.expoConfig?.extra?.apiBaseUrl;
const extraUrl =
  typeof extraRaw === "string" && extraRaw.trim().length > 0 ? extraRaw.trim() : null;

export const API_BASE_URL =
  extraUrl ||
  (__DEV__
    ? Platform.select({
        android: "http://10.0.2.2:5001/api",
        ios: "http://localhost:5001/api",
        default: "http://localhost:5001/api"
      })
    : "https://REPLACE_WITH_PRODUCTION_HOST/api");
