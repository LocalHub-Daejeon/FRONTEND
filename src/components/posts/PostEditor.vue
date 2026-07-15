<script setup>
import { computed, reactive, ref } from "vue";
import { LockKeyhole, Save } from "@lucide/vue";

const props = defineProps({
  post: { type: Object, default: null },
  busy: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const form = reactive({
  title: props.post?.title || "",
  content: props.post?.content || "",
  password: "",
});
const touched = ref(false);
const valid = computed(
  () => form.title.trim() && form.content.trim() && form.password.length > 0,
);

function submit() {
  touched.value = true;
  if (!valid.value) return;
  emit("submit", {
    title: form.title.trim(),
    content: form.content.trim(),
    password: form.password,
  });
}
</script>

<template>
  <form class="post-editor modern-form" @submit.prevent="submit">
    <label class="form-group">
      <span class="label-text">제목 <small class="char-count">{{ form.title.length }}/200</small></span>
      <input
        v-model="form.title"
        class="modern-input"
        maxlength="200"
        placeholder="여행 이야기의 멋진 제목을 지어주세요"
        autofocus
      />
    </label>
    
    <label class="form-group">
      <span class="label-text">내용</span>
      <textarea
        v-model="form.content"
        class="modern-textarea"
        rows="10"
        placeholder="방문한 장소, 좋았던 점, 알아두면 좋은 팁을 자유롭게 나눠주세요."
      ></textarea>
    </label>
    
    <label class="form-group pw-group">
      <span class="label-text"><LockKeyhole :size="15" class="lock-icon" /> 비밀번호</span>
      <input
        v-model="form.password"
        class="modern-input"
        type="password"
        maxlength="100"
        autocomplete="new-password"
        placeholder="수정·삭제 권한을 위한 비밀번호"
      />
    </label>
    
    <div v-if="touched && !valid" class="form-error-banner">
      제목, 내용, 비밀번호를 모두 입력해주세요.
    </div>
    
    <div class="form-footer advanced-footer">
      <p class="notice-text">비회원 게시글이며 비밀번호는 복구할 수 없습니다.</p>
      <button class="primary-button submit-btn" type="submit" :disabled="busy">
        <Save :size="18" stroke-width="2.5" /> 
        <span class="btn-text">{{ busy ? "저장 중..." : post ? "수정 완료" : "게시하기" }}</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-text {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.char-count {
  background: var(--surface-alt);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: var(--muted);
}

.modern-input, .modern-textarea {
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  color: var(--ink);
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.modern-textarea {
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
}

.modern-input:focus, .modern-textarea:focus {
  border-color: var(--brand);
  background: #ffffff;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.01), 0 0 0 4px rgba(8, 127, 120, 0.1);
  outline: none;
}

.modern-input::placeholder, .modern-textarea::placeholder {
  color: #aebdb5;
}

.lock-icon {
  margin-right: 4px;
  color: var(--brand);
}

.form-error-banner {
  background: #fff7f5;
  color: var(--danger);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  border-left: 3px solid var(--danger);
}

.advanced-footer {
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px dashed var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notice-text {
  color: var(--muted);
  font-size: 12.5px;
  max-width: 60%;
}

.submit-btn {
  height: 48px;
  padding: 0 28px;
  border-radius: 12px;
  font-size: 15px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
  box-shadow: 0 6px 16px rgba(8, 127, 120, 0.2);
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(8, 127, 120, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(1px);
}
</style>