import { create } from "zustand";
import { API_BASE_URL } from "../constants/api";
import * as SecureTokens from "../services/storage/secureTokens";
import { publicPost, authFetch } from "../services/api/http";

const normalizeUser = (u) =>
  u
    ? {
        id: u.id,
        name: u.name,
        email: u.email,
        preferredLanguage: u.preferredLanguage,
        educationLevel: u.educationLevel
      }
    : null;

const useAuthStore = create((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,

  persistTokens: async (accessToken, refreshToken) => {
    await SecureTokens.saveTokens(accessToken, refreshToken);
    set((s) => ({
      accessToken: accessToken !== undefined ? accessToken : s.accessToken,
      refreshToken: refreshToken !== undefined ? refreshToken : s.refreshToken
    }));
  },

  setSessionFromAuthPayload: async (payload) => {
    const access = payload.accessToken ?? payload.token;
    const refresh = payload.refreshToken;
    const user = normalizeUser(payload.user);
    await SecureTokens.saveTokens(access, refresh);
    set({
      accessToken: access ?? null,
      refreshToken: refresh ?? null,
      user: user ?? null
    });
  },

  bootstrap: async () => {
    const { accessToken, refreshToken } = await SecureTokens.readTokens();

    set({
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      hydrated: true
    });

    if (!accessToken) {
      return;
    }

    try {
      const data = await authFetch("/auth/me");
      set({ user: normalizeUser(data.user) });
    } catch {
      await get().clearSession();
    }
  },

  refreshSession: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      return false;
    }
    try {
      const data = await publicPost("/auth/refresh", { refreshToken });
      const access = data.accessToken ?? data.token;
      const nextRefresh = data.refreshToken ?? refreshToken;
      await SecureTokens.saveTokens(access, nextRefresh);
      set({ accessToken: access, refreshToken: nextRefresh });
      return true;
    } catch {
      return false;
    }
  },

  login: async (email, password) => {
    const data = await publicPost("/auth/login", { email, password });
    await get().setSessionFromAuthPayload(data);
  },

  signup: async ({ name, email, password, preferredLanguage, educationLevel }) => {
    const data = await publicPost("/auth/signup", {
      name,
      email,
      password,
      preferredLanguage,
      educationLevel
    });
    await get().setSessionFromAuthPayload(data);
  },

  patchProfile: async (body) => {
    const data = await authFetch("/auth/me", { method: "PATCH", body });
    if (data?.user) {
      set({ user: normalizeUser(data.user) });
    }
    return data;
  },

  logout: async () => {
    const token = get().accessToken;
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch {
      // still clear local session
    }
    await get().clearSession();
  },

  clearSession: async () => {
    await SecureTokens.clearTokens();
    set({
      accessToken: null,
      refreshToken: null,
      user: null
    });
  },

  isAuthenticated: () => Boolean(get().accessToken)
}));

export default useAuthStore;
