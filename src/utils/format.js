import i18n from "../i18n";

export function formatDate(value, withTime = false) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const intlLocale = i18n.global.locale.value === "en" ? "en-US" : "ko-KR";
  return new Intl.DateTimeFormat(intlLocale, {
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
