import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizePreferences, PREFERENCES_STORAGE_KEY, type Preferences } from "@/lib/preferences";
import { PROJECTS_STORAGE_KEY, MILESTONES_STORAGE_KEY, type LocalMilestone, type LocalProject } from "@/lib/project-store";
import { TASKS_STORAGE_KEY, type LocalTask } from "@/lib/local-store";

export const BACKUP_FORMAT = "connex-backup";
export const BACKUP_VERSION = 1;

export type ConnexBackup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  tasks: LocalTask[];
  projects: LocalProject[];
  milestones: LocalMilestone[];
  preferences: Preferences;
};

function readArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function validateBackup(value: unknown): ConnexBackup {
  if (!isRecord(value) || value.format !== BACKUP_FORMAT || value.version !== BACKUP_VERSION) {
    throw new Error("This file is not a supported Connex backup.");
  }
  if (!Array.isArray(value.tasks) || !Array.isArray(value.projects) || !Array.isArray(value.milestones) || !isRecord(value.preferences)) {
    throw new Error("The backup file is incomplete or invalid.");
  }
  const tasks = value.tasks.filter((item): item is LocalTask => isRecord(item) && typeof item.id === "string" && typeof item.title === "string");
  const projects = value.projects.filter((item): item is LocalProject => isRecord(item) && typeof item.id === "string" && typeof item.title === "string");
  const projectIds = new Set(projects.map((project) => project.id));
  const milestones = value.milestones.filter((item): item is LocalMilestone => isRecord(item) && typeof item.id === "string" && typeof item.title === "string" && typeof item.projectId === "string" && projectIds.has(item.projectId));
  if (tasks.length !== value.tasks.length || projects.length !== value.projects.length) {
    throw new Error("The backup contains invalid task or project records.");
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : new Date().toISOString(),
    tasks,
    projects,
    milestones,
    preferences: normalizePreferences(value.preferences),
  };
}

export async function createConnexBackup(): Promise<ConnexBackup> {
  const values = await AsyncStorage.multiGet([TASKS_STORAGE_KEY, PROJECTS_STORAGE_KEY, MILESTONES_STORAGE_KEY, PREFERENCES_STORAGE_KEY]);
  const byKey = Object.fromEntries(values);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks: readArray<LocalTask>(byKey[TASKS_STORAGE_KEY]),
    projects: readArray<LocalProject>(byKey[PROJECTS_STORAGE_KEY]),
    milestones: readArray<LocalMilestone>(byKey[MILESTONES_STORAGE_KEY]),
    preferences: normalizePreferences(byKey[PREFERENCES_STORAGE_KEY] ? JSON.parse(byKey[PREFERENCES_STORAGE_KEY] as string) : {}),
  };
}

export async function restoreConnexBackup(raw: string): Promise<ConnexBackup> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  const backup = validateBackup(parsed);
  await AsyncStorage.multiSet([
    [TASKS_STORAGE_KEY, JSON.stringify(backup.tasks)],
    [PROJECTS_STORAGE_KEY, JSON.stringify(backup.projects)],
    [MILESTONES_STORAGE_KEY, JSON.stringify(backup.milestones)],
    [PREFERENCES_STORAGE_KEY, JSON.stringify(backup.preferences)],
  ]);
  return backup;
}
