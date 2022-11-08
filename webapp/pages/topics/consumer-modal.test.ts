import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { expect, test } from "vitest";
import { dateTimeToUnixTimeMs } from "./consumer-modal";

dayjs.extend(utc);

test("dateTimeToUnix", () => {
  //todo: fix this test
  const date = dayjs.utc("2022-10-03T12:30:30Z").toDate();
  const time = dayjs.utc("2030-11-11T16:48:37Z").toDate();
  const res = dateTimeToUnixTimeMs(date, time) / 1000;
  expect(dayjs.unix(res).toISOString()).toBe("2022-10-03T16:48:37.000Z");
});
