<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { X } from "@lucide/vue";

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  wide: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

function handleKeydown(event) {
  if (event.key === "Escape") emit("close");
}

onMounted(() => {
  document.body.classList.add("modal-open");
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.body.classList.remove("modal-open");
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown.self="$emit('close')">
      <section class="modal" :class="{ 'is-wide': wide }" role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <h2>{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
          </div>
          <button class="icon-button" type="button" title="닫기" @click="$emit('close')">
            <X :size="20" />
          </button>
        </header>
        <div class="modal-body"><slot /></div>
      </section>
    </div>
  </Teleport>
</template>
