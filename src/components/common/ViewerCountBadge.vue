<script setup>
import { computed } from "vue";
import { useRealtimeStore } from "../../stores/realtime";

const realtime = useRealtimeStore();

const displayCount = computed(() =>
  realtime.viewerCount === null ? "-" : realtime.viewerCount
);
</script>

<template>
  <div
    class="viewer-badge"
    role="status"
    :aria-label="`현재 접속자 수 ${displayCount}명`"
    :title="`현재 접속자 수 ${displayCount}명`"
  >
    <span class="viewer-dot" aria-hidden="true"></span>
    <span class="viewer-copy">현재 접속자 수 : <strong>{{ displayCount }}</strong>명</span>
  </div>
</template>
