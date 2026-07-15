<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Check, ChevronDown, Globe } from "@lucide/vue";
import { setLocale } from "../../i18n";

const { t, locale } = useI18n();
const open = ref(false);
const root = ref(null);

const options = [
  { value: "ko", flag: "🇰🇷" },
  { value: "en", flag: "🇺🇸" },
];

function toggle() {
  open.value = !open.value;
}

function choose(value) {
  setLocale(value);
  open.value = false;
}

function handleClickOutside(event) {
  if (root.value && !root.value.contains(event.target)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>

<template>
  <div ref="root" class="language-switcher">
    <button
      type="button"
      class="language-trigger"
      :aria-label="t('languageSwitcher.label')"
      :title="t(`languageSwitcher.${locale}`)"
      :aria-expanded="open"
      @click="toggle"
    >
      <Globe :size="13" class="language-globe" />
      <span class="language-current">{{ locale.toUpperCase() }}</span>
      <ChevronDown :size="12" class="language-chevron" :class="{ 'is-open': open }" />
    </button>

    <Transition name="language-pop">
      <ul v-if="open" class="language-menu" role="listbox">
        <li v-for="option in options" :key="option.value">
          <button
            type="button"
            class="language-option"
            :class="{ active: locale === option.value }"
            role="option"
            :aria-selected="locale === option.value"
            @click="choose(option.value)"
          >
            <span class="language-flag" aria-hidden="true">{{ option.flag }}</span>
            <span>{{ t(`languageSwitcher.${option.value}`) }}</span>
            <Check v-if="locale === option.value" :size="14" class="language-check" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
