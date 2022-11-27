export type TauriError = {
  errorType: string;
  message: string;
};

export const format = (err: TauriError) => {
  const { errorType, message } = err;
  if (errorType && message) return `${errorType}: ${message}`;
  if (errorType) return `${errorType}`;
  if (message) return `${message}`;
  else return `${err}`;
};
