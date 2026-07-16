<script setup>
import { useI18n } from "vue-i18n";
import { ChevronLeft, ChevronRight } from "@lucide/vue";

const { t } = useI18n();

defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

defineEmits(["change"]);
</script>

<template>
  <nav class="pagination" :aria-label="t('common.pagination.ariaLabel')">
    <button
      class="icon-button"
      type="button"
      :disabled="page <= 1"
      :title="t('common.pagination.prev')"
      @click="$emit('change', page - 1)"
    >
      <ChevronLeft :size="19" />
    </button>
    <span><strong>{{ page }}</strong> / {{ totalPages }}</span>
    <button
      class="icon-button"
      type="button"
      :disabled="page >= totalPages"
      :title="t('common.pagination.next')"
      @click="$emit('change', page + 1)"
    >
      <ChevronRight :size="19" />
    </button>
  </nav>
</template>
