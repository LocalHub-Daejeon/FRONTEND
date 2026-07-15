<script setup>
import { ref, watch } from "vue";
import { useRealtimeStore } from "../../stores/realtime";

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
    🎈 새로운 게시글이 등록되었습니다.
  </div>
</template>
