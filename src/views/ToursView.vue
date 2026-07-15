<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Layers3, ListFilter, MapPin, Search } from "@lucide/vue";
import AppPagination from "../components/common/AppPagination.vue";
import StatePanel from "../components/common/StatePanel.vue";
import TourCard from "../components/tours/TourCard.vue";
import TourMap from "../components/tours/TourMap.vue";
import {
  courseAreaOptions,
  courseThemeOptions,
  enrichTravelCourse,
} from "../data/travelCourseMeta";
import { useToursStore } from "../stores/tours";

const route = useRoute();
const router = useRouter();
const store = useToursStore();
const keywordInput = ref(String(route.query.keyword || ""));
const selectedId = ref("");
const selectedArea = ref("");
const selectedTheme = ref("");

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

const isCourseMode = computed(() => String(store.contentTypeId) === "25");
const enrichedCourses = computed(() => store.items.map(enrichTravelCourse));
const displayedItems = computed(() => {
  if (!isCourseMode.value) return store.items;
  return enrichedCourses.value.filter(
    (course) =>
      (!selectedArea.value || course.areaCode === selectedArea.value) &&
      (!selectedTheme.value || course.themeCode === selectedTheme.value),
  );
});
const displayedMappableItems = computed(() =>
  displayedItems.value.filter((item) => Number(item.mapx) && Number(item.mapy)),
);
const selectedTour = computed(() =>
  displayedItems.value.find((tour) => String(tour.contentid) === String(selectedId.value)),
);
const resultTotal = computed(() => (isCourseMode.value ? displayedItems.value.length : store.total));
const missingLocationCount = computed(
  () => displayedItems.value.length - displayedMappableItems.value.length,
);

function optionCount(type, value) {
  if (!isCourseMode.value) return 0;
  if (type === "area") {
    return enrichedCourses.value.filter(
      (course) =>
        (!value || course.areaCode === value) &&
        (!selectedTheme.value || course.themeCode === selectedTheme.value),
    ).length;
  }
  return enrichedCourses.value.filter(
    (course) =>
      (!selectedArea.value || course.areaCode === selectedArea.value) &&
      (!value || course.themeCode === value),
  ).length;
}

function syncSelectedTour() {
  if (!displayedItems.value.some((tour) => String(tour.contentid) === String(selectedId.value))) {
    selectedId.value = displayedMappableItems.value[0]?.contentid || displayedItems.value[0]?.contentid || "";
  }
}

async function fetchTours(overrides = {}) {
  await store.fetchTours({ size: isCourseMode.value ? 100 : 12, ...overrides });
  syncSelectedTour();
}

function submitSearch() {
  router.replace({
    query: {
      ...(keywordInput.value ? { keyword: keywordInput.value } : {}),
      ...(store.contentTypeId ? { type: store.contentTypeId } : {}),
    },
  });
  fetchTours({ keyword: keywordInput.value.trim(), page: 1 });
}

function changeType(value) {
  store.contentTypeId = value;
  router.replace({
    query: {
      ...(keywordInput.value ? { keyword: keywordInput.value } : {}),
      ...(value ? { type: value } : {}),
    },
  });
  selectedArea.value = "";
  selectedTheme.value = "";
  selectedId.value = "";
  fetchTours({ page: 1, size: value === "25" ? 100 : 12 });
}

function changeArea(value) {
  selectedArea.value = value;
  if (selectedTheme.value && !optionCount("theme", selectedTheme.value)) {
    selectedTheme.value = "";
  }
  syncSelectedTour();
}

function changeTheme(value) {
  selectedTheme.value = value;
  syncSelectedTour();
}

function changePage(page) {
  fetchTours({ page });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

watch(displayedItems, syncSelectedTour);
onMounted(() => {
  const queryType = String(route.query.type || "");
  if (typeOptions.some((option) => option.value === queryType)) {
    store.contentTypeId = queryType;
  }
  fetchTours({ keyword: keywordInput.value, page: 1 });
});
</script>

<template>
  <div class="page-width page-view tours-view">
    <header class="page-heading compact-heading">
      <div>
        <p class="eyebrow dark">TRAVEL MAP</p>
        <h1>여행 지도</h1>
        <p>대전·충청의 장소를 사진과 지도 위에서 함께 살펴보세요.</p>
      </div>
      <strong class="result-count">
        {{ resultTotal.toLocaleString() }}<small>{{ isCourseMode ? "코스" : "곳" }}</small>
      </strong>
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

    <section v-if="isCourseMode" class="course-filter-panel" aria-label="여행코스 필터">
      <div class="course-filter-intro">
        <Layers3 :size="20" aria-hidden="true" />
        <div>
          <strong>지역과 테마로 코스 찾기</strong>
          <p>각 마커는 코스의 대표 위치이며, 같은 위치의 코스는 숫자로 묶어 표시합니다.</p>
        </div>
      </div>
      <div class="course-filter-group">
        <span>지역</span>
        <div class="course-filter-options">
          <button
            v-for="option in courseAreaOptions"
            :key="option.value"
            type="button"
            :class="{ active: selectedArea === option.value }"
            @click="changeArea(option.value)"
          >
            {{ option.label }} <small>{{ optionCount("area", option.value) }}</small>
          </button>
        </div>
      </div>
      <div class="course-filter-group">
        <span>테마</span>
        <div class="course-filter-options">
          <button
            v-for="option in courseThemeOptions"
            :key="option.value"
            type="button"
            :class="{ active: selectedTheme === option.value }"
            :disabled="optionCount('theme', option.value) === 0"
            @click="changeTheme(option.value)"
          >
            {{ option.label }} <small>{{ optionCount("theme", option.value) }}</small>
          </button>
        </div>
      </div>
    </section>

    <div class="explore-layout">
      <aside class="map-column">
        <TourMap
          :tours="displayedMappableItems"
          :active-id="selectedId"
          :group-overlaps="isCourseMode"
          @select="selectedId = $event.contentid"
        />
        <RouterLink v-if="selectedTour" class="map-result-bar" :to="`/tours/${selectedTour.contentid}`">
          <MapPin :size="18" />
          <span>
            <strong>{{ selectedTour.title }}</strong>
            <small v-if="isCourseMode">{{ selectedTour.areaName }} · {{ selectedTour.themeName }} 코스</small>
            <small v-else>{{ selectedTour.addr1 }}</small>
          </span>
        </RouterLink>
      </aside>

      <section class="tour-results" aria-live="polite">
        <StatePanel v-if="store.loading" type="loading" title="여행지를 불러오는 중이에요" />
        <StatePanel v-else-if="store.error" type="error" title="여행지를 불러오지 못했어요" :description="store.error" />
        <StatePanel
          v-else-if="!displayedItems.length"
          :title="isCourseMode ? '조건에 맞는 여행코스가 없어요' : '조건에 맞는 여행지가 없어요'"
          description="검색어나 필터를 바꿔보세요."
        />
        <template v-else>
          <p v-if="isCourseMode && missingLocationCount" class="course-location-notice">
            위치 정보가 없는 {{ missingLocationCount }}개 코스는 목록에서만 확인할 수 있습니다.
          </p>
          <div class="tour-grid">
            <TourCard
              v-for="tour in displayedItems"
              :key="tour.contentid"
              :tour="tour"
              :region-label="isCourseMode ? tour.areaName : ''"
              :theme-label="isCourseMode ? tour.themeName : ''"
            />
          </div>
          <AppPagination
            v-if="!isCourseMode"
            :page="store.page"
            :total-pages="store.totalPages"
            @change="changePage"
          />
        </template>
      </section>
    </div>
  </div>
</template>
