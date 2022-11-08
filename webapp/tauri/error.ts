export type TauriError = {
  errorType: string;
  message: string;
};

export const format = ({ errorType, message }: TauriError) => {
  if (errorType && message) return `${errorType}: ${message}`;
  if (errorType) return `${errorType}`;
  if (message) return `${message}`;
  else return "";
};
