import { notifyFailure, notifySuccess } from "../helpers/notification";

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
    if (successTitle) notifySuccess(successTitle, successDescription);
    return res;
  } catch (err) {
    console.error(err);
    const { errorType, message } = err as ApiError;
    notifyFailure(errorType, message);
    return Promise.reject(err);
  }
};
