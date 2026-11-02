import { matchesTaskDateFilter, type TaskDateFilter } from "./task-date";

type TimelineTask = {
  project?: string;
  projectId?: string;
  dueDate?: string;
  complete: boolean;
};

type TimelineProject = {
  id: string;
  title: string;
};

export function projectHasTasksMatchingFilter(
  project: TimelineProject,
  tasks: TimelineTask[],
  filter: TaskDateFilter,
  now = new Date(),
) {
  if (filter === "All") return true;
  return tasks.some((task) =>
    (task.projectId === project.id || task.project === project.title) &&
    matchesTaskDateFilter({ dueDate: task.dueDate, completed: task.complete }, filter, now),
  );
}
