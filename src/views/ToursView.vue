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
      const themes = [...new Set(chunk.map(item => item.themeName).filter(Boolean))];
      const areas = [...new Set(chunk.map(item => item.areaName).filter(Boolean))];
      
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
      
      const areaPrefix = areas.length === 1 ? `${areas[0]} ` : "대전·충청 ";

      groups.push({
        id: `random-group-${count}`,
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
    <!-- 모던 히어로 배너 영역 -->
    <header class="tours-hero fade-in-up">
      <div class="hero-bg-shapes"></div>
      <div class="hero-content">
        <div class="hero-text">
          <p class="eyebrow hero-eyebrow"><MapPin :size="14" /> TRAVEL MAP</p>
          <h1>여행 지도</h1>
          <p>대전·충청의 장소를 사진과 지도 위에서 함께 살펴보세요.</p>
        </div>
        <div class="hero-stats">
          <div class="stat-badge">
            총 <strong class="result-count">{{ resultTotal.toLocaleString() }}</strong> <small>{{ isCourseMode ? "개의 코스" : "곳의 여행지" }}</small>
          </div>
        </div>
      </div>
    </header>

    <!-- 글래스모피즘 검색 바 -->
    <div class="tours-toolbar fade-in-up" style="animation-delay: 0.1s;">
      <form class="glass-search-toolbar" role="search" @submit.prevent="submitSearch">
        <div class="search-input-wrap interactive-input">
          <Search :size="19" class="search-icon" />
          <input v-model="keywordInput" type="search" placeholder="장소명이나 주소를 검색하세요" aria-label="관광지 검색" />
        </div>
        <button class="search-btn" type="submit">검색</button>
      </form>
    </div>

    <!-- 모던 스타일 카테고리 필터 -->
    <div class="type-filter modern-type-filter fade-in-up" style="animation-delay: 0.15s;" aria-label="관광지 유형">
      <ListFilter :size="18" class="filter-icon" aria-hidden="true" />
      <div class="filter-scroll-area">
        <button
          v-for="option in typeOptions"
          :key="option.value"
          type="button"
          class="filter-pill"
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
    </div>

    <!-- 모던 코스 필터 패널 -->
    <section v-if="isCourseMode" class="course-filter-panel modern-panel fade-in-up" style="animation-delay: 0.2s;" aria-label="여행코스 필터">
      <div class="course-filter-intro">
        <div class="icon-wrap"><Layers3 :size="20" aria-hidden="true" /></div>
        <div>
          <strong>지역과 테마로 코스 찾기</strong>
          <p>각 마커는 코스의 대표 위치이며, 같은 위치의 코스는 숫자로 묶어 표시합니다.</p>
        </div>
      </div>
      <div class="filter-groups-wrap">
        <div class="course-filter-group">
          <span class="group-label">지역</span>
          <div class="course-filter-options">
            <button
              v-for="option in courseAreaOptions"
              :key="option.value"
              type="button"
              class="modern-option-btn"
              :class="{ active: selectedArea === option.value }"
              @click="changeArea(option.value)"
            >
              {{ option.label }} <small>{{ optionCount("area", option.value) }}</small>
            </button>
          </div>
        </div>
        <div class="course-filter-group">
          <span class="group-label">테마</span>
          <div class="course-filter-options">
            <button
              v-for="option in courseThemeOptions"
              :key="option.value"
              type="button"
              class="modern-option-btn"
              :class="{ active: selectedTheme === option.value }"
              :disabled="optionCount('theme', option.value) === 0"
              @click="changeTheme(option.value)"
            >
              {{ option.label }} <small>{{ optionCount("theme", option.value) }}</small>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="explore-layout fade-in-up" style="animation-delay: 0.25s;">
      <aside class="map-column">
        <div class="map-wrapper-modern">
          <TourMap
            :tours="isCourseMode ? (randomCourseGroups.find(g => g.id === activeGroupId)?.items || []) : displayedMappableItems"
            :active-id="selectedId"
            :draw-path="isCourseMode"
            @select="selectedId = $event.contentid"
          />
        </div>
      </aside>

      <section class="tour-results" aria-live="polite">
        <StatePanel v-if="store.loading" type="loading" title="여행지를 불러오는 중이에요" />
        <StatePanel v-else-if="store.error" type="error" title="여행지를 불러오지 못했어요" :description="store.error" />
        
        <template v-else>
          <div v-if="isCourseMode" class="random-courses-container">
            <p v-if="missingLocationCount" class="course-location-notice modern-notice">
              위치 정보가 없는 {{ missingLocationCount }}개 코스는 제외되었습니다.
            </p>
            <div 
              v-for="group in randomCourseGroups" 
              :key="group.id" 
              class="course-route-wrap modern-route-wrap"
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
                      <MapPin :size="14" class="tiny-pin" /> {{ tour.addr1 || tour.addr2 || '주소 정보 없음' }}
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

          <div class="pagination-container">
            <AppPagination
              v-if="!isCourseMode"
              :page="store.page"
              :total-pages="store.totalPages"
              @change="changePage"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 공통 애니메이션 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 1. 히어로 배너 (여백과 정렬 개선) */
.tours-hero {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #eaf4f1 0%, #d8eae5 100%);
  margin-top: 60px; /* 👈 이 부분을 추가하여 위쪽 섹션과의 간격을 확보하세요. */
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(8, 127, 120, 0.05);
}

.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 90% 10%, rgba(8, 127, 120, 0.08) 0%, transparent 40%);
}

