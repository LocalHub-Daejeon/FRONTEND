<script setup>
import { nextTick, ref } from "vue";
import { Bot, MapPin, RotateCcw, Send, Sparkles } from "@lucide/vue";
import { useChatStore } from "../stores/chat";
import { fallbackImage, onImageError } from "../utils/format";

const store = useChatStore();
const input = ref("");
const messageList = ref(null);
const quickPrompts = [
  "대전에서 조용히 산책하기 좋은 곳",
  "아이와 함께 갈 만한 충청권 여행지",
  "비 오는 날 즐기기 좋은 실내 장소",
];

async function sendMessage(message = input.value) {
  const content = message.trim();
  if (!content || store.sending) return;
  input.value = "";
  await store.sendMessage(content);
  await nextTick();
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: "smooth" });
}
</script>

<template>
  <div class="page-width page-view chat-view">
    <!-- 여백을 넉넉하게 개선한 히어로 배너 -->
    <header class="chat-hero fade-in-up">
      <div class="hero-bg-shapes"></div>
      <div class="hero-content">
        <div class="hero-text">
          <p class="eyebrow hero-eyebrow"><Bot :size="14" /> AI TRAVEL MATE</p>
          <h1>여행메이트에게 물어보세요</h1>
          <p>대전·충청 관광 정보를 바탕으로 취향에 맞는 장소를 함께 찾습니다.</p>
        </div>
        <button class="reset-btn" type="button" title="대화 초기화" @click="store.reset()">
          <RotateCcw :size="18" class="reset-icon" /> <span>대화 초기화</span>
        </button>
      </div>
    </header>

    <div class="chat-workspace modern-workspace fade-in-up" style="animation-delay: 0.1s;">
      <section class="chat-panel">
        <div ref="messageList" class="message-list" aria-live="polite">
          <div
            v-for="(message, index) in store.messages"
            :key="index"
            class="chat-message-row pop-in"
            :class="message.role"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <span v-if="message.role === 'assistant'" class="message-avatar modern-avatar">
              <Bot :size="20" stroke-width="2.5" />
            </span>
            <div class="chat-message modern-bubble" :class="{ error: message.isError }">
              {{ message.content }}
            </div>
          </div>
          
          <div v-if="store.sending" class="chat-message-row assistant pop-in">
            <span class="message-avatar modern-avatar"><Bot :size="20" /></span>
            <div class="chat-message modern-bubble typing-indicator">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>

        <div v-if="store.messages.length === 1" class="quick-prompts">
          <button v-for="prompt in quickPrompts" :key="prompt" class="prompt-pill" type="button" @click="sendMessage(prompt)">
            <Sparkles :size="15" class="prompt-icon" /> {{ prompt }}
          </button>
        </div>

        <div class="composer-container">
          <form class="chat-composer modern-composer" @submit.prevent="sendMessage()">
            <input 
              v-model="input" 
              type="text" 
              placeholder="원하는 여행을 편하게 말해주세요" 
              :disabled="store.sending" 
              class="composer-input"
            />
            <button class="send-button modern-send" type="submit" title="메시지 전송" :disabled="!input.trim() || store.sending">
              <Send :size="19" class="send-icon" />
            </button>
          </form>
        </div>
      </section>

      <aside class="reference-column modern-sidebar">
        <div class="reference-heading">
          <div class="heading-icon-wrap"><MapPin :size="18" stroke-width="2.5" /></div>
          <h2>추천한 장소</h2>
        </div>
        
        <div class="reference-content">
          <p v-if="!store.references.length" class="reference-empty">
            <Bot :size="32" class="empty-icon" />
            대화를 시작하면 추천 장소와 기본 정보가 여기에 모입니다.
          </p>
          
          <div class="reference-list">
            <RouterLink
              v-for="item in store.references"
              :key="item.contentid"
              class="chat-reference modern-ref-card"
              :to="`/tours/${item.contentid}`"
            >
              <div class="ref-img-wrap">
                <img :src="item.firstimage || fallbackImage" alt="" @error="onImageError" />
              </div>
              <div class="ref-info">
                <strong>{{ item.title }}</strong>
                <small><MapPin :size="12" class="tiny-pin" /> {{ item.addr1 || "주소 정보 없음" }}</small>
              </div>
            </RouterLink>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* 애니메이션 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.pop-in {
  opacity: 0;
  animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 히어로 배너 (여백 대폭 수정) */
.chat-hero {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #1b2923 0%, #0d1a14 100%);
  margin-bottom: 32px;
  border: 1px solid #2a3c33;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 0%, rgba(230, 184, 92, 0.1) 0%, transparent 60%);
}

.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 32px;
  z-index: 1;
}

