<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import StatePanel from "../components/common/StatePanel.vue";
import FestivalCalendar from "../components/tours/FestivalCalendar.vue";
import { toursApi } from "../services/api";

const { t } = useI18n();
const festivals = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchFestivals() {
  loading.value = true;
  error.value = "";

  try {
    const data = await toursApi.getAll({ content_type_id: 15, page: 1, size: 100 });
    festivals.value = data.items || [];
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchFestivals);
</script>

<template>
  <div class="page-width page-view festival-page">
    <header class="page-heading compact-heading">
      <div>
        <p class="eyebrow dark">{{ t("tours.festival.eyebrow") }}</p>
        <h1>{{ t("festivalPage.title") }}</h1>
        <p>{{ t("festivalPage.description") }}</p>
      </div>
      <strong v-if="!loading && !error" class="result-count">
        {{ festivals.length.toLocaleString() }}<small>{{ t("festivalPage.unit") }}</small>
      </strong>
    </header>

    <section aria-live="polite">
      <StatePanel v-if="loading" type="loading" :title="t('tours.loading.festival')" />
      <StatePanel
        v-else-if="error"
        type="error"
        :title="t('tours.error.festival')"
        :description="error"
      />
      <StatePanel
        v-else-if="!festivals.length"
        :title="t('tours.empty.festivalTitle')"
        :description="t('festivalPage.emptyDescription')"
      />
      <FestivalCalendar v-else :festivals="festivals" />
    </section>
  </div>
</template>
