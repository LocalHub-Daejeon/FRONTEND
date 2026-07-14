<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, ExternalLink, MapPin, Phone, Route, Sparkles } from "@lucide/vue";
import StatePanel from "../components/common/StatePanel.vue";
import TourMap from "../components/tours/TourMap.vue";
import { useToursStore } from "../stores/tours";
import { fallbackImage, onImageError } from "../utils/format";

const route = useRoute();
const store = useToursStore();
const tour = computed(() => store.selected);
const hasCoordinates = computed(() => Number(tour.value?.mapx) && Number(tour.value?.mapy));
const directionsUrl = computed(() => {
  if (!hasCoordinates.value) return "";
  return `https://www.google.com/maps/dir/?api=1&destination=${tour.value.mapy},${tour.value.mapx}`;
});

onMounted(() => store.fetchTour(route.params.contentId).catch(() => {}));
</script>

<template>
  <div class="page-width page-view detail-view">
    <RouterLink class="back-link" to="/tours"><ArrowLeft :size="18" /> 여행 지도로 돌아가기</RouterLink>
    <StatePanel v-if="store.detailLoading" type="loading" title="장소 정보를 불러오는 중이에요" />
    <StatePanel v-else-if="store.error" type="error" title="장소 정보를 찾지 못했어요" :description="store.error" />

    <template v-else-if="tour">
      <section class="tour-detail-hero">
        <img :src="tour.firstimage || tour.firstimage2 || fallbackImage" :alt="`${tour.title} 전경`" @error="onImageError" />
        <div class="tour-detail-overlay">
          <span class="category-chip">{{ tour.contentType || "관광지" }}</span>
          <h1>{{ tour.title }}</h1>
          <p><MapPin :size="18" /> {{ [tour.addr1, tour.addr2].filter(Boolean).join(" ") }}</p>
        </div>
      </section>

      <div class="detail-content-grid">
        <section class="place-info">
          <div class="section-heading">
            <div><p class="section-kicker">PLACE INFO</p><h2>방문 정보</h2></div>
          </div>
          <dl class="info-list">
            <div><dt><MapPin :size="18" /> 주소</dt><dd>{{ [tour.addr1, tour.addr2].filter(Boolean).join(" ") || "정보 없음" }}</dd></div>
            <div><dt><Phone :size="18" /> 문의</dt><dd>{{ tour.tel || "정보 없음" }}</dd></div>
            <div><dt><Route :size="18" /> 우편번호</dt><dd>{{ tour.zipcode || "정보 없음" }}</dd></div>
          </dl>
          <RouterLink class="community-prompt" to="/community">
            <Sparkles :size="20" />
            <span><strong>이곳에 다녀오셨나요?</strong><small>나만의 팁과 여행 경험을 커뮤니티에 남겨주세요.</small></span>
          </RouterLink>
        </section>

        <aside class="detail-map-panel">
          <TourMap v-if="hasCoordinates" :tours="[tour]" :active-id="tour.contentid" single />
          <StatePanel v-else title="등록된 위치 정보가 없어요" />
          <a v-if="directionsUrl" class="secondary-button full-button" :href="directionsUrl" target="_blank" rel="noreferrer">
            길찾기 <ExternalLink :size="16" />
          </a>
        </aside>
      </div>
    </template>
  </div>
</template>
