import { createI18n } from "vue-i18n";
import ko from "./locales/ko";
import en from "./locales/en";

const STORAGE_KEY = "duru-locale";
const supportedLocales = ["ko", "en"];

function getInitialLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (supportedLocales.includes(saved)) return saved;
  return "ko";
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "ko",
  messages: { ko, en },
});

export function setLocale(locale) {
  if (!supportedLocales.includes(locale)) return;
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute("lang", locale);
}

document.documentElement.setAttribute("lang", i18n.global.locale.value);

export default i18n;
