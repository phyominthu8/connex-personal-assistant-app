import { describe, expect, it } from "vitest";
import { normalizeMilestoneReminder } from "../lib/milestone-date";

describe("milestone reminder input", () => {
  it("allows an empty optional reminder", () => {
    expect(normalizeMilestoneReminder(" ")).toEqual({});
  });

  it("normalizes a valid reminder to ISO format", () => {
    expect(normalizeMilestoneReminder("2026-10-20T09:00:00").iso).toMatch(/^2026-10-20T/);
  });

  it("returns a useful validation error for invalid input", () => {
    expect(normalizeMilestoneReminder("not-a-date").error).toContain("valid date and time");
  });
});
