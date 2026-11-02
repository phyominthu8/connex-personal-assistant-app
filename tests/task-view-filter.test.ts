import { describe, expect, it } from "vitest";
import { projectHasTasksMatchingFilter } from "../lib/task-view-filter";

describe("timeline task filters", () => {
  const now = new Date("2026-11-02T12:00:00Z");
  const project = { id: "p1", title: "Project One" };

  it("matches a project with an unfinished overdue task", () => {
    expect(projectHasTasksMatchingFilter(project, [{ projectId: "p1", dueDate: "2026-11-01", complete: false }], "Overdue", now)).toBe(true);
  });

  it("excludes completed and unrelated overdue tasks", () => {
    expect(projectHasTasksMatchingFilter(project, [{ projectId: "p1", dueDate: "2026-11-01", complete: true }], "Overdue", now)).toBe(false);
    expect(projectHasTasksMatchingFilter(project, [{ projectId: "p2", dueDate: "2026-11-01", complete: false }], "Overdue", now)).toBe(false);
  });
});
