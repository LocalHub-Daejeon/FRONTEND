import { defineStore } from "pinia";
import { chatApi } from "../services/api";
import i18n from "../i18n";

function createWelcomeMessage() {
  return {
    role: "assistant",
    content: i18n.global.t("chat.welcome"),
  };
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [createWelcomeMessage()],
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
          content: i18n.global.t("chat.errorPrefix", { message: error.message }),
          isError: true,
        });
      } finally {
        this.sending = false;
      }
    },
    reset() {
      this.messages = [createWelcomeMessage()];
      this.history = [];
      this.references = [];
      this.error = "";
    },
  },
});
