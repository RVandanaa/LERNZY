import { API_BASE_URL } from "../../constants/api";

export class ApiError extends Error {
  constructor(message, status = 0, code = null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** User-facing copy for transient and server failures */
export function friendlyApiMessage(status, serverMessage) {
  if (!status || status === 0) {
    return "Could not reach the server. Check your connection and try again.";
  }
  if (status >= 500) {
    return "Our servers are having trouble. Please try again in a moment.";
  }
  return serverMessage || "Something went wrong.";
}

async function clearSessionAndNavigateToAuth() {
  try {
    const store = getStoreState();
    if (typeof store.clearSession === "function") {
      await store.clearSession();
    }
  } catch {
    // ignore
  }
  try {
    const { resetToAuth } = require("../navigation/resetToAuth");
    resetToAuth();
  } catch {
    // navigation may not be mounted yet
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
    const raw =
      json.message ||
      (Array.isArray(json.errors) ? json.errors.map((e) => e.message || e.msg || e).join(", ") : json.errors) ||
      "Request failed";
    const msg = friendlyApiMessage(res.status, raw);
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
    if (res.status === 401) {
      await clearSessionAndNavigateToAuth();
    }
    const raw =
      json.message ||
      json.errors?.map((e) => e.message || e.msg).join(", ") ||
      "Request failed";
    const msg =
      res.status === 401
        ? raw || "Your session expired. Please sign in again."
        : friendlyApiMessage(res.status, raw);
    throw new ApiError(msg, res.status, json.error?.code);
  }

  return json.data ?? json;
}

export async function askTutor(body) {
  return authFetch("/ask", { method: "POST", body });
}

function parseSseEvents(chunk, carry = "") {
  const merged = `${carry}${chunk}`;
  const frames = merged.split("\n\n");
  const nextCarry = frames.pop() || "";
  const events = [];

  for (const frame of frames) {
    const lines = frame.split("\n");
    let event = "message";
    let data = "";

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (line.startsWith("event:")) {
        event = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        data += line.slice("data:".length).trim();
      }
    }

    if (!data) continue;
    try {
      events.push({ event, payload: JSON.parse(data) });
    } catch {
      // Ignore malformed SSE payloads.
    }
  }

  return { events, carry: nextCarry };
}

export async function askTutorStream(body, handlers = {}) {
  const { onToken, onDone } = handlers;

  const store = getStoreState();
  const accessToken = store.accessToken;
  if (!accessToken) {
    throw new ApiError("Not authenticated", 401, "TOKEN_MISSING");
  }

  const res = await fetch(`${API_BASE_URL}/ask/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Accept: "text/event-stream"
    },
    body: JSON.stringify(body ?? {})
  });

  if (!res.ok) {
    const json = await parseJsonResponse(res);
    if (res.status === 401) {
      await clearSessionAndNavigateToAuth();
    }
    const raw =
      json.message ||
      json.errors?.map((e) => e.message || e.msg).join(", ") ||
      "Stream request failed";
    const msg =
      res.status === 401
        ? raw || "Your session expired. Please sign in again."
        : friendlyApiMessage(res.status, raw);
    throw new ApiError(msg, res.status, json.error?.code);
  }

  if (!res.body || typeof res.body.getReader !== "function") {
    throw new ApiError("Streaming unsupported on this runtime", 0, "STREAM_UNSUPPORTED");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let carry = "";
  let donePayload = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const parsed = parseSseEvents(text, carry);
    carry = parsed.carry;

    for (const item of parsed.events) {
      if (item.event === "token") {
        if (typeof onToken === "function") {
          onToken(item.payload?.token || "");
        }
      } else if (item.event === "done") {
        donePayload = item.payload || null;
        if (typeof onDone === "function") {
          onDone(donePayload);
        }
      } else if (item.event === "error") {
        throw new ApiError(item.payload?.message || "Stream failed", 500, "STREAM_ERROR");
      }
    }
  }

  return donePayload || {};
}
