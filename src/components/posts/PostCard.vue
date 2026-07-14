<script setup>
import { Eye, Heart, MessageSquareText } from "@lucide/vue";
import { formatDate, truncate } from "../../utils/format";

defineProps({ post: { type: Object, required: true } });
const emit = defineEmits(["like"]);
</script>

<template>
  <article class="post-card">
    <RouterLink :to="`/community/${post.id}`" class="post-card-main">
      <div class="post-card-title">
        <MessageSquareText :size="18" />
        <h3>{{ post.title }}</h3>
      </div>
      <p>{{ truncate(post.content, 150) }}</p>
      <div class="post-card-meta">
        <span>{{ formatDate(post.created_at) }}</span>
        <span><Eye :size="15" /> {{ post.view_count }}</span>
      </div>
    </RouterLink>
    <button
      class="like-button"
      type="button"
      :aria-label="`${post.title} 좋아요`"
      @click="emit('like', post.id)"
    >
      <Heart :size="17" /> {{ post.like_count }}
    </button>
  </article>
</template>
