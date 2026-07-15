<script setup>
import { onMounted, ref } from "vue";
import StatePanel from "../components/common/StatePanel.vue";
import FestivalCalendar from "../components/tours/FestivalCalendar.vue";
import { toursApi } from "../services/api";

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
        <p class="eyebrow dark">FESTIVAL CALENDAR</p>
        <h1>축제 캘린더</h1>
        <p>대전·충청의 축제 일정을 월별·권역별로 확인해보세요.</p>
      </div>
      <strong v-if="!loading && !error" class="result-count">
        {{ festivals.length.toLocaleString() }}<small>축제</small>
      </strong>
    </header>

    <section aria-live="polite">
      <StatePanel v-if="loading" type="loading" title="축제 일정을 불러오는 중이에요" />
      <StatePanel
        v-else-if="error"
        type="error"
        title="축제 일정을 불러오지 못했어요"
        :description="error"
      />
      <StatePanel
        v-else-if="!festivals.length"
        title="등록된 축제가 없어요"
        description="새로운 축제 일정이 등록되면 이곳에서 확인할 수 있어요."
      />
      <FestivalCalendar v-else :festivals="festivals" />
    </section>
  </div>
</template>
