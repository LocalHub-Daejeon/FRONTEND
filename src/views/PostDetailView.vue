<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Eye, Heart, LockKeyhole, PenLine, Trash2 } from "@lucide/vue";
import AppModal from "../components/common/AppModal.vue";
import StatePanel from "../components/common/StatePanel.vue";
import PostEditor from "../components/posts/PostEditor.vue";
import { usePostsStore } from "../stores/posts";
import { formatDate } from "../utils/format";

const route = useRoute();
const router = useRouter();
const store = usePostsStore();
const mode = ref("");
const password = ref("");
const busy = ref(false);
const actionError = ref("");
const post = computed(() => store.selected);

async function likePost() {
  try {
    await store.likePost(route.params.postId);
  } catch (error) {
    actionError.value = error.message;
  }
}

async function updatePost(payload) {
  busy.value = true;
  actionError.value = "";
  try {
    await store.updatePost(route.params.postId, payload);
    mode.value = "";
  } catch (error) {
    actionError.value = error.message;
  } finally {
    busy.value = false;
  }
}

async function deletePost() {
  if (!password.value) return;
  busy.value = true;
  actionError.value = "";
  try {
    await store.deletePost(route.params.postId, password.value);
    router.replace("/community");
  } catch (error) {
    actionError.value = error.message;
  } finally {
    busy.value = false;
  }
}

function closeModal() {
  mode.value = "";
  password.value = "";
  actionError.value = "";
}

onMounted(() => store.fetchPost(route.params.postId).catch(() => {}));
</script>

<template>
  <div class="page-width page-view post-detail-view">
    <RouterLink class="back-link" to="/community"><ArrowLeft :size="18" /> 커뮤니티로 돌아가기</RouterLink>
    <StatePanel v-if="store.detailLoading" type="loading" title="이야기를 불러오는 중이에요" />
    <StatePanel v-else-if="store.error" type="error" title="게시글을 찾지 못했어요" :description="store.error" />

    <article v-else-if="post" class="post-detail">
      <header>
        <p class="section-kicker">TRAVEL STORY</p>
        <h1>{{ post.title }}</h1>
        <div class="post-detail-meta">
          <span>{{ formatDate(post.created_at, true) }}</span>
          <span><Eye :size="16" /> 조회 {{ post.view_count }}</span>
          <span><Heart :size="16" /> 좋아요 {{ post.like_count }}</span>
        </div>
      </header>
      <div class="post-content">{{ post.content }}</div>
      <footer>
        <button class="like-button large" type="button" @click="likePost"><Heart :size="18" /> 도움됐어요 {{ post.like_count }}</button>
        <div>
          <button class="text-button" type="button" @click="mode = 'edit'"><PenLine :size="16" /> 수정</button>
          <button class="text-button danger" type="button" @click="mode = 'delete'"><Trash2 :size="16" /> 삭제</button>
        </div>
      </footer>
      <p v-if="actionError" class="inline-alert">{{ actionError }}</p>
    </article>

    <AppModal v-if="mode === 'edit'" title="여행 이야기 수정" wide @close="closeModal">
      <p v-if="actionError" class="inline-alert">{{ actionError }}</p>
      <PostEditor :post="post" :busy="busy" @submit="updatePost" />
    </AppModal>

    <AppModal
      v-if="mode === 'delete'"
      title="게시글 삭제"
      description="삭제한 글은 되돌릴 수 없습니다."
      @close="closeModal"
    >
      <form class="password-form" @submit.prevent="deletePost">
        <label>
          <span><LockKeyhole :size="16" /> 작성할 때 사용한 비밀번호</span>
          <input v-model="password" type="password" maxlength="100" autofocus placeholder="비밀번호 입력" />
        </label>
        <p v-if="actionError" class="form-error">{{ actionError }}</p>
        <button class="danger-button" type="submit" :disabled="!password || busy">
          <Trash2 :size="17" /> {{ busy ? "삭제 중" : "삭제하기" }}
        </button>
      </form>
    </AppModal>
  </div>
</template>
