const DEPLOYED_API_BASE_URL = "https://backend-33kp.onrender.com/api";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api" : DEPLOYED_API_BASE_URL);

function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("API 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || "요청을 처리하지 못했습니다.");
  }
  return data;
}

export const weatherApi = {
  getCurrent: () => request("/weather"),
};

export const toursApi = {
  getAll: (params) => request(`/tours${toQuery(params)}`),
  getById: (contentId) => request(`/tours/${encodeURIComponent(contentId)}`),
};

export const postsApi = {
  getAll: (params) => request(`/posts${toQuery(params)}`),
  getById: (postId) => request(`/posts/${postId}`),
  create: (payload) => request("/posts", { method: "POST", body: JSON.stringify(payload) }),
  update: (postId, payload) =>
    request(`/posts/${postId}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (postId, password) =>
    request(`/posts/${postId}`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    }),
  like: (postId) => request(`/posts/${postId}/likes`, { method: "POST" }),
};

export const chatApi = {
  send: (message, history) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};

export { API_BASE_URL };
