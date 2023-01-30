import { addNotification } from "../providers";

export type ApiError = {
  errorType: string;
  message: string;
};

export const withNotifications = async <T>(
  action: () => Promise<T>,
  successTitle?: string,
  successDescription?: string
): Promise<T> => {
  try {
    const res = await action();
    if (successTitle) {
      addNotification({
        type: "ok",
        title: successTitle,
        description: successDescription,
      });
    }
    return res;
  } catch (err) {
    console.error(err);
    const { errorType, message } = err as ApiError;
    addNotification({
      type: "error",
      title: errorType,
      description: message,
    });
    return Promise.reject(err);
  }
};
