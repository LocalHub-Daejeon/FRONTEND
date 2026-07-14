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
  <form class="post-editor" @submit.prevent="submit">
    <label>
      <span>제목 <small>{{ form.title.length }}/200</small></span>
      <input
        v-model="form.title"
        maxlength="200"
        placeholder="여행 이야기의 제목을 입력하세요"
        autofocus
      />
    </label>
    <label>
      <span>내용</span>
      <textarea
        v-model="form.content"
        rows="10"
        placeholder="방문한 장소, 좋았던 점, 알아두면 좋은 팁을 나눠주세요."
      ></textarea>
    </label>
    <label>
      <span><LockKeyhole :size="15" /> 비밀번호</span>
      <input
        v-model="form.password"
        type="password"
        maxlength="100"
        autocomplete="new-password"
        placeholder="수정·삭제할 때 필요합니다"
      />
    </label>
    <p v-if="touched && !valid" class="form-error">제목, 내용, 비밀번호를 모두 입력해주세요.</p>
    <div class="form-footer">
      <p>비회원 게시글이며 비밀번호는 복구할 수 없습니다.</p>
      <button class="primary-button" type="submit" :disabled="busy">
        <Save :size="17" /> {{ busy ? "저장 중" : post ? "수정 완료" : "게시하기" }}
      </button>
    </div>
  </form>
</template>
