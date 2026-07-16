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

function toEventDate(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

export function formatEventDate(value, locale = "ko-KR") {
  const date = toEventDate(value);
  if (!date) return "";

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
  return formatter.format(date);
}

export const fallbackImage = new URL("../assets/tour-fallback.png", import.meta.url).href;

export function onImageError(event) {
  event.target.src = fallbackImage;
}
