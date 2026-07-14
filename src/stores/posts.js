import { defineStore } from "pinia";
import { postsApi } from "../services/api";

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
  }),
  getters: {
    totalPages: (state) => Math.max(1, Math.ceil(state.total / state.size)),
  },
  actions: {
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
      const result = await postsApi.like(postId);
      if (this.selected?.id === Number(postId)) {
        this.selected.like_count = result.like_count;
      }
      const listItem = this.items.find((item) => item.id === Number(postId));
      if (listItem) listItem.like_count = result.like_count;
      return result;
    },
  },
});
