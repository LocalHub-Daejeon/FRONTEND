import { defineStore } from "pinia";
import { postsApi } from "../services/api";
import { loadAnonymousLikeState, saveAnonymousLikeState } from "../utils/anonymousLikes";

const initialLikeState = loadAnonymousLikeState();
let noticeTimer;

export const usePostsStore = defineStore("posts", {
  state: () => ({
    items: [],
    selected: null,
    page: 1,
    size: 10,
    total: 0,
    keyword: "",
    loading: false,
    detailLoading: false,
    error: "",
    visitorId: initialLikeState.visitorId,
    likedPostIds: initialLikeState.likedPostIds,
    likingPostIds: [],
    likeNotice: null,
  }),
  getters: {
    totalPages: (state) => Math.max(1, Math.ceil(state.total / state.size)),
    isPostLiked: (state) => (postId) => state.likedPostIds.includes(String(postId)),
    isPostLiking: (state) => (postId) => state.likingPostIds.includes(String(postId)),
  },
  actions: {
    showLikeNotice(message, type = "info") {
      window.clearTimeout(noticeTimer);
      this.likeNotice = { message, type, id: Date.now() };
      noticeTimer = window.setTimeout(() => {
        this.likeNotice = null;
      }, 2600);
    },
    async fetchPosts(overrides = {}) {
      Object.assign(this, overrides);
      this.loading = true;
      this.error = "";
      try {
        const data = await postsApi.getAll({
          keyword: this.keyword,
          page: this.page,
          size: this.size,
        });
        this.items = data.items || [];
        this.page = data.page || 1;
        this.total = data.total || 0;
      } catch (error) {
        this.error = error.message;
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    async fetchPost(postId) {
      this.detailLoading = true;
      this.error = "";
      try {
        this.selected = await postsApi.getById(postId);
        return this.selected;
      } catch (error) {
        this.error = error.message;
        this.selected = null;
        throw error;
      } finally {
        this.detailLoading = false;
      }
    },
    async createPost(payload) {
      return postsApi.create(payload);
    },
    async updatePost(postId, payload) {
      const updated = await postsApi.update(postId, payload);
      this.selected = updated;
      return updated;
    },
    async deletePost(postId, password) {
      return postsApi.remove(postId, password);
    },
    async likePost(postId) {
      const normalizedId = String(postId);
      if (this.isPostLiked(normalizedId)) {
        this.showLikeNotice("이미 좋아요를 누르셨어요.");
        return { liked: true, duplicate: true };
      }

      if (this.isPostLiking(normalizedId)) {
        this.showLikeNotice("좋아요를 처리하고 있어요.");
        return { liked: false, pending: true };
      }

      this.likingPostIds.push(normalizedId);
      try {
        const result = await postsApi.like(postId);
        this.likedPostIds.push(normalizedId);
        saveAnonymousLikeState(this.visitorId, this.likedPostIds);

        if (this.selected?.id === Number(postId)) {
          this.selected.like_count = result.like_count;
        }
        const listItem = this.items.find((item) => item.id === Number(postId));
        if (listItem) listItem.like_count = result.like_count;

        this.showLikeNotice("좋아요를 남겼어요.", "success");
        return { ...result, liked: true, duplicate: false };
      } finally {
        this.likingPostIds = this.likingPostIds.filter((id) => id !== normalizedId);
      }
    },
  },
});
