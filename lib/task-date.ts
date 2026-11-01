export type TaskDateFilter = "All" | "Today" | "Tomorrow" | "This Week" | "Overdue" | "Active" | "Completed";

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function formatDateReadable(key: string) {
  return dateFromKey(key).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatTimeReadable(time: string) {
  if (!isValidTime(time)) return time;
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function isValidTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return false;
  return true;
}

export function isValidDateKey(value: string, minDate?: string, maxDate?: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = dateFromKey(value);
  if (toDateKey(date) !== value) return false;
  if (minDate && value < minDate) return false;
  if (maxDate && value > maxDate) return false;
  return true;
}

export function getTaskDateError(startDate: string, dueDate: string) {
  if (!isValidDateKey(startDate)) return "Choose a valid start date.";
  if (!isValidDateKey(dueDate)) return "Choose a valid due date.";
  if (startDate > dueDate) return "The start date must be on or before the due date.";
  return null;
}

export function quickDateKey(option: "Today" | "Tomorrow" | "Next Week", now = new Date()) {
  const date = new Date(now);
  if (option === "Tomorrow") date.setDate(date.getDate() + 1);
  if (option === "Next Week") date.setDate(date.getDate() + 7);
  return toDateKey(date);
}

export function matchesTaskDateFilter(task: { dueDate?: string; completed: boolean }, filter: TaskDateFilter, now = new Date()) {
  if (filter === "All") return true;
  if (filter === "Active") return !task.completed;
  if (filter === "Completed") return task.completed;
  if (!task.dueDate) return false;
  const today = toDateKey(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toDateKey(tomorrowDate);
  if (filter === "Today") return task.dueDate === today;
  if (filter === "Tomorrow") return task.dueDate === tomorrow;
  if (filter === "Overdue") return task.dueDate < today && !task.completed;
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  return filter === "This Week" && task.dueDate >= today && task.dueDate <= toDateKey(weekEnd);
}
