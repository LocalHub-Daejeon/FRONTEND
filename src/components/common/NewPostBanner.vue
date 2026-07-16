<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRealtimeStore } from "../../stores/realtime";

const { t } = useI18n();
const realtime = useRealtimeStore();
const visible = ref(false);

watch(
  () => realtime.postNoticeKey,
  (key) => {
    if (key === 0) return;
    visible.value = false;
    requestAnimationFrame(() => {
      visible.value = true;
    });
  }
);
</script>

<template>
  <div
    v-if="visible"
    :key="realtime.postNoticeKey"
    class="post-notice-banner"
    role="status"
    @animationend="visible = false"
  >
    {{ t("common.newPostNotice") }}
  </div>
</template>
