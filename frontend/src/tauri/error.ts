export type ApiError = {
  errorType: string;
  message: string;
};

export const format = (err: ApiError) => {
  const { errorType, message } = err;
  if (errorType && message) return `${errorType}: ${message}`;
  if (errorType) return `${errorType}`;
  if (message) return `${message}`;
  else return `${err}`;
};
