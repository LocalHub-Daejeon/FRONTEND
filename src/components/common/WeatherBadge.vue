<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { weatherApi } from "../../services/api";

const weather = ref(null);
const status = ref("loading");
let refreshTimer;

const weatherPresentation = computed(() => {
  const precipitation = String(weather.value?.precipitation_type || "").trim();
  const normalized = precipitation.toLowerCase();
  const precipitationCodes = {
    0: { emoji: "⛅", label: "강수 없음", kind: "clear" },
    1: { emoji: "🌧️", label: "비", kind: "rain" },
    2: { emoji: "🌨️", label: "비 또는 눈", kind: "sleet" },
    3: { emoji: "❄️", label: "눈", kind: "snow" },
    5: { emoji: "🌦️", label: "빗방울", kind: "shower" },
    6: { emoji: "🌨️", label: "빗방울 또는 눈", kind: "sleet" },
    7: { emoji: "❄️", label: "눈날림", kind: "snow" },
  };

  if (precipitationCodes[normalized]) return precipitationCodes[normalized];

  if (normalized.includes("소나기")) {
    return { emoji: "🌦️", label: "소나기", kind: "shower" };
  }
  if (normalized.includes("비/눈") || normalized.includes("눈/비")) {
    return { emoji: "🌨️", label: "비 또는 눈", kind: "sleet" };
  }
  if (normalized.includes("눈")) {
    return { emoji: "❄️", label: "눈", kind: "snow" };
  }
  if (normalized.includes("비")) {
    return { emoji: "🌧️", label: "비", kind: "rain" };
  }
  if (normalized.includes("맑")) {
    return { emoji: "☀️", label: "맑음", kind: "sunny" };
  }
  if (normalized.includes("흐림") || normalized.includes("구름")) {
    return { emoji: "☁️", label: precipitation, kind: "cloudy" };
  }
  return { emoji: "⛅", label: precipitation || "강수 없음", kind: "clear" };
});

const temperature = computed(() => {
  const value = Number(weather.value?.temperature);
  return Number.isFinite(value) ? `${Math.round(value)}°` : "--°";
});

const accessibleLabel = computed(() => {
  if (status.value === "loading") return "현재 날씨를 불러오는 중입니다.";
  if (status.value === "error") return "현재 날씨 정보를 준비 중입니다.";
  return `현재 날씨 ${weatherPresentation.value.label}, 기온 ${temperature.value}`;
});

const detailTitle = computed(() => {
  if (status.value === "error") return "날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도합니다.";
  if (!weather.value) return accessibleLabel.value;
  const details = [
    `${weatherPresentation.value.label} ${temperature.value}`,
    Number.isFinite(Number(weather.value.humidity)) ? `습도 ${weather.value.humidity}%` : "",
    Number.isFinite(Number(weather.value.wind_speed)) ? `바람 ${weather.value.wind_speed}m/s` : "",
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
      <strong v-else>날씨 준비 중</strong>
      <small v-if="status === 'ready'">{{ weatherPresentation.label }}</small>
      <small v-else-if="status === 'loading'">날씨 확인 중</small>
      <small v-else>잠시 후 갱신</small>
    </span>
  </div>
</template>
