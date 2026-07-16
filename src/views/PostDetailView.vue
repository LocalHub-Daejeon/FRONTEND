<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowLeft, Eye, Heart, LockKeyhole, PenLine, Trash2, Calendar } from "@lucide/vue";
import AppModal from "../components/common/AppModal.vue";
import StatePanel from "../components/common/StatePanel.vue";
import PostEditor from "../components/posts/PostEditor.vue";
import { usePostsStore } from "../stores/posts";
import { formatDate } from "../utils/format";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = usePostsStore();
const mode = ref("");
const password = ref("");
const busy = ref(false);
const actionError = ref("");
const post = computed(() => store.selected);
const isLiked = computed(() => store.isPostLiked(route.params.postId));
const isLiking = computed(() => store.isPostLiking(route.params.postId));

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
  <div class="page-width page-view post-detail-view fade-in">
    <RouterLink class="back-link modern-back" to="/community">
      <div class="back-icon-wrap"><ArrowLeft :size="18" /></div>
      <span>{{ t("postDetail.backToList") }}</span>
    </RouterLink>

    <StatePanel v-if="store.detailLoading" type="loading" :title="t('postDetail.loading')" />
    <StatePanel v-else-if="store.error" type="error" :title="t('postDetail.error')" :description="store.error" />

    <article v-else-if="post" class="post-detail modern-article">
      <header class="article-header">
        <p class="section-kicker brand-kicker">{{ t("postDetail.kicker") }}</p>
        <h1 class="article-title">{{ post.title }}</h1>
        <div class="post-detail-meta advanced-meta">
          <span class="meta-tag"><Calendar :size="15" class="meta-icon" /> {{ formatDate(post.created_at, true) }}</span>
          <span class="meta-tag"><Eye :size="15" class="meta-icon" /> {{ t("postDetail.views") }} {{ post.view_count }}</span>
          <span class="meta-tag highlight"><Heart :size="15" class="meta-icon" /> {{ t("postDetail.likes") }} {{ post.like_count }}</span>
        </div>
      </header>

      <div class="post-content article-body">{{ post.content }}</div>

      <footer class="article-footer">
        <div class="footer-primary-action">
          <button
            class="like-button large float-btn"
            :class="{ 'is-liked': isLiked }"
            type="button"
            :aria-label="t('post.likeAriaLabel', { title: post.title })"
            :aria-pressed="isLiked"
            :disabled="isLiking"
            @click="likePost"
          >
            <Heart :size="20" stroke-width="2.5" class="heart-pulse" :fill="isLiked ? 'currentColor' : 'none'" />
            <span>{{ t("postDetail.likeCta") }} <strong>{{ post.like_count }}</strong></span>
          </button>
        </div>

        <div class="footer-secondary-actions">
          <button class="action-btn edit" type="button" @click="mode = 'edit'">
            <PenLine :size="15" /> {{ t("postDetail.edit") }}
          </button>
          <button class="action-btn delete" type="button" @click="mode = 'delete'">
            <Trash2 :size="15" /> {{ t("postDetail.delete") }}
          </button>
        </div>
      </footer>
      <p v-if="actionError" class="inline-alert bottom-alert">{{ actionError }}</p>
    </article>

    <AppModal v-if="mode === 'edit'" :title="t('postDetail.editModalTitle')" wide @close="closeModal">
      <p v-if="actionError" class="inline-alert">{{ actionError }}</p>
      <PostEditor :post="post" :busy="busy" @submit="updatePost" />
    </AppModal>

    <AppModal
      v-if="mode === 'delete'"
      :title="t('postDetail.deleteModalTitle')"
      :description="t('postDetail.deleteModalDescription')"
      @close="closeModal"
    >
      <form class="password-form modern-form" @submit.prevent="deletePost">
        <label class="form-group">
          <span class="label-text"><LockKeyhole :size="16" class="lock-icon" /> {{ t("postDetail.passwordLabel") }}</span>
          <input class="modern-input" v-model="password" type="password" maxlength="100" autofocus :placeholder="t('postDetail.passwordPlaceholder')" />
        </label>
        <p v-if="actionError" class="form-error-banner">{{ actionError }}</p>
        <button class="danger-button delete-confirm-btn" type="submit" :disabled="!password || busy">
          <Trash2 :size="18" stroke-width="2.5" /> {{ busy ? t("postDetail.deleting") : t("postDetail.deleteConfirm") }}
        </button>
      </form>
    </AppModal>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 뒤로가기 버튼 */
.modern-back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  color: var(--ink-soft);
  font-weight: 800;
  transition: color 0.2s ease;
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

/* 아티클 영역 */
.modern-article {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--line);
}

.article-header {
  padding-bottom: 32px;
  border-bottom: 2px solid var(--ink);
  margin-bottom: 40px;
}

.brand-kicker {
  color: var(--brand);
  background: rgba(8, 127, 120, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
}

.article-title {
  font-size: 42px;
  font-weight: 900;
  line-height: 1.3;
  letter-spacing: -1px;
  color: var(--ink);
  margin-bottom: 24px;
}

/* 메타 정보 뱃지 스타일 */
.advanced-meta {
  display: flex;
  gap: 12px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--surface-alt);
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink-soft);
}

.meta-tag.highlight {
  background: #fff0ed;
  color: var(--coral-dark);
}

.meta-icon {
  opacity: 0.7;
}

/* 본문 영역 */
.article-body {
  font-size: 17px;
  line-height: 1.9;
  color: #2a332f;
  min-height: 200px;
}

/* 하단 푸터 및 버튼 */
.article-footer {
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.float-btn {
  height: 56px;
  padding: 0 32px;
  border-radius: 28px;
  background: #ffffff;
  border: 2px solid var(--coral);
  color: var(--coral);
  font-size: 16px;
  box-shadow: 0 10px 20px rgba(214, 83, 55, 0.1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.float-btn strong {
  margin-left: 6px;
  font-size: 18px;
}

.float-btn:hover {
  background: var(--coral);
  color: #ffffff;
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(214, 83, 55, 0.25);
}

.float-btn:hover .heart-pulse {
  animation: pulse 1s infinite alternate;
}

.float-btn.is-liked {
  background: #fff0ed;
  border-color: var(--coral-dark);
  color: var(--coral-dark);
}

.float-btn:disabled {
  cursor: wait;
  opacity: 0.65;
  transform: none;
}

@keyframes pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.2); }
}

.footer-secondary-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink-soft);
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--surface-alt);
}

.action-btn.delete:hover {
  background: #fff7f5;
  color: var(--danger);
  border-color: #f2dcd8;
}

/* 모달 내부 삭제 폼용 스타일 */
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.label-text { font-size: 14px; font-weight: 800; color: var(--ink-soft); display: flex; align-items: center; }
.lock-icon { margin-right: 6px; color: var(--danger); }
.modern-input { width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; font-size: 15px; transition: all 0.3s; }
.modern-input:focus { border-color: var(--danger); box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.1); outline: none; }
.form-error-banner { background: #fff7f5; color: var(--danger); padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }
.delete-confirm-btn { width: 100%; height: 52px; border-radius: 12px; font-size: 15px; background: var(--danger); box-shadow: 0 6px 16px rgba(180, 35, 24, 0.2); }

@media (max-width: 768px) {
  .modern-article { padding: 24px; border-radius: 16px; }
  .article-title { font-size: 28px; }
  .advanced-meta { flex-wrap: wrap; }
}
</style>
