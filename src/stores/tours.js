import { defineStore } from "pinia";
import { toursApi } from "../services/api";

export const useToursStore = defineStore("tours", {
  state: () => ({
    items: [],
    selected: null,
    page: 1,
    size: 12,
    total: 0,
    keyword: "",
    contentTypeId: "",
    loading: false,
    detailLoading: false,
    error: "",
  }),
  getters: {
    totalPages: (state) => Math.max(1, Math.ceil(state.total / state.size)),
    mappableItems: (state) =>
      state.items.filter((item) => Number(item.mapx) && Number(item.mapy)),
  },
  actions: {
    async fetchTours(overrides = {}) {
      Object.assign(this, overrides);
      this.loading = true;
      this.error = "";
      try {
        const data = await toursApi.getAll({
          keyword: this.keyword,
          content_type_id: this.contentTypeId,
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
    async fetchTour(contentId) {
      this.detailLoading = true;
      this.error = "";
      try {
        this.selected = await toursApi.getById(contentId);
        return this.selected;
      } catch (error) {
        this.error = error.message;
        this.selected = null;
        throw error;
      } finally {
        this.detailLoading = false;
      }
    },
  },
});
