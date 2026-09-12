export type TaskRelationshipSelection = {
  projectId?: number | null;
  milestoneId?: number | null;
  ownedProjectId?: number;
  ownedMilestoneProjectId?: number;
};

export function assertTaskRelationshipIntegrity(selection: TaskRelationshipSelection): void {
  const { projectId, milestoneId, ownedProjectId, ownedMilestoneProjectId } = selection;
  if (projectId != null && ownedProjectId !== projectId) throw new Error("Project not found");
  if (milestoneId != null && ownedMilestoneProjectId == null) throw new Error("Milestone not found");
  if (milestoneId != null && projectId == null) throw new Error("A milestone requires a project");
  if (milestoneId != null && ownedMilestoneProjectId !== projectId) throw new Error("Milestone does not belong to the selected project");
}
