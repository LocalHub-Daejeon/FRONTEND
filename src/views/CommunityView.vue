<script setup>
import { onMounted, ref } from "vue";
import { PenLine, Search } from "@lucide/vue";
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
    <header class="page-heading community-heading">
      <div>
        <p class="eyebrow dark">TRAVEL STORIES</p>
        <h1>여행자 커뮤니티</h1>
        <p>직접 다녀온 사람들의 경험과 작은 팁이 다음 여행을 만듭니다.</p>
      </div>
      <button class="primary-button" type="button" @click="editorOpen = true">
        <PenLine :size="18" /> 글쓰기
      </button>
    </header>

    <div class="community-toolbar">
      <form class="search-toolbar" role="search" @submit.prevent="search">
        <div class="search-input-wrap">
          <Search :size="19" />
          <input v-model="keywordInput" type="search" placeholder="제목과 내용에서 검색" aria-label="게시글 검색" />
        </div>
        <button class="secondary-button" type="submit">검색</button>
      </form>
      <span>총 <strong>{{ store.total.toLocaleString() }}</strong>개의 이야기</span>
    </div>

    <p v-if="actionError" class="inline-alert">{{ actionError }}</p>

    <StatePanel v-if="store.loading" type="loading" title="여행 이야기를 불러오는 중이에요" />
    <StatePanel v-else-if="store.error" type="error" title="게시글을 불러오지 못했어요" :description="store.error" />
    <StatePanel v-else-if="!store.items.length" title="아직 등록된 이야기가 없어요" description="여행의 첫 기록을 남겨보세요." />
    <template v-else>
      <div class="community-list">
        <PostCard v-for="post in store.items" :key="post.id" :post="post" @like="likePost" />
      </div>
      <AppPagination :page="store.page" :total-pages="store.totalPages" @change="changePage" />
    </template>

    <AppModal
      v-if="editorOpen"
      title="새 여행 이야기"
      description="직접 경험한 정보일수록 다른 여행자에게 큰 도움이 됩니다."
      wide
      @close="editorOpen = false"
    >
      <p v-if="actionError" class="inline-alert">{{ actionError }}</p>
      <PostEditor :busy="saving" @submit="createPost" />
    </AppModal>
  </div>
</template>
