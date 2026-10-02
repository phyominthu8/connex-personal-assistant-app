import { isValidDateKey } from "./task-date";

export function getProjectDateError(startDate?: string, endDate?: string) {
  const start = startDate?.trim() || "";
  const end = endDate?.trim() || "";
  if (start && !isValidDateKey(start)) return "Use YYYY-MM-DD for the project start date.";
  if (end && !isValidDateKey(end)) return "Use YYYY-MM-DD for the project due date.";
  if (start && end && start > end) return "The due date must be on or after the start date.";
  return null;
}
