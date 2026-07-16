<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowLeft, ExternalLink, MapPin, Phone, Route, Sparkles } from "@lucide/vue";
import ShareButtons from "../components/common/ShareButtons.vue";
import StatePanel from "../components/common/StatePanel.vue";
import TourMap from "../components/tours/TourMap.vue";
import { useToursStore } from "../stores/tours";
import { fallbackImage, onImageError } from "../utils/format";

const { t } = useI18n();
const route = useRoute();
const store = useToursStore();
const tour = computed(() => store.selected);
const hasCoordinates = computed(() => Number(tour.value?.mapx) && Number(tour.value?.mapy));
const directionsUrl = computed(() => {
  if (!hasCoordinates.value) return "";
  return `https://www.google.com/maps/dir/?api=1&destination=${tour.value.mapy},${tour.value.mapx}`;
});
const shareDescription = computed(() =>
  [tour.value?.addr1, tour.value?.addr2].filter(Boolean).join(" "),
);

onMounted(() => store.fetchTour(route.params.contentId).catch(() => {}));
</script>

<template>
  <div class="page-width page-view detail-view">
    <RouterLink class="back-link modern-back fade-in-up" to="/tours">
      <div class="back-icon-wrap"><ArrowLeft :size="18" stroke-width="2.5" /></div>
      <span>{{ t("tourDetail.backToMap") }}</span>
    </RouterLink>

    <StatePanel v-if="store.detailLoading" type="loading" :title="t('tourDetail.loading')" />
    <StatePanel v-else-if="store.error" type="error" :title="t('tourDetail.error')" :description="store.error" />

    <template v-else-if="tour">
      <!-- 👇 tour-detail-hero 클래스를 제거하여 main.css의 강제 덮개를 완벽히 차단했습니다 -->
      <section class="modern-hero fade-in-up" style="animation-delay: 0.1s;">
        <img class="hero-bg" :src="tour.firstimage || tour.firstimage2 || fallbackImage" :alt="t('tourDetail.heroAlt', { title: tour.title })" @error="onImageError" />
        <div class="hero-overlay">
          <span class="category-chip glass-chip">{{ tour.contentType || t("tours.card.defaultCategory") }}</span>
          <h1 class="hero-title">{{ tour.title }}</h1>
          <p class="hero-address"><MapPin :size="18" /> {{ [tour.addr1, tour.addr2].filter(Boolean).join(" ") }}</p>
        </div>
      </section>

      <div class="detail-content-grid modern-grid fade-in-up" style="animation-delay: 0.2s;">
        <section class="place-info">
          <div class="section-heading">
            <div>
              <p class="section-kicker brand-kicker">{{ t("tourDetail.kicker") }}</p>
              <h2>{{ t("tourDetail.heading") }}</h2>
            </div>
          </div>

          <dl class="info-list modern-info-list">
            <div class="info-row">
              <dt>
                <div class="icon-bubble"><MapPin :size="18" /></div> {{ t("tourDetail.address") }}
              </dt>
              <dd>{{ [tour.addr1, tour.addr2].filter(Boolean).join(" ") || t("tourDetail.noInfo") }}</dd>
            </div>
            <div class="info-row">
              <dt>
                <div class="icon-bubble"><Phone :size="18" /></div> {{ t("tourDetail.contact") }}
              </dt>
              <dd>{{ tour.tel || t("tourDetail.noInfo") }}</dd>
            </div>
            <div class="info-row">
              <dt>
                <div class="icon-bubble"><Route :size="18" /></div> {{ t("tourDetail.zipcode") }}
              </dt>
              <dd>{{ tour.zipcode || t("tourDetail.noInfo") }}</dd>
            </div>
          </dl>

          <RouterLink class="community-prompt modern-prompt" to="/community">
            <div class="prompt-icon-wrap"><Sparkles :size="24" class="sparkle-icon" /></div>
            <div class="prompt-text">
              <strong>{{ t("tourDetail.communityPromptTitle") }}</strong>
              <small>{{ t("tourDetail.communityPromptDescription") }}</small>
            </div>
            <ExternalLink :size="18" class="prompt-arrow" />
          </RouterLink>
        </section>

        <aside class="detail-map-panel">
          <div class="map-container">
            <TourMap v-if="hasCoordinates" :tours="[tour]" :active-id="tour.contentid" single />
            <StatePanel v-else :title="t('tourDetail.noLocation')" />
          </div>
          <a v-if="directionsUrl" class="route-button" :href="directionsUrl" target="_blank" rel="noreferrer">
            <MapPin :size="18" /> {{ t("tourDetail.directions") }} <ExternalLink :size="16" class="ext-icon" />
          </a>
          <ShareButtons
            v-if="tour"
            class="detail-share"
            :title="tour.title"
            :description="shareDescription"
            :image-url="tour.firstimage || tour.firstimage2 || fallbackImage"
          />
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.modern-back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  color: var(--ink-soft);
  font-weight: 800;
  transition: color 0.2s ease;
  text-decoration: none;
}

