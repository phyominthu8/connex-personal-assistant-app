export type ProjectHealth = "on-track" | "at-risk" | "complete" | "on-hold" | "no-date";
export function getProjectHealth(status: string, progress: number, endDate?: string, today = new Date("2026-09-02T00:00:00Z")): ProjectHealth {
  if (status === "completed") return "complete";
  if (status === "on_hold") return "on-hold";
  if (!endDate) return "no-date";
  const deadline = new Date(`${endDate}T23:59:59`);
  if (Number.isNaN(deadline.getTime())) return "no-date";
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
  if (daysRemaining < 0 || (daysRemaining <= 7 && progress < 0.7)) return "at-risk";
  return "on-track";
}
export const PROJECT_HEALTH_LABELS: Record<ProjectHealth, string> = { "on-track": "On track", "at-risk": "At risk", complete: "Complete", "on-hold": "On hold", "no-date": "No deadline" };
