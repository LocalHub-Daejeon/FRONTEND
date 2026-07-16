<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, Bot, MapPin, Search, Sparkles } from "@lucide/vue";
import StatePanel from "../components/common/StatePanel.vue";
import PostCard from "../components/posts/PostCard.vue";
import TourCard from "../components/tours/TourCard.vue";
import TourMap from "../components/tours/TourMap.vue";
import { postsApi, toursApi } from "../services/api";
import { usePostsStore } from "../stores/posts";
import { fallbackImage, onImageError } from "../utils/format";

const router = useRouter();
const postsStore = usePostsStore();
const tours = ref([]);
const posts = ref([]);
const keyword = ref("");
const loading = ref(true);
const error = ref("");
const activeTour = ref(null);

const leadTour = computed(() => tours.value[0]);
const heroImage = computed(() => leadTour.value?.firstimage || fallbackImage);

function searchTours() {
  router.push({ name: "tours", query: keyword.value.trim() ? { keyword: keyword.value.trim() } : {} });
}

async function likePost(postId) {
  try {
    const result = await postsStore.likePost(postId);
    const post = posts.value.find((item) => item.id === Number(postId));
    if (post && !result.duplicate && !result.pending) post.like_count = result.like_count;
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(async () => {
  try {
    const [tourData, postData] = await Promise.all([
      toursApi.getAll({ page: 1, size: 6 }),
      postsApi.getAll({ page: 1, size: 4 }),
    ]);
    tours.value = tourData.items || [];
    posts.value = postData.items || [];
    activeTour.value = tours.value[0] || null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="home-view">
    <section class="home-hero">
      <img class="hero-bg-img" :src="heroImage" alt="대전·충청 관광지" @error="onImageError" />
      <div class="hero-shade"></div>
      <div class="hero-content page-width">
        <div class="hero-text-wrap">
          <p class="eyebrow fade-in-up" style="animation-delay: 0.1s;">DAEJEON · CHUNGCHEONG</p>
          <h1 class="fade-in-up" style="animation-delay: 0.2s;">두루</h1>
          <p class="hero-copy fade-in-up" style="animation-delay: 0.3s;">가까운 여행지를 발견하고, 다녀온 사람의 이야기를 만나는 곳</p>
        </div>
        
        <form class="hero-search fade-in-up" style="animation-delay: 0.4s;" role="search" @submit.prevent="searchTours">
          <MapPin :size="20" class="search-icon" />
          <input v-model="keyword" type="search" placeholder="어디로 떠나볼까요?" aria-label="관광지 검색" />
          <button type="submit" title="검색"><Search :size="20" /></button>
        </form>
        
        <RouterLink v-if="leadTour" class="hero-place fade-in-up" style="animation-delay: 0.5s;" :to="`/tours/${leadTour.contentid}`">
          <span>지금 눈에 띄는 곳</span>
          <strong>{{ leadTour.title }}</strong>
          <ArrowRight :size="17" class="arrow-icon" />
        </RouterLink>
      </div>
    </section>

    <div class="page-width home-content">
      <StatePanel v-if="loading" type="loading" title="지역의 여행 이야기를 모으고 있어요" />
      <StatePanel v-else-if="error && !tours.length" type="error" title="콘텐츠를 불러오지 못했어요" :description="error" />

      <template v-else>
        <section class="section-block mixed-section">
          <div class="section-heading">
            <div>
              <p class="section-kicker">지도에서 발견하기</p>
              <h2>이번 주, 어디를 걸어볼까요?</h2>
            </div>
            <RouterLink class="text-link" to="/tours">전체 여행지 <ArrowRight :size="17" /></RouterLink>
          </div>

          <div class="home-map-layout">
            <div class="home-map-wrap">
              <TourMap :tours="tours" :active-id="activeTour?.contentid" @select="activeTour = $event" />
              <RouterLink v-if="activeTour" class="map-selection" :to="`/tours/${activeTour.contentid}`">
                <div class="img-wrapper">
                  <img :src="activeTour.firstimage || fallbackImage" alt="" @error="onImageError" />
                </div>
                <span class="selection-info">
                  <small>{{ activeTour.contentType || "관광지" }}</small>
                  <strong>{{ activeTour.title }}</strong>
                </span>
                <ArrowRight :size="18" class="selection-arrow" />
              </RouterLink>
            </div>
            <div class="featured-tour-grid">
              <TourCard v-for="tour in tours.slice(0, 4)" :key="tour.contentid" :tour="tour" />
            </div>
          </div>
        </section>

        <section class="section-block story-section">
          <div class="section-heading">
            <div>
              <p class="section-kicker">여행자들의 기록</p>
              <h2>먼저 다녀온 사람의 이야기</h2>
            </div>
            <RouterLink class="text-link" to="/community">커뮤니티 보기 <ArrowRight :size="17" /></RouterLink>
          </div>
          <div v-if="posts.length" class="home-post-list">
            <PostCard
              v-for="post in posts"
              :key="post.id"
              :post="post"
              :liked="postsStore.isPostLiked(post.id)"
              :liking="postsStore.isPostLiking(post.id)"
              @like="likePost"
            />
          </div>
          <StatePanel v-else title="아직 여행 이야기가 없어요" description="첫 번째 여행 기록을 남겨보세요." />
        </section>

        <section class="ai-invite advanced-gradient">
          <div class="ai-invite-content">
            <span class="ai-icon floating"><Sparkles :size="24" /></span>
            <p class="section-kicker" style="color: #ffe18e;">AI 여행메이트</p>
            <h2>취향을 말하면, 갈 곳이 선명해져요.</h2>
            <p>관광 데이터에 등록된 장소를 바탕으로 지금 필요한 여행 코스를 함께 찾아드립니다.</p>
          </div>
          <RouterLink class="primary-button ai-btn" to="/chat">
            <Bot :size="18" /> 대화 시작하기
          </RouterLink>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 애니메이션 추가 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 히어로 섹션 개선 */
.home-hero {
  border-radius: 0 0 24px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.hero-bg-img {
  transform: scale(1.05);
  animation: bgZoom 15s ease-out forwards;
}

@keyframes bgZoom {
  to { transform: scale(1); }
}

.hero-shade {
  background: linear-gradient(180deg, rgba(15, 24, 20, 0.2) 0%, rgba(15, 24, 20, 0.85) 100%);
}

.hero-search {
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.hero-search:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  background: #ffffff;
}

.search-icon {
  color: var(--brand);
}

.hero-place {
  padding: 8px 16px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.hero-place:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.hero-place .arrow-icon {
  transition: transform 0.2s ease;
}

.hero-place:hover .arrow-icon {
  transform: translateX(4px);
}

/* 맵 마커 선택 카드 디자인 고도화 */
.map-selection {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 12px;
}

.map-selection:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  background: #ffffff;
}

.map-selection .img-wrapper {
  overflow: hidden;
  border-radius: 6px;
}

.map-selection img {
  transition: transform 0.3s ease;
}

.map-selection:hover img {
  transform: scale(1.1);
}

.selection-arrow {
  color: var(--muted);
  transition: all 0.2s ease;
}

.map-selection:hover .selection-arrow {
  color: var(--brand);
  transform: translateX(4px);
}

/* AI 배너 입체감 및 그라데이션 */
.advanced-gradient {
  background: linear-gradient(135deg, #1b2923 0%, #0d1a14 100%);
  position: relative;
  overflow: hidden;
  border: 1px solid #2a3c33;
}

.advanced-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(230, 184, 92, 0.15) 0%, rgba(0,0,0,0) 70%);
  transform: translate(30%, -30%);
  pointer-events: none;
}

.ai-icon.floating {
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 10px 20px rgba(230, 184, 92, 0.3);
}

@keyframes float {
  0% { transform: translateY(-58px); }
  50% { transform: translateY(-64px); }
  100% { transform: translateY(-58px); }
}

.ai-btn {
  background: var(--surface);
  color: #1b2923;
  transition: all 0.2s ease;
}

.ai-btn:hover {
  background: var(--yellow);
  color: #111;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>
