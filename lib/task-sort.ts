export type TaskSortOption = "priority" | "created" | "due" | "title";
export type SortableTask = { id: string; title: string; priority?: string; dueDate?: string; dueTime?: string; createdAt?: string | Date | number };
export const TASK_SORT_OPTIONS: Array<{ key: TaskSortOption; label: string }> = [
  { key: "priority", label: "Priority · High to Low" },
  { key: "created", label: "Created · Newest to Oldest" },
  { key: "due", label: "Due date · Soonest first" },
  { key: "title", label: "Title · A to Z" },
];
const priorityRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
function createdValue(task: SortableTask) {
  if (task.createdAt instanceof Date) return task.createdAt.getTime();
  if (typeof task.createdAt === "number") return task.createdAt;
  if (task.createdAt) { const parsed = Date.parse(task.createdAt); if (!Number.isNaN(parsed)) return parsed; }
  const numericId = Number(task.id); return Number.isFinite(numericId) ? numericId : 0;
}
function dueValue(task: SortableTask) {
  if (!task.dueDate) return Number.POSITIVE_INFINITY;
  const date = Date.parse(`${task.dueDate}T${task.dueTime || "23:59"}`);
  return Number.isNaN(date) ? Number.POSITIVE_INFINITY : date;
}
export function compareTasks(a: SortableTask, b: SortableTask, option: TaskSortOption) {
  let difference = 0;
  if (option === "priority") difference = (priorityRank[b.priority || "Medium"] || 0) - (priorityRank[a.priority || "Medium"] || 0);
  if (option === "created") difference = createdValue(b) - createdValue(a);
  if (option === "due") difference = dueValue(a) - dueValue(b);
  if (option === "title") difference = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  if (difference !== 0) return difference;
  return a.id.localeCompare(b.id);
}
export function sortTasks<T extends SortableTask>(tasks: T[], option: TaskSortOption) {
  return [...tasks].sort((a, b) => compareTasks(a, b, option));
}
