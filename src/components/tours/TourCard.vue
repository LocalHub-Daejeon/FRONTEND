<script setup>
import { computed } from "vue";
import { ArrowUpRight, MapPin } from "@lucide/vue";
import { fallbackImage, onImageError } from "../../utils/format";

const props = defineProps({
  tour: { type: Object, required: true },
  regionLabel: { type: String, default: "" },
  themeLabel: { type: String, default: "" },
});

const locationText = computed(() => {
  if (!props.regionLabel) return props.tour.addr1 || "주소 정보 없음";
  return [props.regionLabel, props.tour.addr1].filter(Boolean).join(" · ") || "대표 위치 정보 없음";
});
</script>

<template>
  <RouterLink class="tour-card modern-tour-card" :to="`/tours/${tour.contentid}`">
    <div class="tour-card-media">
      <img
        :src="tour.firstimage || fallbackImage"
        :alt="`${tour.title} 관광지 사진`"
        loading="lazy"
        @error="onImageError"
      />
      <div class="media-overlay"></div>
      <span class="category-chip glass-chip">{{ themeLabel ? `${themeLabel} 코스` : tour.contentType || "관광지" }}</span>
    </div>
    <div class="tour-card-body">
      <div class="text-content">
        <h3 class="tour-title" :title="tour.title">{{ tour.title }}</h3>
        <p class="tour-location">
          <MapPin :size="15" class="pin-icon" />
          <span class="location-text">{{ locationText }}</span>
        </p>
      </div>
      <div class="action-icon-wrap">
        <ArrowUpRight class="card-arrow" :size="20" aria-hidden="true" />
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
/* 카드 전체 래퍼 디자인 */
.modern-tour-card {
  display: grid;
  grid-template-rows: 200px auto;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px; /* 둥글기를 조금 더 부드럽게 */
  background: var(--surface);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  position: relative;
  text-decoration: none;
}

.modern-tour-card:hover {
  border-color: transparent;
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

/* 상단 미디어 영역 */
.tour-card-media {
  position: relative;
  overflow: hidden;
  background: var(--surface-alt);
}

.tour-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-tour-card:hover .tour-card-media img {
  transform: scale(1.08);
}

/* 이미지 위에 깔리는 은은한 그라데이션 오버레이 (텍스트 가독성 및 고급스러움) */
.media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.15) 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.modern-tour-card:hover .media-overlay {
  opacity: 1;
}

/* 글래스모피즘 스타일이 적용된 카테고리 칩 */
.glass-chip {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: var(--brand-dark);
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.modern-tour-card:hover .glass-chip {
  background: var(--brand);
  color: #ffffff;
  border-color: var(--brand);
}

/* 하단 텍스트 및 정보 영역 */
.tour-card-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tour-title {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.3s ease;
}

.modern-tour-card:hover .tour-title {
  color: var(--brand-dark);
}

.tour-location {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.pin-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--brand);
  opacity: 0.8;
}

.location-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 액션 화살표 아이콘 영역 */
.action-icon-wrap {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-alt);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-arrow {
  color: var(--ink-soft);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-tour-card:hover .action-icon-wrap {
  background: var(--brand);
  transform: rotate(45deg); /* 호버 시 회전 액션 */
}

.modern-tour-card:hover .card-arrow {
  color: #ffffff;
}
</style>