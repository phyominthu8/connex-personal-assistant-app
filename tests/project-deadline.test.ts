import { describe, expect, it } from "vitest";
import { projectDeadlineDate } from "../lib/project-deadline";

describe("project deadline reminders", () => {
  it("normalizes a valid project deadline to a local notification time", () => {
    expect(projectDeadlineDate("2026-09-30")?.toISOString()).toBe("2026-09-30T09:00:00.000Z");
  });

  it("rejects missing and malformed deadlines", () => {
    expect(projectDeadlineDate()).toBeNull();
    expect(projectDeadlineDate("not-a-date")).toBeNull();
  });
});
