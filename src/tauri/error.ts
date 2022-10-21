export type TauriError = {
  errorType: string;
  message: string;
};

export const format = ({ errorType, message }: TauriError) => `${errorType}: ${message}`;