/* 👇 배너 안쪽 상하 여백을 56px에서 72px로 늘려 답답함을 해소했습니다. */
.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 72px 32px; 
  z-index: 1;
}

/* 👇 텍스트 덩어리와 하단 뱃지 사이의 간격을 28px에서 40px로 넉넉하게 띄웠습니다. */
.hero-text {
  margin-bottom: 40px; 
}

/* 👇 태그와 제목 사이의 간격을 20px에서 24px로 조정했습니다. */
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--brand);
  background: rgba(8, 127, 120, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 48px; /* 👈 이 값을 기존 24px에서 48px 등으로 늘려주세요. */
}

/* 👇 제목과 설명 사이의 간격을 12px에서 16px로 띄웠습니다. */
.hero-text h1 {
  font-size: 38px;
  font-weight: 900;
  color: var(--ink);
  margin-top: 24px; /* 👈 이 속성을 새롭게 추가해 보세요. */
  margin-bottom: 16px; 
  letter-spacing: -0.5px;
}

.hero-text p {
  font-size: 16px;
  color: var(--ink-soft);
  margin: 0;
  line-height: 1.6;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  color: var(--muted);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--line);
}

.stat-badge strong {
  color: var(--brand-dark);
  font-size: 20px;
  margin: 0 6px;
}

/* 2. 글래스모피즘 툴바 및 검색창 */
.tours-toolbar {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.glass-search-toolbar {
  display: flex;
  flex: 1;
  max-width: 720px; /* 검색창 넓게 사용 */
  gap: 12px;
}

.interactive-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 0 16px;
  height: 56px; /* 높이 키움 */
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.interactive-input:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(8, 127, 120, 0.1);
  transform: translateY(-2px);
}

.search-icon {
  color: var(--muted);
  transition: color 0.3s ease;
}

.interactive-input:focus-within .search-icon {
  color: var(--brand);
}

.interactive-input input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 12px;
  font-size: 16px;
  color: var(--ink);
  outline: none;
}

.search-btn {
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink-soft);
  font-weight: 800;
  border-radius: 14px;
  padding: 0 28px;
  height: 56px;
  font-size: 15px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.search-btn:hover {
  background: #f7f9f8;
  border-color: #c9d4cf;
  color: var(--ink);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 3. 모던 타입 필터 (버튼 칩스) */
.modern-type-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.filter-icon {
  color: var(--muted);
  flex-shrink: 0;
}

.filter-scroll-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 4px; /* 스크롤바 여백 */
}

