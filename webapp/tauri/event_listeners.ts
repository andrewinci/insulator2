import { listen } from "@tauri-apps/api/event";
import { addNotification } from "../providers";
import { TauriError } from "./error";

type ActionCompleteEvent<T> = {
  action: string;
  id: string;
  result: { Ok: T } | { Err: TauriError };
};

// listen for errors emitted by the backend
listen<TauriError>("error", (event) => {
  addNotification({
    type: "error",
    title: event.payload.errorType,
    description: event.payload.message,
  });
});

type ActionCompleteHandler<T> = (event: ActionCompleteEvent<T>) => boolean;
const handlers: ActionCompleteHandler<unknown>[] = [];

// listen for completed actions from the backend
listen<ActionCompleteEvent<unknown>>("action_status", (event) => {
  for (let i = 0; i < handlers.length; i++) {
    if (handlers[i](event.payload)) {
      handlers.splice(i, 1);
    }
  }
});

const registerHandler = (handler: ActionCompleteHandler<unknown>) => {
  handlers.push(handler);
};

export function waitEvent<T>(id: string, action: string): Promise<T> {
  return new Promise((resolve, reject) => {
    registerHandler((event) => {
      if (event.id == id && event.action == action) {
        if ("Ok" in event.result) resolve(event.result.Ok as T);
        else reject(event.result.Err);
        return true;
      }
      return false;
    });
  });
}
