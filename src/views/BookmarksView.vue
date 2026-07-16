<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import StatePanel from "../components/common/StatePanel.vue";
import TourCard from "../components/tours/TourCard.vue";
import TourMap from "../components/tours/TourMap.vue";
import { useBookmarksStore } from "../stores/bookmarks";

const { t } = useI18n();
const bookmarks = useBookmarksStore();
const mappableBookmarks = computed(() =>
  bookmarks.items.filter((item) => Number(item.mapx) && Number(item.mapy)),
);
</script>

<template>
  <div class="page-width page-view bookmarks-view">
    <header class="page-heading compact-heading">
      <div>
        <p class="eyebrow dark">SAVED PLACES</p>
        <h1>{{ t("tours.bookmarks.title") }}</h1>
        <p>{{ t("tours.bookmarks.description") }}</p>
      </div>
      <strong class="result-count">
        {{ bookmarks.count }}<small>{{ t("tours.bookmarks.unit") }}</small>
      </strong>
    </header>

    <StatePanel
      v-if="!bookmarks.count"
      :title="t('tours.bookmarks.emptyTitle')"
      :description="t('tours.bookmarks.emptyDescription')"
    />
    <div v-else class="explore-layout">
      <aside class="map-column">
        <TourMap
          v-if="mappableBookmarks.length"
          :tours="mappableBookmarks"
          :draw-path="mappableBookmarks.length > 1"
        />
        <StatePanel v-else :title="t('tours.bookmarks.noLocation')" />
      </aside>
      <section class="tour-grid bookmark-grid">
        <TourCard v-for="tour in bookmarks.items" :key="tour.contentid" :tour="tour" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.bookmark-grid {
  padding-bottom: 8px;
}
</style>
