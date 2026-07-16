<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { X } from "@lucide/vue";

const { t } = useI18n();
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
    <div class="modal-backdrop glass-backdrop" @mousedown.self="$emit('close')">
      <section class="modal modern-modal pop-in" :class="{ 'is-wide': wide }" role="dialog" aria-modal="true">
        <header class="modal-header">
          <div class="header-text-wrap">
            <h2>{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
          </div>
          <button class="icon-button close-btn" type="button" :title="t('common.close')" @click="$emit('close')">
            <X :size="20" stroke-width="2.5" />
          </button>
        </header>
        <div class="modal-body"><slot /></div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes modalPop {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes backdropFade {
  0% { opacity: 0; backdrop-filter: blur(0px); }
  100% { opacity: 1; backdrop-filter: blur(8px); }
}

.glass-backdrop {
  background: rgba(16, 25, 21, 0.4);
  animation: backdropFade 0.3s ease-out forwards;
}

.modern-modal {
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.1) inset;
  background: #ffffff;
  overflow: hidden;
}

.pop-in {
  animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.modal-header {
  padding: 28px 32px 24px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  align-items: center;
}

.header-text-wrap h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.5px;
}

.close-btn {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--surface-alt);
  color: var(--muted);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0dbd7;
  color: var(--danger);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  background: #fcfdfc;
}
</style>