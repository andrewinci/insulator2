import { pretty } from "./json";
import { describe, it, expect } from "vitest";

describe("pretty", () => {
  it("should return an empty string if no argument is passed", () => {
    expect(pretty()).toEqual("");
  });

  it("should return a pretty-printed JSON string if a valid JSON string is passed", () => {
    const json = '{"name":"John", "age":30, "city":"New York"}';
    expect(pretty(json)).toEqual('{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}');
  });

  it("should return the original string if passed string is not valid JSON", () => {
    const invalidJson = '{"name":"John", age:30, "city":"New York"}';
    expect(pretty(invalidJson)).toEqual(invalidJson);
  });
});
