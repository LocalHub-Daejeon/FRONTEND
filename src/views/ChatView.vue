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
    <header class="page-heading chat-heading">
      <div>
        <p class="eyebrow dark">AI TRAVEL MATE</p>
        <h1>여행메이트에게 물어보세요</h1>
        <p>대전·충청 관광 정보를 바탕으로 취향에 맞는 장소를 함께 찾습니다.</p>
      </div>
      <button class="icon-button" type="button" title="대화 초기화" @click="store.reset()"><RotateCcw :size="19" /></button>
    </header>

    <div class="chat-workspace">
      <section class="chat-panel">
        <div ref="messageList" class="message-list" aria-live="polite">
          <div
            v-for="(message, index) in store.messages"
            :key="index"
            class="chat-message-row"
            :class="message.role"
          >
            <span v-if="message.role === 'assistant'" class="message-avatar"><Bot :size="18" /></span>
            <div class="chat-message" :class="{ error: message.isError }">{{ message.content }}</div>
          </div>
          <div v-if="store.sending" class="chat-message-row assistant">
            <span class="message-avatar"><Bot :size="18" /></span>
            <div class="chat-message typing"><i></i><i></i><i></i></div>
          </div>
        </div>

        <div v-if="store.messages.length === 1" class="quick-prompts">
          <button v-for="prompt in quickPrompts" :key="prompt" type="button" @click="sendMessage(prompt)">
            <Sparkles :size="15" />{{ prompt }}
          </button>
        </div>

        <form class="chat-composer" @submit.prevent="sendMessage()">
          <input v-model="input" type="text" placeholder="원하는 여행을 편하게 말해주세요" :disabled="store.sending" />
          <button class="send-button" type="submit" title="메시지 전송" :disabled="!input.trim() || store.sending"><Send :size="19" /></button>
        </form>
      </section>

      <aside class="reference-column">
        <div class="reference-heading"><MapPin :size="18" /><h2>추천한 장소</h2></div>
        <p v-if="!store.references.length" class="reference-empty">대화를 시작하면 추천 장소와 기본 정보가 여기에 모입니다.</p>
        <RouterLink
          v-for="item in store.references"
          :key="item.contentid"
          class="chat-reference"
          :to="`/tours/${item.contentid}`"
        >
          <img :src="item.firstimage || fallbackImage" alt="" @error="onImageError" />
          <span><strong>{{ item.title }}</strong><small>{{ item.addr1 || "주소 정보 없음" }}</small></span>
        </RouterLink>
      </aside>
    </div>
  </div>
</template>
