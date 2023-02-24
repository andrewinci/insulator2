export const parseMsToHumanReadable = (ms: number): string => {
  // todo: with days
  const [days, hours, minutes, seconds] = [
    ms / (1000.0 * 60 * 60 * 24),
    ms / (1000.0 * 60 * 60),
    ms / (1000.0 * 60),
    ms / 1000.0,
  ];
  if (days > 1000 || days < -1000 || ms == 0) return "";
  else if (days > 3 || days < -3) return `(~ ${days.toFixed(2)} days)`;
  else if (hours > 3 || hours < -3) return `(~ ${hours.toFixed(2)} hours)`;
  else if (minutes > 3 || minutes < -3) return `(~ ${minutes.toFixed(2)} minutes)`;
  else if (ms > 500 || ms < -500) return `(~ ${seconds.toFixed(2)} seconds)`;
  else return "";
};

export const parseBytesToHumanReadable = (b: number): string => {
  const [GB, MB, KB] = [b / 1_000_000_000.0, b / 1_000_000.0, b / 1000.0];
  if (MB > 500 || MB < -500) return `(~ ${GB.toFixed(2)} GB)`;
  else if (KB > 500 || KB < -500) return `(~ ${MB.toFixed(2)} MB)`;
  else if (b > 500 || b < -500) return `(~ ${KB.toFixed(2)} KB)`;
  else return "";
};
