<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRealtimeStore } from "../../stores/realtime";

const { t } = useI18n();
const realtime = useRealtimeStore();

const displayCount = computed(() =>
  realtime.viewerCount === null ? "-" : realtime.viewerCount
);
const displayText = computed(
  () => `${t("common.viewer.prefix")}${displayCount.value}${t("common.viewer.suffix")}`,
);
</script>

<template>
  <div
    class="viewer-badge"
    role="status"
    :aria-label="displayText"
    :title="displayText"
  >
    <span class="viewer-dot" aria-hidden="true"></span>
    <span class="viewer-copy">{{ t("common.viewer.prefix") }}<strong>{{ displayCount }}</strong>{{ t("common.viewer.suffix") }}</span>
  </div>
</template>
