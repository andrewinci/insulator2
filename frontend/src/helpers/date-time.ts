import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const dateTimeToUnixTimeMs = (dateUTC: Date, timeUTC: Date): number => {
  // convert to UTC
  timeUTC = dayjs(timeUTC).utc().toDate();
  dateUTC = dayjs(dateUTC).utc().toDate();
  const dateTime = dateUTC.toISOString().substring(0, 10) + timeUTC.toISOString().substring(10);
  return dayjs(new Date(dateTime)).unix() * 1000;
};
