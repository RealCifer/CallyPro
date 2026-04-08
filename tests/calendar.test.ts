import test from "node:test";
import assert from "node:assert/strict";
import { generateCalendarDays, getNextSelection } from "../lib/calendar";

test("generateCalendarDays includes overflow dates and aligned Monday-first", () => {
  const days = generateCalendarDays(0, 2026); // Jan 2026 starts on Thursday
  assert.equal(days.length % 7, 0);
  assert.equal(days[0].date.toDateString(), new Date(2025, 11, 29).toDateString());
  assert.equal(days[0].isCurrentMonth, false);
  assert.equal(days[3].date.toDateString(), new Date(2026, 0, 1).toDateString());
});

test("getNextSelection swaps when second date is earlier", () => {
  const start = new Date(2026, 0, 10);
  const second = new Date(2026, 0, 5);
  const result = getNextSelection(start, null, second);
  assert.equal(result.start?.toDateString(), second.toDateString());
  assert.equal(result.end?.toDateString(), start.toDateString());
});

test("getNextSelection resets after completed range", () => {
  const start = new Date(2026, 0, 10);
  const end = new Date(2026, 0, 15);
  const next = new Date(2026, 0, 20);
  const result = getNextSelection(start, end, next);
  assert.equal(result.start?.toDateString(), next.toDateString());
  assert.equal(result.end, null);
});
