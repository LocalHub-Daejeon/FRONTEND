<script setup>
import { ChevronLeft, ChevronRight } from "@lucide/vue";

defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

defineEmits(["change"]);
</script>

<template>
  <nav class="pagination" aria-label="페이지 이동">
    <button
      class="icon-button"
      type="button"
      :disabled="page <= 1"
      title="이전 페이지"
      @click="$emit('change', page - 1)"
    >
      <ChevronLeft :size="19" />
    </button>
    <span><strong>{{ page }}</strong> / {{ totalPages }}</span>
    <button
      class="icon-button"
      type="button"
      :disabled="page >= totalPages"
      title="다음 페이지"
      @click="$emit('change', page + 1)"
    >
      <ChevronRight :size="19" />
    </button>
  </nav>
</template>
