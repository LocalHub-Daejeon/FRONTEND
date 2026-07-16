<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Bot, CalendarDays, Compass, HeartHandshake, Map, Menu, X } from "@lucide/vue";
import WeatherBadge from "./components/common/WeatherBadge.vue";
import ViewerCountBadge from "./components/common/ViewerCountBadge.vue";
import LanguageSwitcher from "./components/common/LanguageSwitcher.vue";
import NewPostBanner from "./components/common/NewPostBanner.vue";
import LikeToast from "./components/common/LikeToast.vue";
import { useRealtimeStore } from "./stores/realtime";

const { t } = useI18n();
const route = useRoute();
const menuOpen = ref(false);
const realtime = useRealtimeStore();

onMounted(() => {
  realtime.init();
});

const navItems = computed(() => [
  { label: t("common.nav.home"), to: "/", icon: Compass },
  { label: t("common.nav.tours"), to: "/tours", icon: Map },
  { label: t("common.nav.festivals"), to: "/festivals", icon: CalendarDays },
  { label: t("common.nav.community"), to: "/community", icon: HeartHandshake },
  { label: t("common.nav.chat"), to: "/chat", icon: Bot },
]);

function isActive(path) {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
}
</script>

<template>
  <div class="app-frame">
    <header class="app-header">
      <div class="header-inner">
        <RouterLink class="brand" to="/" :aria-label="t('common.brand.home')">
          <span class="brand-mark">{{ t("common.brand.mark") }}</span>
          <span class="brand-copy">{{ t("common.brand.tagline") }}</span>
        </RouterLink>

        <nav class="desktop-nav" :aria-label="t('common.nav.mainMenu')">
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
          <div class="viewer-lang-stack">
            <ViewerCountBadge />
            <LanguageSwitcher />
          </div>
          <button
            class="icon-button mobile-menu-button"
            type="button"
            :title="menuOpen ? t('common.nav.closeMenu') : t('common.nav.openMenu')"
            @click="menuOpen = !menuOpen"
          >
            <X v-if="menuOpen" :size="21" />
            <Menu v-else :size="21" />
          </button>
        </div>
      </div>
      <nav v-if="menuOpen" class="mobile-nav" :aria-label="t('common.nav.mobileMenu')">
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
        <div class="mobile-lang-row">
          <LanguageSwitcher />
        </div>
      </nav>
    </header>

    <NewPostBanner />
    <LikeToast />

    <main><RouterView /></main>

    <footer class="app-footer">
      <div>
        <strong>{{ t("common.brand.mark") }}</strong>
        <span>{{ t("common.footer.tagline") }}</span>
      </div>
      <span>{{ t("common.footer.project") }}</span>
    </footer>
  </div>
</template>
