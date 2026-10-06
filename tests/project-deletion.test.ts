import { describe, expect, it } from "vitest";
import { filterProjectLinkedTasks, isTaskLinkedToProject } from "../lib/project-deletion";

describe("project deletion relationships", () => {
  it("matches tasks by project ID or legacy project title", () => {
    expect(isTaskLinkedToProject({ projectId: "7", project: "Website" }, "7", "Website")).toBe(true);
    expect(isTaskLinkedToProject({ project: "Website" }, "7", "Website")).toBe(true);
    expect(isTaskLinkedToProject({ projectId: "8", project: "Other" }, "7", "Website")).toBe(false);
  });

  it("filters only tasks belonging to the deleted project", () => {
    const tasks = [
      { id: "1", projectId: "7", project: "Website" },
      { id: "2", projectId: "7", project: "Renamed Website" },
      { id: "3", projectId: "8", project: "Other" },
    ];
    expect(filterProjectLinkedTasks(tasks, "7", "Website").map((task) => task.id)).toEqual(["1", "2"]);
  });
});
