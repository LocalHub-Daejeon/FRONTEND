<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { weatherApi } from "../../services/api";

const { t } = useI18n();
const weather = ref(null);
const status = ref("loading");
let refreshTimer;

const weatherPresentation = computed(() => {
  const precipitation = String(weather.value?.precipitation_type || "").trim();
  const normalized = precipitation.toLowerCase();
  const precipitationCodes = {
    0: { emoji: "⛅", label: t("common.weather.clear"), kind: "clear" },
    1: { emoji: "🌧️", label: t("common.weather.rain"), kind: "rain" },
    2: { emoji: "🌨️", label: t("common.weather.sleet"), kind: "sleet" },
    3: { emoji: "❄️", label: t("common.weather.snow"), kind: "snow" },
    5: { emoji: "🌦️", label: t("common.weather.showerDrizzle"), kind: "shower" },
    6: { emoji: "🌨️", label: t("common.weather.sleetDrizzle"), kind: "sleet" },
    7: { emoji: "❄️", label: t("common.weather.snowFlurry"), kind: "snow" },
  };

  if (precipitationCodes[normalized]) return precipitationCodes[normalized];

  if (normalized.includes("소나기")) {
    return { emoji: "🌦️", label: t("common.weather.shower"), kind: "shower" };
  }
  if (normalized.includes("비/눈") || normalized.includes("눈/비")) {
    return { emoji: "🌨️", label: t("common.weather.sleet"), kind: "sleet" };
  }
  if (normalized.includes("눈")) {
    return { emoji: "❄️", label: t("common.weather.snow"), kind: "snow" };
  }
  if (normalized.includes("비")) {
    return { emoji: "🌧️", label: t("common.weather.rain"), kind: "rain" };
  }
  if (normalized.includes("맑")) {
    return { emoji: "☀️", label: t("common.weather.sunny"), kind: "sunny" };
  }
  if (normalized.includes("흐림") || normalized.includes("구름")) {
    return { emoji: "☁️", label: precipitation, kind: "cloudy" };
  }
  return { emoji: "⛅", label: precipitation || t("common.weather.clear"), kind: "clear" };
});

const temperature = computed(() => {
  const value = Number(weather.value?.temperature);
  return Number.isFinite(value) ? `${Math.round(value)}°` : "--°";
});

const accessibleLabel = computed(() => {
  if (status.value === "loading") return t("common.weather.loadingLabel");
  if (status.value === "error") return t("common.weather.errorLabel");
  return t("common.weather.currentAria", { label: weatherPresentation.value.label, temp: temperature.value });
});

const detailTitle = computed(() => {
  if (status.value === "error") return t("common.weather.errorTitle");
  if (!weather.value) return accessibleLabel.value;
  const details = [
    `${weatherPresentation.value.label} ${temperature.value}`,
    Number.isFinite(Number(weather.value.humidity)) ? t("common.weather.humidity", { value: weather.value.humidity }) : "",
    Number.isFinite(Number(weather.value.wind_speed)) ? t("common.weather.wind", { value: weather.value.wind_speed }) : "",
  ].filter(Boolean);
  return details.join(" · ");
});

async function loadWeather() {
  status.value = "loading";
  try {
    weather.value = await weatherApi.getCurrent();
    status.value = "ready";
  } catch {
    status.value = "error";
  }
}

onMounted(() => {
  loadWeather();
  refreshTimer = window.setInterval(loadWeather, 10 * 60 * 1000);
});

onBeforeUnmount(() => window.clearInterval(refreshTimer));
</script>

<template>
  <div
    class="weather-badge"
    :class="[`is-${status}`, `weather-${weatherPresentation.kind}`]"
    role="status"
    :aria-label="accessibleLabel"
    :title="detailTitle"
  >
    <span class="weather-emoji" aria-hidden="true">
      {{ status === "error" ? "🌤️" : weatherPresentation.emoji }}
    </span>
    <span class="weather-copy">
      <strong v-if="status === 'ready'">{{ temperature }}</strong>
      <strong v-else-if="status === 'loading'" class="weather-loading">•••</strong>
      <strong v-else>{{ t("common.weather.preparing") }}</strong>
      <small v-if="status === 'ready'">{{ weatherPresentation.label }}</small>
      <small v-else-if="status === 'loading'">{{ t("common.weather.checking") }}</small>
      <small v-else>{{ t("common.weather.refreshSoon") }}</small>
    </span>
  </div>
</template>
