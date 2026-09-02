import { describe, expect, it } from "vitest";
import { formatTimeReadable, isValidDateKey, isValidTime, matchesTaskDateFilter, quickDateKey, toDateKey } from "../lib/task-date";

describe("task date utilities", () => {
  const now = new Date(2026, 8, 2, 10, 0);
  it("formats stable date keys", () => expect(toDateKey(now)).toBe("2026-09-02"));
  it("creates quick date options", () => {
    expect(quickDateKey("Today", now)).toBe("2026-09-02");
    expect(quickDateKey("Tomorrow", now)).toBe("2026-09-03");
    expect(quickDateKey("Next Week", now)).toBe("2026-09-09");
  });
  it("validates date bounds and real calendar dates", () => {
    expect(isValidDateKey("2026-09-02", "2026-09-01", "2026-09-30")).toBe(true);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("2026-08-31", "2026-09-01")).toBe(false);
  });
  it("validates and formats 24-hour time", () => {
    expect(isValidTime("09:30")).toBe(true);
    expect(isValidTime("23:59")).toBe(true);
    expect(isValidTime("24:00")).toBe(false);
    expect(formatTimeReadable("18:45")).toBe("6:45 PM");
  });
  it("matches date and completion filters", () => {
    const task = { dueDate: "2026-09-03", completed: false };
    expect(matchesTaskDateFilter(task, "Tomorrow", now)).toBe(true);
    expect(matchesTaskDateFilter({ dueDate: "2026-09-01", completed: false }, "Overdue", now)).toBe(true);
    expect(matchesTaskDateFilter({ dueDate: "2026-09-03", completed: true }, "Completed", now)).toBe(true);
  });
});
