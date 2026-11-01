export type ProjectScopedMilestone = { id: string | number; projectId: string | number };

export function filterMilestonesForProject<T extends ProjectScopedMilestone>(milestones: T[], projectId: string): T[] {
  if (!projectId) return [];
  return milestones.filter((milestone) => String(milestone.projectId) === String(projectId));
}

export function isOverdueDate(date: string | undefined, today: string): boolean {
  return Boolean(date && date < today);
}
