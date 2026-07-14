import { defineStore } from "pinia";
import { chatApi } from "../services/api";

const welcomeMessage = {
  role: "assistant",
  content: "어떤 하루를 보내고 싶나요? 지역, 동행, 분위기를 알려주시면 관광 정보 안에서 골라드릴게요.",
};

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [welcomeMessage],
    history: [],
    references: [],
    sending: false,
    error: "",
  }),
  actions: {
    async sendMessage(content) {
      this.messages.push({ role: "user", content });
      this.sending = true;
      this.error = "";
      try {
        const data = await chatApi.send(content, this.history);
        this.history.push(
          { role: "user", content },
          { role: "assistant", content: data.reply },
        );
        this.messages.push({ role: "assistant", content: data.reply });
        this.references = data.references || [];
      } catch (error) {
        this.error = error.message;
        this.messages.push({
          role: "assistant",
          content: `지금은 답변을 가져오지 못했어요. ${error.message}`,
          isError: true,
        });
      } finally {
        this.sending = false;
      }
    },
    reset() {
      this.messages = [{ ...welcomeMessage }];
      this.history = [];
      this.references = [];
      this.error = "";
    },
  },
});
