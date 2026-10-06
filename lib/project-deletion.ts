type ProjectLinkedTask = { projectId?: string | number | null; project?: string | null };

export function isTaskLinkedToProject(task: ProjectLinkedTask, projectId: string, projectTitle?: string) {
  return String(task.projectId ?? "") === projectId || Boolean(projectTitle && task.project === projectTitle);
}

export function filterProjectLinkedTasks<T extends ProjectLinkedTask>(tasks: T[], projectId: string, projectTitle?: string) {
  return tasks.filter((task) => isTaskLinkedToProject(task, projectId, projectTitle));
}
