<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Bookmark } from "@lucide/vue";
import { useBookmarksStore } from "../../stores/bookmarks";

const props = defineProps({
  tour: { type: Object, required: true },
  size: { type: Number, default: 19 },
});

const { t } = useI18n();
const bookmarks = useBookmarksStore();
const isSaved = computed(() => bookmarks.has(props.tour.contentid));
const label = computed(() =>
  isSaved.value ? t("tours.bookmarks.remove") : t("tours.bookmarks.add"),
);

function toggleBookmark() {
  bookmarks.toggle(props.tour);
}
</script>

<template>
  <button
    type="button"
    class="tour-bookmark-button"
    :class="{ 'is-saved': isSaved }"
    :aria-pressed="isSaved"
    :aria-label="label"
    :title="label"
    @click.stop="toggleBookmark"
  >
    <Bookmark :size="size" :fill="isSaved ? 'currentColor' : 'none'" aria-hidden="true" />
  </button>
</template>

<style scoped>
.tour-bookmark-button {
  display: inline-grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--ink-soft);
  box-shadow: 0 4px 12px rgba(15, 31, 26, 0.16);
  transition: transform 160ms ease, background 160ms ease, color 160ms ease;
}

.tour-bookmark-button:hover {
  transform: translateY(-1px);
  background: #ffffff;
  color: var(--brand-dark);
}

.tour-bookmark-button.is-saved {
  border-color: var(--brand);
  background: var(--brand);
  color: #ffffff;
}
</style>
