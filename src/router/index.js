import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
  { path: "/tours", name: "tours", component: () => import("../views/ToursView.vue") },
  {
    path: "/tours/:contentId",
    name: "tour-detail",
    component: () => import("../views/TourDetailView.vue"),
  },
  {
    path: "/community",
    name: "community",
    component: () => import("../views/CommunityView.vue"),
  },
  {
    path: "/community/:postId",
    name: "post-detail",
    component: () => import("../views/PostDetailView.vue"),
  },
  { path: "/chat", name: "chat", component: () => import("../views/ChatView.vue") },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
