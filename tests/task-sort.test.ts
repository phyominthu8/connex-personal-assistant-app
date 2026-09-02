import { describe, expect, it } from "vitest";
import { sortTasks, type SortableTask } from "../lib/task-sort";

describe("task sorting", () => {
  const tasks: SortableTask[] = [
    { id: "1", title: "Write brief", priority: "Low", dueDate: "2026-09-04", dueTime: "09:00", createdAt: "2026-09-01T08:00:00Z" },
    { id: "2", title: "Book review", priority: "High", dueDate: "2026-09-06", dueTime: "09:00", createdAt: "2026-09-03T08:00:00Z" },
    { id: "3", title: "Call designer", priority: "Medium", dueDate: "2026-09-02", dueTime: "09:00", createdAt: "2026-09-02T08:00:00Z" },
  ];
  it("sorts priority from high to low", () => expect(sortTasks(tasks, "priority").map((task) => task.title)).toEqual(["Book review", "Call designer", "Write brief"]));
  it("sorts created date from newest to oldest", () => expect(sortTasks(tasks, "created").map((task) => task.title)).toEqual(["Book review", "Call designer", "Write brief"]));
  it("sorts due date from soonest to latest", () => expect(sortTasks(tasks, "due").map((task) => task.title)).toEqual(["Call designer", "Write brief", "Book review"]));
  it("sorts titles alphabetically without mutating input", () => { const result = sortTasks(tasks, "title"); expect(result.map((task) => task.title)).toEqual(["Book review", "Call designer", "Write brief"]); expect(tasks[0].title).toBe("Write brief"); });
  it("uses a stable id tie-breaker", () => { const tied = [{ id: "b", title: "Same", priority: "High" }, { id: "a", title: "Same", priority: "High" }]; expect(sortTasks(tied, "priority").map((task) => task.id)).toEqual(["a", "b"]); });
});
