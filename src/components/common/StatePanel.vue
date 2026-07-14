<script setup>
import { CircleAlert, LoaderCircle, SearchX } from "@lucide/vue";

defineProps({
  type: { type: String, default: "empty" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
});
</script>

<template>
  <div class="state-panel" :class="`is-${type}`" role="status">
    <LoaderCircle v-if="type === 'loading'" class="spin" :size="25" />
    <CircleAlert v-else-if="type === 'error'" :size="25" />
    <SearchX v-else :size="25" />
    <div>
      <strong>{{ title }}</strong>
      <p v-if="description">{{ description }}</p>
    </div>
  </div>
</template>
