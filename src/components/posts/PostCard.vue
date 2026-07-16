<script setup>
import { Eye, Heart, MessageSquareText } from "@lucide/vue";
import { formatDate, truncate } from "../../utils/format";

defineProps({
  post: { type: Object, required: true },
  liked: { type: Boolean, default: false },
  liking: { type: Boolean, default: false },
});
const emit = defineEmits(["like"]);
</script>

<template>
  <article class="post-card modern-post-card">
    <RouterLink :to="`/community/${post.id}`" class="post-card-main">
      <div class="post-card-title">
        <div class="icon-bubble">
          <MessageSquareText :size="16" stroke-width="2.5" />
        </div>
        <h3 class="title-text">{{ post.title }}</h3>
      </div>
      <p class="post-preview">{{ truncate(post.content, 150) }}</p>
      <div class="post-card-meta">
        <span class="meta-item time">{{ formatDate(post.created_at) }}</span>
        <span class="meta-divider">·</span>
        <span class="meta-item views">
          <Eye :size="14" class="meta-icon" /> {{ post.view_count }}
        </span>
      </div>
    </RouterLink>
    
    <div class="post-card-action">
      <button
        class="interactive-like-btn"
        :class="{ 'is-liked': liked }"
        type="button"
        :aria-label="liked ? `${post.title} 좋아요 누름` : `${post.title} 좋아요`"
        :aria-pressed="liked"
        :title="liked ? '이미 좋아요를 누르셨어요' : '좋아요'"
        :disabled="liking"
        @click.stop="emit('like', post.id)"
      >
        <Heart :size="16" stroke-width="2.5" class="heart-icon" :fill="liked ? 'currentColor' : 'none'" />
        <span class="like-count">{{ post.like_count }}</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
/* 포스트 카드 기본 래퍼 */
.modern-post-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 140px;
  padding: 24px 28px;
  border-bottom: 1px solid var(--line);
  background: transparent;
  transition: all 0.3s ease;
  overflow: hidden;
  text-decoration: none;
}

/* 좌측 인디케이터 애니메이션 (호버 시 채워지는 선) */
.modern-post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0%;
  background: var(--brand);
  transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 0 4px 4px 0;
}

.modern-post-card:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
}

.modern-post-card:hover::before {
  height: 100%;
}

/* 메인 컨텐츠 영역 */
.post-card-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding-right: 24px;
  text-decoration: none;
}

/* 타이틀 영역 */
.post-card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.icon-bubble {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #fff0ed;
  color: var(--coral);
  transition: all 0.3s ease;
}

.modern-post-card:hover .icon-bubble {
  background: var(--coral);
  color: #ffffff;
  transform: scale(1.05);
}

.title-text {
  overflow: hidden;
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.modern-post-card:hover .title-text {
  color: var(--brand-dark);
}

/* 본문 프리뷰 */
.post-preview {
  display: -webkit-box;
  overflow: hidden;
  max-width: 800px;
  margin: 0 0 16px 44px; /* 타이틀 텍스트 시작선에 맞춤 */
  color: var(--ink-soft);
  font-size: 14.5px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* 메타 정보 (날짜, 조회수) */
.post-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 44px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  opacity: 0.7;
}

.meta-divider {
  color: var(--line);
  font-weight: 900;
}

/* 좋아요 버튼 고도화 */
.post-card-action {
  flex: 0 0 auto;
}

.interactive-like-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 64px;
  height: 64px;
  border: 1px solid #f2dcd8;
  border-radius: 14px;
  background: #ffffff;
  color: var(--coral);
  font-weight: 800;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  cursor: pointer;
}

.interactive-like-btn:hover {
  background: #fff7f5;
  border-color: var(--coral);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(214, 83, 55, 0.15);
}

.interactive-like-btn:active {
  transform: translateY(1px) scale(0.95);
}

.interactive-like-btn.is-liked {
  border-color: #efb2a6;
  background: #fff0ed;
  color: var(--coral-dark);
}

.interactive-like-btn:disabled {
  cursor: wait;
  opacity: 0.62;
  transform: none;
}

.heart-icon {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.interactive-like-btn:hover .heart-icon {
  transform: scale(1.15);
  fill: var(--coral);
}

.like-count {
  font-size: 13px;
  color: var(--ink-soft);
}

.interactive-like-btn:hover .like-count {
  color: var(--coral-dark);
}

/* 모바일 반응형 처리 */
@media (max-width: 560px) {
  .modern-post-card {
    padding: 20px 16px;
    align-items: flex-start;
  }
  
  .post-preview,
  .post-card-meta {
    margin-left: 0;
  }
  
  .icon-bubble {
    display: none; /* 모바일에서는 공간 절약을 위해 아이콘 숨김 */
  }
  
  .title-text {
    font-size: 17px;
  }
  
  .interactive-like-btn {
    min-width: 54px;
    height: 54px;
    margin-top: 4px;
  }
}
</style>
