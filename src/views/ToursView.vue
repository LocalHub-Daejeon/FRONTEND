<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Layers3, ListFilter, MapPin, Search, Sparkles } from "@lucide/vue";
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

const randomCourseGroups = ref([]);
const activeGroupId = ref("");

const typeOptions = [
  { value: "", label: "전체" },
  { value: "12", label: "관광지" },
  { value: "14", label: "문화시설" },
  { value: "15", label: "축제·행사" },
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
const resultTotal = computed(() => (isCourseMode.value ? displayedItems.value.length : store.total));
const missingLocationCount = computed(
  () => displayedItems.value.length - displayedMappableItems.value.length,
);

// 무작위로 3~4개씩 데이터를 묶고 포함된 데이터 특성에 따라 제목을 자동 생성하는 함수
function generateRandomGroups(items) {
  if (!isCourseMode.value) {
    randomCourseGroups.value = [];
    return;
  }

  const validItems = items.filter(item => Number(item.mapx) && Number(item.mapy));
  const shuffled = [...validItems].sort(() => 0.5 - Math.random());

  const groups = [];
  let index = 0;
  let count = 1;

  while (index < shuffled.length) {
    const chunkSize = Math.floor(Math.random() * 2) + 3;
    const chunk = shuffled.slice(index, index + chunkSize);

    if (chunk.length >= 2) {
      // 1. 그룹 내 코스들의 테마와 지역 데이터 수집
      const themes = [...new Set(chunk.map(item => item.themeName).filter(Boolean))];
      const areas = [...new Set(chunk.map(item => item.areaName).filter(Boolean))];
      
      // 2. 테마에 따른 키워드 및 이모지 동적 할당
      let emoji = "📍";
      let themeKeyword = "다채로운 매력의";
      
      if (themes.includes("힐링")) {
        emoji = "🌿"; 
        themeKeyword = "여유로운 힐링";
      } else if (themes.includes("가족")) {
        emoji = "👨‍👩‍👧‍👦"; 
        themeKeyword = "가족과 함께하는";
      } else if (themes.includes("캠핑")) {
        emoji = "🏕️"; 
        themeKeyword = "자연 속 캠핑";
      } else if (themes.includes("도보")) {
        emoji = "👟"; 
        themeKeyword = "뚜벅이 도보 여행";
      }
      
      // 3. 지역 이름 설정 (모두 같은 지역이면 해당 지역명, 아니면 대전·충청)
      const areaPrefix = areas.length === 1 ? `${areas[0]} ` : "대전·충청 ";

      groups.push({
        id: `random-group-${count}`,
        // 👇 A, B, C 알파벳을 빼고 깔끔하게 출력
        title: `${emoji} ${areaPrefix}${themeKeyword} 코스`,
        items: chunk
      });
      count++;
    }
    index += chunkSize;
  }

  randomCourseGroups.value = groups;
  if (groups.length > 0) {
    activeGroupId.value = groups[0].id;
  }
}

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

async function fetchTours(overrides = {}) {
  await store.fetchTours({ size: isCourseMode.value ? 100 : 12, ...overrides });
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
}

function changeTheme(value) {
  selectedTheme.value = value;
}

function changePage(page) {
  fetchTours({ page });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

watch(displayedItems, (newItems) => {
  generateRandomGroups(newItems);
});

onMounted(() => {
  const queryType = String(route.query.type || "");
  if (typeOptions.some((option) => option.value === queryType) || queryType === "25") {
    store.contentTypeId = queryType;
  }
  fetchTours({ keyword: keywordInput.value, page: 1 }).then(() => {
    generateRandomGroups(displayedItems.value);
  });
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

      <div class="filter-divider"></div>

      <button
        class="special-course-btn"
        :class="{ active: store.contentTypeId === '25' }"
        @click="changeType('25')"
      >
        <Sparkles :size="16" /> 추천 여행코스
      </button>
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
          :tours="isCourseMode ? (randomCourseGroups.find(g => g.id === activeGroupId)?.items || []) : displayedMappableItems"
          :active-id="selectedId"
          :draw-path="isCourseMode"
          @select="selectedId = $event.contentid"
        />
      </aside>

      <section class="tour-results" aria-live="polite">
        <StatePanel v-if="store.loading" type="loading" title="여행지를 불러오는 중이에요" />
        <StatePanel v-else-if="store.error" type="error" title="여행지를 불러오지 못했어요" :description="store.error" />
        
        <template v-else>
          <div v-if="isCourseMode" class="random-courses-container">
            <p v-if="missingLocationCount" class="course-location-notice">
              위치 정보가 없는 {{ missingLocationCount }}개 코스는 제외되었습니다.
            </p>
            <div 
              v-for="group in randomCourseGroups" 
              :key="group.id" 
              class="course-route-wrap"
              :class="{ 'active-group': activeGroupId === group.id }"
              @click="activeGroupId = group.id"
            >
              <h2 class="group-title">{{ group.title }}</h2>
              <ol class="route-timeline">
                <li v-for="(tour, index) in group.items" :key="tour.contentid" class="route-step">
                  <div class="step-marker">
                    <span class="marker-dot"></span>
                    <div v-if="index !== group.items.length - 1" class="marker-line"></div>
                  </div>
                  <RouterLink :to="`/tours/${tour.contentid}`" class="step-content">
                    <h3 class="step-title">{{ tour.title }}</h3>
                    <p class="step-desc">
                      <MapPin :size="14" /> {{ tour.addr1 || tour.addr2 || '주소 정보 없음' }}
                    </p>
                  </RouterLink>
                </li>
              </ol>
            </div>
          </div>
          
          <div v-else class="tour-grid">
            <TourCard
              v-for="tour in displayedItems"
              :key="tour.contentid"
              :tour="tour"
              :region-label="tour.areaName || ''"
              :theme-label="tour.themeName || ''"
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

<style scoped>
.filter-divider {
  width: 1px;
  height: 20px;
  background-color: var(--line);
  margin: 0 4px;
  flex-shrink: 0;
}

.special-course-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid var(--coral);
  border-radius: 6px;
  background: #fff8f6;
  color: var(--coral-dark);
  font-size: 13px;
  font-weight: 800;
  transition: all 0.2s ease;
}

.special-course-btn:hover {
  background: #fceae6;
}

.special-course-btn.active {
  background: var(--coral);
  border-color: var(--coral);
  color: #fff;
  box-shadow: 0 4px 12px rgba(214, 83, 55, 0.25);
}

.random-courses-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.course-route-wrap {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.course-route-wrap:hover {
  border-color: #9dafaa;
}

.course-route-wrap.active-group {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(8, 127, 120, 0.12);
}

.group-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--brand-dark);
}

.route-timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.route-step {
  display: flex;
  gap: 1.2rem;
}

.step-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--brand);
  border: 3px solid var(--surface);
  box-shadow: 0 0 0 2px var(--brand);
  z-index: 1;
}

.marker-line {
  flex: 1;
  width: 2px;
  background-color: var(--line);
  margin-top: 4px;
  margin-bottom: 4px;
  min-height: 40px;
}

.step-content {
  padding-bottom: 1.5rem;
  display: block;
}

.step-content:hover .step-title {
  color: var(--brand);
}

.step-title {
  font-size: 1.05rem;
  font-weight: 750;
  margin: 0 0 0.3rem 0;
  color: var(--ink);
  transition: color 0.2s;
}

.step-desc {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
}

.course-location-notice {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #fff6e7;
  color: #79531e;
  font-size: 12px;
}
</style>