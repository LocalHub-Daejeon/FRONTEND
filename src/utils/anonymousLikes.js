const STORAGE_KEY = "duru:anonymous-likes:v1";

function createVisitorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadAnonymousLikeState() {
  const fallback = { visitorId: createVisitorId(), likedPostIds: [] };
  if (typeof window === "undefined") return fallback;

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    const visitorId = typeof saved?.visitorId === "string" ? saved.visitorId : fallback.visitorId;
    const likedPostIds = Array.isArray(saved?.likedPostIds)
      ? [...new Set(saved.likedPostIds.map(String))]
      : [];
    const state = { visitorId, likedPostIds };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  } catch {
    return fallback;
  }
}

export function saveAnonymousLikeState(visitorId, likedPostIds) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ visitorId, likedPostIds: [...new Set(likedPostIds.map(String))] }),
    );
  } catch {
    // In-memory Pinia state still prevents repeat clicks during this session.
  }
}
