import { describe, expect, it } from "vitest";
import { getProjectStatusLabel, isProjectOverdue } from "../lib/project-status";

describe("project overdue status", () => {
  const now = new Date("2026-11-02T12:00:00Z");

  it("marks an unfinished project overdue when its due date has passed", () => {
    expect(isProjectOverdue("active", "2026-11-01", now)).toBe(true);
    expect(getProjectStatusLabel("active", "2026-11-01", now)).toBe("Overdue");
  });

  it("does not replace completed status with overdue", () => {
    expect(isProjectOverdue("completed", "2026-11-01", now)).toBe(false);
    expect(getProjectStatusLabel("completed", "2026-11-01", now)).toBe("Completed");
  });

  it("does not mark projects due today overdue", () => {
    expect(isProjectOverdue("active", "2026-11-02", now)).toBe(false);
  });
});
