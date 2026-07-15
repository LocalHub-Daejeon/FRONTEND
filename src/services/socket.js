import { API_BASE_URL } from "./api";

const RECONNECT_MIN_DELAY = 2000;
const RECONNECT_MAX_DELAY = 30000;

function resolveSocketUrl() {
  if (/^https?:\/\//.test(API_BASE_URL)) {
    return `${API_BASE_URL.replace(/^http/, "ws")}/ws`;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${API_BASE_URL}/ws`;
}

export function createRealtimeSocket({ onMessage }) {
  let socket = null;
  let reconnectDelay = RECONNECT_MIN_DELAY;
  let reconnectTimer = null;
  let closedByClient = false;

  function connect() {
    socket = new WebSocket(resolveSocketUrl());

    socket.onopen = () => {
      reconnectDelay = RECONNECT_MIN_DELAY;
    };

    socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // 형식이 올바르지 않은 메시지는 무시
      }
    };

    socket.onclose = () => {
      if (closedByClient) return;
      reconnectTimer = window.setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  connect();

  return {
    disconnect() {
      closedByClient = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    },
  };
}
