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
    if (post) post.like_count = result.like_count;
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
      <img :src="heroImage" alt="대전·충청 관광지" @error="onImageError" />
      <div class="hero-shade"></div>
      <div class="hero-content page-width">
        <p class="eyebrow">DAEJEON · CHUNGCHEONG</p>
        <h1>두루</h1>
        <p class="hero-copy">가까운 여행지를 발견하고, 다녀온 사람의 이야기를 만나는 곳</p>
        <form class="hero-search" role="search" @submit.prevent="searchTours">
          <MapPin :size="20" />
          <input v-model="keyword" type="search" placeholder="어디로 떠나볼까요?" aria-label="관광지 검색" />
          <button type="submit" title="검색"><Search :size="20" /></button>
        </form>
        <RouterLink v-if="leadTour" class="hero-place" :to="`/tours/${leadTour.contentid}`">
          <span>지금 눈에 띄는 곳</span>
          <strong>{{ leadTour.title }}</strong>
          <ArrowRight :size="17" />
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
                <img :src="activeTour.firstimage || fallbackImage" alt="" @error="onImageError" />
                <span><small>{{ activeTour.contentType || "관광지" }}</small><strong>{{ activeTour.title }}</strong></span>
                <ArrowRight :size="18" />
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
            <PostCard v-for="post in posts" :key="post.id" :post="post" @like="likePost" />
          </div>
          <StatePanel v-else title="아직 여행 이야기가 없어요" description="첫 번째 여행 기록을 남겨보세요." />
        </section>

        <section class="ai-invite">
          <div>
            <span class="ai-icon"><Sparkles :size="22" /></span>
            <p class="section-kicker">AI 여행메이트</p>
            <h2>취향을 말하면, 갈 곳이 선명해져요.</h2>
            <p>관광 데이터에 등록된 장소를 바탕으로 지금 필요한 여행 코스를 함께 찾아드립니다.</p>
          </div>
          <RouterLink class="primary-button" to="/chat"><Bot :size="18" /> 대화 시작하기</RouterLink>
        </section>
      </template>
    </div>
  </div>
</template>
