<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ListFilter, MapPin, Search } from "@lucide/vue";
import AppPagination from "../components/common/AppPagination.vue";
import StatePanel from "../components/common/StatePanel.vue";
import TourCard from "../components/tours/TourCard.vue";
import TourMap from "../components/tours/TourMap.vue";
import { useToursStore } from "../stores/tours";

const route = useRoute();
const router = useRouter();
const store = useToursStore();
const keywordInput = ref(String(route.query.keyword || ""));
const selectedId = ref("");

const typeOptions = [
  { value: "", label: "전체" },
  { value: "12", label: "관광지" },
  { value: "14", label: "문화시설" },
  { value: "15", label: "축제·행사" },
  { value: "25", label: "여행코스" },
  { value: "28", label: "레포츠" },
  { value: "32", label: "숙박" },
  { value: "38", label: "쇼핑" },
  { value: "39", label: "음식점" },
];

const selectedTour = computed(() =>
  store.items.find((tour) => String(tour.contentid) === String(selectedId.value)),
);

async function fetchTours(overrides = {}) {
  await store.fetchTours(overrides);
  selectedId.value = store.items[0]?.contentid || "";
}

function submitSearch() {
  router.replace({ query: keywordInput.value ? { keyword: keywordInput.value } : {} });
  fetchTours({ keyword: keywordInput.value.trim(), page: 1 });
}

function changeType(value) {
  store.contentTypeId = value;
  fetchTours({ page: 1 });
}

function changePage(page) {
  fetchTours({ page });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => fetchTours({ keyword: keywordInput.value, page: 1 }));
</script>

<template>
  <div class="page-width page-view tours-view">
    <header class="page-heading compact-heading">
      <div>
        <p class="eyebrow dark">TRAVEL MAP</p>
        <h1>여행 지도</h1>
        <p>대전·충청의 장소를 사진과 지도 위에서 함께 살펴보세요.</p>
      </div>
      <strong class="result-count">{{ store.total.toLocaleString() }}<small>곳</small></strong>
    </header>

    <form class="search-toolbar" role="search" @submit.prevent="submitSearch">
      <div class="search-input-wrap">
        <Search :size="19" />
        <input v-model="keywordInput" type="search" placeholder="장소명이나 주소를 검색하세요" aria-label="관광지 검색" />
      </div>
      <button class="primary-button" type="submit">검색</button>
    </form>

    <div class="type-filter" aria-label="관광지 유형">
      <ListFilter :size="18" aria-hidden="true" />
      <button
        v-for="option in typeOptions"
        :key="option.value"
        type="button"
        :class="{ active: store.contentTypeId === option.value }"
        @click="changeType(option.value)"
      >{{ option.label }}</button>
    </div>

    <div class="explore-layout">
      <aside class="map-column">
        <TourMap :tours="store.mappableItems" :active-id="selectedId" @select="selectedId = $event.contentid" />
        <RouterLink v-if="selectedTour" class="map-result-bar" :to="`/tours/${selectedTour.contentid}`">
          <MapPin :size="18" />
          <span><strong>{{ selectedTour.title }}</strong><small>{{ selectedTour.addr1 }}</small></span>
        </RouterLink>
      </aside>

      <section class="tour-results" aria-live="polite">
        <StatePanel v-if="store.loading" type="loading" title="여행지를 불러오는 중이에요" />
        <StatePanel v-else-if="store.error" type="error" title="여행지를 불러오지 못했어요" :description="store.error" />
        <StatePanel v-else-if="!store.items.length" title="조건에 맞는 여행지가 없어요" description="검색어나 유형을 바꿔보세요." />
        <template v-else>
          <div class="tour-grid">
            <TourCard v-for="tour in store.items" :key="tour.contentid" :tour="tour" />
          </div>
          <AppPagination :page="store.page" :total-pages="store.totalPages" @change="changePage" />
        </template>
      </section>
    </div>
  </div>
</template>
