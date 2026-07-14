<script setup>
import { ArrowUpRight, MapPin } from "@lucide/vue";
import { fallbackImage, onImageError } from "../../utils/format";

defineProps({ tour: { type: Object, required: true } });
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
      <span class="category-chip">{{ tour.contentType || "관광지" }}</span>
    </div>
    <div class="tour-card-body">
      <div>
        <h3>{{ tour.title }}</h3>
        <p><MapPin :size="15" />{{ tour.addr1 || "주소 정보 없음" }}</p>
      </div>
      <ArrowUpRight class="card-arrow" :size="19" aria-hidden="true" />
    </div>
  </RouterLink>
</template>