.back-icon-wrap {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-alt);
  transition: all 0.3s ease;
}

.modern-back:hover .back-icon-wrap {
  background: var(--brand);
  color: #fff;
  transform: translateX(-4px);
}

.modern-back:hover span {
  color: var(--brand-dark);
}

.modern-hero {
  position: relative;
  height: 480px;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 48px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0,0,0,0.05);
  background: var(--surface-alt);
}

.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 10s ease-out;
}

.modern-hero:hover .hero-bg {
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px;
  color: #ffffff;
}

.glass-chip {
  align-self: flex-start;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  /* 덮개가 사라졌으므로 밝은 배경에서도 잘 보이게 그림자를 강하게 유지 */
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8), 0 0 6px rgba(0, 0, 0, 0.6);
}

.hero-address {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8), 0 0 6px rgba(0, 0, 0, 0.6);
}

.modern-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
  align-items: start;
}

.brand-kicker {
  color: var(--brand);
  background: rgba(8, 127, 120, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
  font-weight: 800;
}

.modern-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.info-row dt {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
  color: var(--muted);
}

.icon-bubble {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: var(--surface-alt);
  border-radius: 8px;
  color: var(--brand);
}

.info-row dd {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.5;
}

.modern-prompt {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px;
  background: linear-gradient(135deg, #f0f7f4 0%, #eaf4f1 100%);
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(8, 127, 120, 0.1);
  box-shadow: 0 8px 24px rgba(8, 127, 120, 0.05);
}

.modern-prompt:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(8, 127, 120, 0.15);
}

.prompt-icon-wrap {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  background: var(--brand);
  color: #ffffff;
  border-radius: 14px;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(8, 127, 120, 0.2);
}

.sparkle-icon {
  animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  0% { transform: scale(0.9); }
  100% { transform: scale(1.1); }
}

.prompt-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prompt-text strong {
  font-size: 17px;
  color: var(--brand-dark);
}

.prompt-text small {
  font-size: 13.5px;
  color: var(--brand);
}

.prompt-arrow {
  color: var(--brand);
  transition: transform 0.3s ease;
}

.modern-prompt:hover .prompt-arrow {
  transform: translate(2px, -2px);
}

.detail-map-panel {
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-container {
  height: 380px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--line);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
  background: var(--surface);
}

.route-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 56px;
  background: var(--ink);
  color: #ffffff;
  font-size: 16px;
  font-weight: 750;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.route-button:hover {
  background: #000000;
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.route-button:active {
  transform: translateY(1px);
}

.ext-icon {
  opacity: 0.8;
}

.detail-share {
  width: 100%;
}

.detail-share :deep(.share-trigger) {
  width: 100%;
  height: 56px;
  justify-content: center;
  border-radius: 16px;
  font-size: 15px;
}

.detail-share :deep(.share-dropdown) {
  right: 0;
  left: 0;
  width: 100%;
  bottom: calc(100% + 8px);
  top: auto;
}

@media (max-width: 992px) {
  .modern-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .modern-hero {
    height: 400px;
    padding: 32px;
  }

  .hero-title {
    font-size: 32px;
  }

  .detail-map-panel {
    position: static;
  }
}
</style>