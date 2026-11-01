export const DEFAULT_TASK_COLOR = "#2563EB";
export const DEFAULT_PROJECT_COLOR = "#4F46E5";
export const DEFAULT_MILESTONE_COLOR = "#D97706";

export const CONNEX_COLOR_VALUES = [
  "#2563EB",
  "#4F46E5",
  "#7C3AED",
  "#E11D48",
  "#EA580C",
  "#D97706",
  "#16A34A",
  "#0F766E",
  "#475569",
] as const;

export function inheritedEntityColor(projectColor: string | undefined, fallback: string) {
  return projectColor || fallback;
}
