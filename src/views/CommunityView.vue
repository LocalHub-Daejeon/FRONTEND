<script setup>
import { onMounted, ref } from "vue";
import { PenLine, Search, Sparkles } from "@lucide/vue";
import AppModal from "../components/common/AppModal.vue";
import AppPagination from "../components/common/AppPagination.vue";
import StatePanel from "../components/common/StatePanel.vue";
import PostCard from "../components/posts/PostCard.vue";
import PostEditor from "../components/posts/PostEditor.vue";
import { usePostsStore } from "../stores/posts";

const store = usePostsStore();
const keywordInput = ref("");
const editorOpen = ref(false);
const saving = ref(false);
const actionError = ref("");

function search() {
  store.fetchPosts({ keyword: keywordInput.value.trim(), page: 1 });
}

async function createPost(payload) {
  saving.value = true;
  actionError.value = "";
  try {
    await store.createPost(payload);
    editorOpen.value = false;
    await store.fetchPosts({ page: 1 });
  } catch (error) {
    actionError.value = error.message;
  } finally {
    saving.value = false;
  }
}

async function likePost(postId) {
  try {
    await store.likePost(postId);
  } catch (error) {
    actionError.value = error.message;
  }
}

function changePage(page) {
  store.fetchPosts({ page });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => store.fetchPosts({ page: 1, keyword: "" }));
</script>

<template>
  <div class="page-width page-view community-view">
    <header class="community-hero fade-in-up">
      <div class="hero-bg-shapes"></div>
      <div class="hero-content">
        <div class="hero-text">
          <p class="eyebrow hero-eyebrow"><Sparkles :size="14" /> TRAVEL STORIES</p>
          <h1>여행자 커뮤니티</h1>
          <p>직접 다녀온 사람들의 생생한 경험과 작은 팁이 모여 다음 여행을 만듭니다.</p>
        </div>
        <button class="primary-button write-btn" type="button" @click="editorOpen = true">
          <PenLine :size="18" class="write-icon" /> <span class="btn-text">새 이야기 쓰기</span>
        </button>
      </div>
    </header>

    <div class="community-toolbar fade-in-up" style="animation-delay: 0.1s;">
      <form class="glass-search-toolbar" role="search" @submit.prevent="search">
        <div class="search-input-wrap interactive-input">
          <Search :size="19" class="search-icon" />
          <input v-model="keywordInput" type="search" placeholder="궁금한 여행지나 팁을 검색해보세요" aria-label="게시글 검색" />
        </div>
        <button class="search-btn" type="submit">검색</button>
      </form>
      <div class="meta-badge">
        총 <strong>{{ store.total.toLocaleString() }}</strong>개의 이야기
      </div>
    </div>

    <div v-if="actionError" class="alert-banner fade-in-up">{{ actionError }}</div>

    <div class="community-content-wrapper fade-in-up" style="animation-delay: 0.2s;">
      <StatePanel v-if="store.loading" type="loading" title="여행 이야기를 불러오는 중이에요" />
      <StatePanel v-else-if="store.error" type="error" title="게시글을 불러오지 못했어요" :description="store.error" />
      <StatePanel v-else-if="!store.items.length" title="아직 등록된 이야기가 없어요" description="여행의 첫 기록을 남겨보세요." />
      
      <template v-else>
        <div class="community-list modern-list">
          <PostCard
            v-for="post in store.items"
            :key="post.id"
            :post="post"
            :liked="store.isPostLiked(post.id)"
            :liking="store.isPostLiking(post.id)"
            @like="likePost"
          />
        </div>
        
        <div class="pagination-wrapper">
          <AppPagination :page="store.page" :total-pages="store.totalPages" @change="changePage" />
        </div>
      </template>
    </div>

    <AppModal
      v-if="editorOpen"
      title="새 여행 이야기"
      description="직접 경험한 정보일수록 다른 여행자에게 큰 도움이 됩니다."
      wide
      @close="editorOpen = false"
    >
      <div v-if="actionError" class="alert-banner">{{ actionError }}</div>
      <PostEditor :busy="saving" @submit="createPost" />
    </AppModal>
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

.community-hero {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #f0f7f4 0%, #e1ece7 100%);
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(8, 127, 120, 0.05);
}

.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(circle at 100% 0%, rgba(8, 127, 120, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 0% 100%, rgba(214, 83, 55, 0.05) 0%, transparent 40%);
}

.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 32px;
  z-index: 1;
}

.hero-text {
  margin-bottom: 32px; /* 텍스트와 버튼 사이의 넉넉한 간격 */
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--brand);
  background: rgba(8, 127, 120, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.hero-text h1 {
  font-size: 38px;
  font-weight: 900;
  color: var(--ink);
  margin-top: 24px; /* 👈 이 속성을 새롭게 추가하여 간격을 띄워주세요. */
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.hero-text p {
  font-size: 16px;
  color: var(--ink-soft);
  margin: 0;
  line-height: 1.6;
  word-break: keep-all;
}

.write-btn {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
  border: none;
  padding: 0 32px;
  height: 52px;
  border-radius: 12px;
  font-size: 16px;
  box-shadow: 0 8px 20px rgba(8, 127, 120, 0.25);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.write-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(8, 127, 120, 0.35);
  background: linear-gradient(135deg, #09948c 0%, var(--brand-dark) 100%);
}

.write-btn:active {
  transform: translateY(1px);
}

.write-icon {
  margin-right: 4px;
  transition: transform 0.3s ease;
}

.write-btn:hover .write-icon {
  transform: rotate(-10deg) scale(1.1);
}

.community-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}

.glass-search-toolbar {
  display: flex;
  flex: 1;
  max-width: 600px;
  gap: 12px;
}

.interactive-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0 16px;
  height: 52px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.interactive-input:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(8, 127, 120, 0.1);
  transform: translateY(-1px);
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
  font-size: 15px;
  color: var(--ink);
  outline: none;
}

.search-btn {
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink-soft);
  font-weight: 750;
  border-radius: 12px;
  padding: 0 24px;
  height: 52px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.search-btn:hover {
  background: #f7f9f8;
  border-color: #c9d4cf;
  color: var(--ink);
  transform: translateY(-1px);
}

.meta-badge {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  color: var(--muted);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.meta-badge strong {
  color: var(--brand-dark);
  font-size: 16px;
  margin: 0 2px;
}

.modern-list {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.03);
}

.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.alert-banner {
  background: #fff7f5;
  border-left: 4px solid var(--danger);
  color: var(--danger);
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(180, 35, 24, 0.08);
}

@media (max-width: 820px) {
  .hero-content {
    padding: 48px 24px;
  }
  
  .write-btn {
    width: 100%;
  }

  .community-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .glass-search-toolbar {
    max-width: 100%;
  }
  
  .meta-badge {
    text-align: center;
  }
}
</style>
