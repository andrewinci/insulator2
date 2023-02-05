import { notifyFailure, notifySuccess } from "../helpers/notification";

export type ApiError = {
  errorType: string;
  message: string;
};

type withNotificationsProps<T> = {
  action: () => Promise<T>;
  successTitle?: string;
  successDescription?: string;
  showInModal?: boolean;
};

export const withNotifications = async <T>(props: withNotificationsProps<T>): Promise<T> => {
  const { action, successTitle, successDescription } = props;
  try {
    const res = await action();
    if (successTitle) notifySuccess(successTitle, successDescription, props.showInModal);
    return res;
  } catch (err) {
    console.error(err);
    const { errorType, message } = err as ApiError;
    notifyFailure(errorType, message);
    return Promise.reject(err);
  }
};
