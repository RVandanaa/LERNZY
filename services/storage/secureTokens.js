import * as SecureStore from "expo-secure-store";

const ACCESS = "lernzy_access_token";
const REFRESH = "lernzy_refresh_token";

export async function saveTokens(accessToken, refreshToken) {
  if (accessToken != null) {
    await SecureStore.setItemAsync(ACCESS, accessToken);
  }
  if (refreshToken != null) {
    await SecureStore.setItemAsync(REFRESH, refreshToken);
  }
}

export async function readTokens() {
  const accessToken = await SecureStore.getItemAsync(ACCESS);
  const refreshToken = await SecureStore.getItemAsync(REFRESH);
  return { accessToken, refreshToken };
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS).catch(() => {});
  await SecureStore.deleteItemAsync(REFRESH).catch(() => {});
}
