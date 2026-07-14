export function formatDate(value, withTime = false) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function truncate(value = "", length = 120) {
  return value.length > length ? `${value.slice(0, length).trim()}…` : value;
}

export const fallbackImage = new URL("../assets/tour-fallback.png", import.meta.url).href;

export function onImageError(event) {
  event.target.src = fallbackImage;
}
