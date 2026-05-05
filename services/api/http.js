import { API_BASE_URL } from "../../constants/api";

export class ApiError extends Error {
  constructor(message, status = 0, code = null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Invalid response" };
  }
}

function getStoreState() {
  try {
    // eslint-disable-next-line global-require
    return require("../../store/useAuthStore").default.getState();
  } catch {
    return {};
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const store = getStoreState();
      const refreshToken = store.refreshToken;
      if (!refreshToken) {
        return false;
      }

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
      const json = await parseJsonResponse(res);

      if (!res.ok || !json.success) {
        return false;
      }

      const access = json.data?.accessToken ?? json.data?.token;
      const nextRefresh = json.data?.refreshToken;
      if (!access || !nextRefresh) {
        return false;
      }
      await store.persistTokens(access, nextRefresh);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function publicPost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {})
  });
  const json = await parseJsonResponse(res);

  if (!res.ok || json.success === false) {
    const msg =
      json.message ||
      json.errors?.map((e) => e.message || e.msg).join(", ") ||
      "Request failed";
    throw new ApiError(msg, res.status, json.error?.code);
  }

  return json.data ?? json;
}

export async function authFetch(path, options = {}) {
  const { method = "GET", body, skipRefreshRetry = false } = options;

  const execute = async (accessToken) => {
    const headers = {};
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  };

  let accessToken = getStoreState().accessToken;
  let res = await execute(accessToken);
  let json = await parseJsonResponse(res);

  if (res.status === 401 && !skipRefreshRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = getStoreState().accessToken;
      res = await execute(accessToken);
      json = await parseJsonResponse(res);
    }
  }

  if (!res.ok || json.success === false) {
    const msg =
      json.message ||
      json.errors?.map((e) => e.message || e.msg).join(", ") ||
      "Request failed";
    throw new ApiError(msg, res.status, json.error?.code);
  }

  return json.data ?? json;
}

export async function askTutor(body) {
  return authFetch("/ask", { method: "POST", body });
}
