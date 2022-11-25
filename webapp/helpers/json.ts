export const pretty = (j?: string): string => {
  if (!j) {
    return "";
  }
  try {
    return JSON.stringify(JSON.parse(j), null, 2);
  } catch {
    return j;
  }
};
