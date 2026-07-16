<script setup>
import { Heart, Info } from "@lucide/vue";
import { usePostsStore } from "../../stores/posts";

const store = usePostsStore();
</script>

<template>
  <Teleport to="body">
    <Transition name="like-toast">
      <div
        v-if="store.likeNotice"
        class="like-toast"
        :class="`is-${store.likeNotice.type}`"
        role="status"
        aria-live="polite"
      >
        <Heart v-if="store.likeNotice.type === 'success'" :size="19" fill="currentColor" />
        <Info v-else :size="19" />
        <span>{{ store.likeNotice.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.like-toast {
  position: fixed;
  z-index: 3000;
  bottom: 28px;
  left: 50%;
  display: flex;
  min-height: 48px;
  max-width: calc(100% - 32px);
  align-items: center;
  gap: 9px;
  padding: 0 17px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  background: #1b2923;
  box-shadow: 0 14px 34px rgba(17, 28, 23, 0.24);
  color: #ffffff;
  font-size: 14px;
  font-weight: 750;
  transform: translateX(-50%);
}

.like-toast.is-success svg {
  color: #ff9b86;
}

.like-toast.is-info svg {
  color: #f2c96d;
}

.like-toast-enter-active,
.like-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.like-toast-enter-from,
.like-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

@media (max-width: 560px) {
  .like-toast {
    bottom: 18px;
    width: max-content;
    justify-content: center;
    font-size: 13px;
  }
}
</style>
