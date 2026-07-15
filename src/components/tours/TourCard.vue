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
  <RouterLink class="tour-card" :to="`/tours/${tour.contentid}`">
    <div class="tour-card-media">
      <img
        :src="tour.firstimage || fallbackImage"
        :alt="`${tour.title} 관광지 사진`"
        loading="lazy"
        @error="onImageError"
      />
      <span class="category-chip">{{ themeLabel ? `${themeLabel} 코스` : tour.contentType || "관광지" }}</span>
    </div>
    <div class="tour-card-body">
      <div>
        <h3>{{ tour.title }}</h3>
        <p><MapPin :size="15" />{{ locationText }}</p>
      </div>
      <ArrowUpRight class="card-arrow" :size="19" aria-hidden="true" />
    </div>
  </RouterLink>
</template>
