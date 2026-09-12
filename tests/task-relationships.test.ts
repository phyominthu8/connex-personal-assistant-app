import { describe, expect, it } from "vitest";
import { assertTaskRelationshipIntegrity } from "../lib/task-relationships";

describe("task relationship integrity", () => {
  it("allows an owned project without a milestone", () => {
    expect(() => assertTaskRelationshipIntegrity({ projectId: 7, ownedProjectId: 7 })).not.toThrow();
  });

  it("rejects a project that is not owned by the current user", () => {
    expect(() => assertTaskRelationshipIntegrity({ projectId: 7, ownedProjectId: 8 })).toThrow("Project not found");
  });

  it("requires a project for milestone assignment", () => {
    expect(() => assertTaskRelationshipIntegrity({ milestoneId: 3, ownedMilestoneProjectId: 7 })).toThrow("A milestone requires a project");
  });

  it("rejects a milestone from another project", () => {
    expect(() => assertTaskRelationshipIntegrity({ projectId: 7, milestoneId: 3, ownedProjectId: 7, ownedMilestoneProjectId: 8 })).toThrow("Milestone does not belong to the selected project");
  });

  it("allows an owned project and milestone pair", () => {
    expect(() => assertTaskRelationshipIntegrity({ projectId: 7, milestoneId: 3, ownedProjectId: 7, ownedMilestoneProjectId: 7 })).not.toThrow();
  });
});
