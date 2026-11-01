import { describe, expect, it } from "vitest";
import { filterMilestonesForProject } from "../lib/task-milestones";

describe("task milestone filtering", () => {
  const milestones = [
    { id: "m1", projectId: "p1", title: "Design" },
    { id: "m2", projectId: "p2", title: "Launch" },
    { id: "m3", projectId: 1, title: "Review" },
  ];

  it("returns only milestones belonging to the selected project", () => {
    expect(filterMilestonesForProject(milestones, "p1").map((item) => item.id)).toEqual(["m1"]);
    expect(filterMilestonesForProject(milestones, "1").map((item) => item.id)).toEqual(["m3"]);
  });

  it("returns no milestones when no project is selected", () => {
    expect(filterMilestonesForProject(milestones, "")).toEqual([]);
  });
});
