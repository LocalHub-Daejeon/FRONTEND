import { defineStore } from "pinia";

const STORAGE_KEY = "duru-tour-bookmarks";

function readBookmarks() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?.contentid) : [];
  } catch {
    return [];
  }
}

function toBookmark(tour) {
  return {
    contentid: String(tour.contentid),
    contenttypeid: tour.contenttypeid || "",
    contentType: tour.contentType || "",
    title: tour.title || "",
    addr1: tour.addr1 || "",
    addr2: tour.addr2 || "",
    firstimage: tour.firstimage || "",
    firstimage2: tour.firstimage2 || "",
    mapx: tour.mapx || "",
    mapy: tour.mapy || "",
    savedAt: new Date().toISOString(),
  };
}

export const useBookmarksStore = defineStore("bookmarks", {
  state: () => ({
    items: readBookmarks(),
  }),
  getters: {
    count: (state) => state.items.length,
    has: (state) => (contentId) =>
      state.items.some((item) => String(item.contentid) === String(contentId)),
  },
  actions: {
    persist() {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
    toggle(tour) {
      if (!tour?.contentid) return false;

      const index = this.items.findIndex(
        (item) => String(item.contentid) === String(tour.contentid),
      );

      if (index >= 0) {
        this.items.splice(index, 1);
        this.persist();
        return false;
      }

      this.items.unshift(toBookmark(tour));
      this.persist();
      return true;
    },
  },
});
