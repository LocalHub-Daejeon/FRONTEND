import { defineStore } from "pinia";
import { createRealtimeSocket } from "../services/socket";

let socketHandle = null;

export const useRealtimeStore = defineStore("realtime", {
  state: () => ({
    viewerCount: null,
    postNoticeKey: 0,
  }),
  actions: {
    init() {
      if (socketHandle) return;
      socketHandle = createRealtimeSocket({
        onMessage: (msg) => {
          if (msg.type === "viewer_count") {
            this.viewerCount = msg.count;
          } else if (msg.type === "new_post") {
            this.postNoticeKey += 1;
          }
        },
      });
    },
  },
});