.hero-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px; /* 텍스트 덩어리와 버튼 사이의 여백을 넉넉하게 확보 */
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--yellow);
  background: rgba(230, 184, 92, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 24px; /* 태그와 큰 제목 사이의 여백 */
}

.hero-text h1 {
  font-size: 38px;
  font-weight: 900;
  color: #ffffff;
  margin-top: 24px; /* 👈 이 부분을 새롭게 추가하여 간격을 확보하세요. */
  margin-bottom: 16px; /* 큰 제목과 설명 사이의 여백 */
  letter-spacing: -0.5px;
}

.hero-text p {
  font-size: 16.5px;
  color: #b9c5bf;
  margin: 0;
  line-height: 1.6;
  word-break: keep-all;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 0 24px;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.reset-icon {
  transition: transform 0.4s ease;
}

.reset-btn:hover .reset-icon {
  transform: rotate(-180deg);
}

/* 챗 워크스페이스 레이아웃 */
.modern-workspace {
  grid-template-columns: minmax(0, 1fr) 380px;
  min-height: 700px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--line);
  overflow: hidden;
}

.chat-panel {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: #fcfdfc;
}

/* 메시지 리스트 영역 */
.message-list {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chat-message-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.chat-message-row.user {
  justify-content: flex-end;
}

.modern-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(8, 127, 120, 0.2);
}

/* 메시지 버블 디자인 고도화 */
.modern-bubble {
  max-width: 75%;
  padding: 16px 20px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.65;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.chat-message-row.assistant .modern-bubble {
  background: #ffffff;
  border: 1px solid var(--line);
  border-top-left-radius: 4px;
  color: var(--ink);
}

.chat-message-row.user .modern-bubble {
  background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: #ffffff;
  border-top-right-radius: 4px;
}

.modern-bubble.error {
  background: #fff7f5;
  color: var(--danger);
  border-color: #f2dcd8;
}

/* 타이핑 인디케이터 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 20px 24px;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: var(--brand);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 추천 질문(Quick Prompts) 칩 디자인 */
.quick-prompts {
  padding: 0 40px 16px;
  gap: 10px;
  flex-wrap: wrap;
}

.prompt-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid var(--line);
  color: var(--brand-dark);
  font-size: 13px;
  font-weight: 750;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.prompt-pill:hover {
  background: #f0f7f4;
  border-color: var(--brand);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(8, 127, 120, 0.1);
}

.prompt-icon {
  color: var(--brand);
}

/* 채팅 입력창 (Composer) */
.composer-container {
  padding: 24px 40px;
  background: #ffffff;
  border-top: 1px solid var(--line);
}

.modern-composer {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface-alt);
  border-radius: 16px;
  padding: 8px 8px 8px 20px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.modern-composer:focus-within {
  background: #ffffff;
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(8, 127, 120, 0.1);
}

.composer-input {
  flex: 1;
  border: none;
  background: transparent;
  height: 40px;
  font-size: 15px;
  color: var(--ink);
  outline: none;
}

.modern-send {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--brand);
  color: #ffffff;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-send:hover:not(:disabled) {
  transform: scale(1.05);
  background: var(--brand-dark);
  box-shadow: 0 4px 12px rgba(8, 127, 120, 0.25);
}

.modern-send:disabled {
  background: #d9e0da;
  color: #ffffff;
  opacity: 0.7;
}

.send-icon {
  margin-left: -2px;
}

/* 우측 추천 장소 사이드바 */
.modern-sidebar {
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.reference-heading {
  padding: 28px 32px 20px;
  border-bottom: 1px solid var(--line);
  gap: 12px;
}

.heading-icon-wrap {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #fff0ed;
  color: var(--coral);
}

.reference-heading h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--ink);
}

.reference-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.reference-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 40px 0;
  color: var(--muted);
  font-size: 14px;
}

.empty-icon {
  color: #c9d4cf;
}

.reference-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modern-ref-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: #ffffff;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
}

.modern-ref-card:hover {
  transform: translateY(-4px);
  border-color: var(--brand);
  box-shadow: 0 12px 24px rgba(8, 127, 120, 0.08);
}

.ref-img-wrap {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.ref-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.modern-ref-card:hover .ref-img-wrap img {
  transform: scale(1.1);
}

.ref-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.ref-info strong {
  font-size: 15px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.modern-ref-card:hover .ref-info strong {
  color: var(--brand-dark);
}

.ref-info small {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tiny-pin {
  flex-shrink: 0;
}

/* 반응형 */
@media (max-width: 992px) {
  .modern-workspace {
    grid-template-columns: 1fr;
  }
  
  .chat-panel {
    border-right: none;
    border-bottom: 1px solid var(--line);
    min-height: 600px;
  }
}
</style>