/* 스크롤바 숨김 처리 */
.filter-scroll-area::-webkit-scrollbar { display: none; }
.filter-scroll-area { -ms-overflow-style: none; scrollbar-width: none; }

.filter-pill {
  white-space: nowrap;
  padding: 10px 18px;
  border-radius: 24px;
  border: 1px solid var(--line);
  background: var(--surface-alt);
  color: var(--ink-soft);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  background: #f0f7f4;
  color: var(--ink);
  border-color: #c9d4cf;
}

.filter-pill.active {
  background: var(--brand);
  color: #ffffff;
  border-color: var(--brand);
  box-shadow: 0 4px 12px rgba(8, 127, 120, 0.2);
}

.filter-divider {
  width: 1px;
  height: 24px;
  background-color: var(--line);
  margin: 0 8px;
  flex-shrink: 0;
}

.special-course-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  white-space: nowrap;
  min-height: 40px;
  padding: 0 20px;
  border: 1px solid var(--coral);
  border-radius: 24px;
  background: #fff8f6;
  color: var(--coral-dark);
  font-size: 14px;
  font-weight: 800;
  transition: all 0.3s ease;
}

.special-course-btn:hover {
  background: #fceae6;
  transform: translateY(-2px);
}

.special-course-btn.active {
  background: var(--coral);
  border-color: var(--coral);
  color: #fff;
  box-shadow: 0 6px 16px rgba(214, 83, 55, 0.25);
}

/* 4. 코스 필터 패널 (글래스 카드 스타일) */
.modern-panel {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.course-filter-intro {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrap {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f0f7f4;
  color: var(--brand);
}

.course-filter-intro strong {
  font-size: 17px;
  color: var(--ink);
  display: block;
  margin-bottom: 4px;
}

.course-filter-intro p {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

.filter-groups-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 24px;
  border-top: 1px dashed var(--line);
}

.course-filter-group {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.group-label {
  font-weight: 800;
  color: var(--ink-soft);
  width: 48px;
  padding-top: 8px;
}

.course-filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.modern-option-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--ink-soft);
  font-size: 14px;
  transition: all 0.2s ease;
}

.modern-option-btn:hover:not(:disabled) {
  background: var(--surface-alt);
  border-color: #c9d4cf;
}

.modern-option-btn.active {
  background: var(--ink);
  color: #ffffff;
  border-color: var(--ink);
}

.modern-option-btn:disabled {
  opacity: 0.5;
  background: var(--surface-alt);
  cursor: not-allowed;
}

.modern-option-btn small {
  margin-left: 4px;
  opacity: 0.7;
}

/* 5. 맵 레이아웃 & 둥근 모서리 강화 */
.map-wrapper-modern {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--line);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 200px);
  min-height: 500px;
}

/* 6. 랜덤 코스 묶음 디자인 (타임라인) */
.random-courses-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modern-route-wrap {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-route-wrap:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  border-color: #c9d4cf;
}

.modern-route-wrap.active-group {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(8, 127, 120, 0.1), 0 12px 30px rgba(0, 0, 0, 0.06);
}

.group-title {
  font-size: 20px;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 28px;
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
  gap: 20px;
}

.step-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--brand);
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 2px var(--brand);
  z-index: 1;
}

.marker-line {
  flex: 1;
  width: 2px;
  background-color: var(--line);
  margin-top: 6px;
  margin-bottom: 6px;
  min-height: 48px;
}

.step-content {
  padding-bottom: 24px;
  display: block;
  text-decoration: none;
}

.step-content:hover .step-title {
  color: var(--brand);
}

.step-title {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: var(--ink);
  transition: color 0.2s;
}

.step-desc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

.tiny-pin {
  color: var(--muted);
}

.modern-notice {
  margin: 0 0 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff0ed;
  color: var(--coral-dark);
  font-size: 13px;
  font-weight: 600;
  border-left: 3px solid var(--coral);
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

@media (max-width: 820px) {
  .hero-content {
    padding: 40px 24px;
  }
  
  .modern-type-filter {
    padding: 12px 16px;
  }
  
  .course-filter-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>