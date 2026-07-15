import { API_BASE_URL } from "./api";

const RECONNECT_MIN_DELAY = 2000;
const RECONNECT_MAX_DELAY = 30000;
const DEPLOYED_WS_BASE_URL = "wss://backend-33kp.onrender.com/api";

function resolveSocketUrl() {
  if (/^https?:\/\//.test(API_BASE_URL)) {
    return `${API_BASE_URL.replace(/^http/, "ws")}/ws`;
  }
  if (import.meta.env.DEV) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}${API_BASE_URL}/ws`;
  }
  // Netlify 등 정적 호스팅의 리다이렉트 프록시는 WebSocket 업그레이드를 지원하지 않으므로
  // 배포 환경에서는 상대경로 프록시를 거치지 않고 백엔드에 직접 연결한다.
  return `${DEPLOYED_WS_BASE_URL}/ws`;
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
