import { expect, it } from "vitest";
import { parseAlertUpdate } from "./validation";
it("accepts only known statuses and analysts, and rejects unexpected or malformed input", () => {
  expect(parseAlertUpdate({ status: "investigating", owner: "Ana García" })).toEqual({
    status: "investigating",
    owner: "Ana García",
  });
  for (const value of [
    null,
    [],
    "open",
    { status: "deleted", owner: "Ana García" },
    { status: "open", owner: "unknown" },
    { status: "open" },
    { status: "open", owner: "Ana García", severity: "low" },
  ])
    expect(parseAlertUpdate(value)).toBeNull();
});
it("rejects non-string statuses even when JavaScript would coerce them to a valid name", () => {
  expect(parseAlertUpdate({ status: ["open"], owner: "Ana García" })).toBeNull();
});
