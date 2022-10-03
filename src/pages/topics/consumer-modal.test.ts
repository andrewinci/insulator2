import { fromUnixTime } from "date-fns";
import { expect, test } from "vitest";
import { dateTimeToUnixTimeMs } from "./consumer-modal";

test("dateTimeToUnix", () => {
  //todo: fix this test
  const date = new Date("2022-10-03T12:30:30Z");
  const time = new Date("2030-11-11T16:48:37Z");
  const res = dateTimeToUnixTimeMs(date, time) / 1000;
  expect(fromUnixTime(res).toISOString()).toBe("2022-10-03T17:48:37.000Z");
});
