import { listen } from "@tauri-apps/api/event";
import { addNotification } from "../providers";
import { TauriError } from "./error";

type ActionCompleteEvent = {
  action: string;
  id: string;
  status: "Success" | { Fail: TauriError };
};

// listen for errors emitted by the backend
listen<TauriError>("error", (event) => {
  addNotification({
    type: "error",
    title: event.payload.errorType,
    description: event.payload.message,
  });
});

type ActionCompleteHandler = (event: ActionCompleteEvent) => boolean;
const handlers: ActionCompleteHandler[] = [];

// listen for completed actions from the backend
listen<ActionCompleteEvent>("action_status", (event) => {
  for (let i = 0; i < handlers.length; i++) {
    if (handlers[i](event.payload)) {
      handlers.splice(i, 1);
    }
  }
});

const registerHandler = (handler: ActionCompleteHandler) => {
  handlers.push(handler);
};

export const waitEvent = (id: string, action: string): Promise<ActionCompleteEvent> =>
  new Promise((resolve, reject) => {
    registerHandler((event) => {
      if (event.id == id && event.action == action) {
        if (event.status == "Success") resolve(event);
        else reject(event.status.Fail);
        return true;
      }
      return false;
    });
  });
