<script setup>
import { ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { Bot, CalendarDays, Compass, HeartHandshake, Map, Menu, X } from "@lucide/vue";
import WeatherBadge from "./components/common/WeatherBadge.vue";

const route = useRoute();
const menuOpen = ref(false);

const navItems = [
  { label: "둘러보기", to: "/", icon: Compass },
  { label: "여행 지도", to: "/tours", icon: Map },
  { label: "축제 캘린더", to: "/festivals", icon: CalendarDays },
  { label: "커뮤니티", to: "/community", icon: HeartHandshake },
  { label: "AI 여행메이트", to: "/chat", icon: Bot },
];

function isActive(path) {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
}
</script>

<template>
  <div class="app-frame">
    <header class="app-header">
      <div class="header-inner">
        <RouterLink class="brand" to="/" aria-label="두루 홈">
          <span class="brand-mark">두루</span>
          <span class="brand-copy">대전·충청 여행 커뮤니티</span>
        </RouterLink>

        <nav class="desktop-nav" aria-label="주요 메뉴">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="{ active: isActive(item.to) }"
          >
            <component :is="item.icon" :size="17" />
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="header-actions">
          <WeatherBadge />
          <button
            class="icon-button mobile-menu-button"
            type="button"
            :title="menuOpen ? '메뉴 닫기' : '메뉴 열기'"
            @click="menuOpen = !menuOpen"
          >
            <X v-if="menuOpen" :size="21" />
            <Menu v-else :size="21" />
          </button>
        </div>
      </div>
      <nav v-if="menuOpen" class="mobile-nav" aria-label="모바일 메뉴">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ active: isActive(item.to) }"
          @click="menuOpen = false"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main><RouterView /></main>

    <footer class="app-footer">
      <div>
        <strong>두루</strong>
        <span>대전·충청의 장소와 경험을 잇습니다.</span>
      </div>
      <span>Tour Community Project</span>
    </footer>
  </div>
</template>
