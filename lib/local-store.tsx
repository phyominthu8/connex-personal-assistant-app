import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isValidDateKey, isValidTime, quickDateKey } from "@/lib/task-date";
import { filterProjectLinkedTasks } from "@/lib/project-deletion";

export type LocalTask = { id: string; title: string; due: string; startDate?: string; dueDate: string; dueTime: string; priority: "Low" | "Medium" | "High"; project: string; projectId?: string; milestoneId?: string; category: string; recurrence?: string; complete: boolean; notes?: string };
type TaskInput = Pick<LocalTask, "title" | "project" | "projectId" | "milestoneId" | "category" | "priority" | "due" | "startDate" | "dueDate" | "dueTime"> & { notes?: string; recurrence?: string };
const STORAGE_KEY = "personal-assistant.tasks.v2";
const LEGACY_KEY = "personal-assistant.tasks.v1";
const today = quickDateKey("Today");
const seedTasks: LocalTask[] = [
  { id: "1", title: "Prepare weekly priorities", due: "Today · 9:00 AM", dueDate: today, dueTime: "09:00", priority: "High", project: "Personal", category: "Planning", complete: false },
  { id: "2", title: "Review project milestones", due: "Today · 11:30 AM", dueDate: today, dueTime: "11:30", priority: "Medium", project: "Website refresh", category: "Work", complete: true },
  { id: "3", title: "Call with design team", due: "Today · 3:00 PM", dueDate: today, dueTime: "15:00", priority: "Medium", project: "Website refresh", category: "Work", complete: false },
  { id: "4", title: "Plan next week’s meals", due: "Tomorrow", dueDate: quickDateKey("Tomorrow"), dueTime: "18:00", priority: "Low", project: "Personal", category: "Personal", complete: false },
];

type TaskStore = { tasks: LocalTask[]; hydrated: boolean; addTask: (input: TaskInput) => Promise<void>; updateTask: (id: string, input: Partial<TaskInput>) => Promise<void>; deleteTask: (id: string) => Promise<void>; deleteProjectTasks: (projectId: string, projectTitle?: string) => Promise<void>; toggleTask: (id: string) => Promise<void> };
const TaskContext = createContext<TaskStore | null>(null);
function safeTasks(value: string | null) { if (!value) return null; try { const parsed = JSON.parse(value) as Array<Partial<LocalTask>>; if (!Array.isArray(parsed)) return null; return parsed.filter((task) => typeof task.id === "string" && typeof task.title === "string").map((task) => ({ ...task, startDate: task.startDate && isValidDateKey(task.startDate) ? task.startDate : undefined, dueDate: task.dueDate && isValidDateKey(task.dueDate) ? task.dueDate : today, dueTime: task.dueTime && isValidTime(task.dueTime) ? task.dueTime : "09:00", due: task.due || "Today", priority: task.priority === "High" || task.priority === "Low" ? task.priority : "Medium", project: task.project || "Personal", category: task.category || "General", recurrence: task.recurrence, complete: Boolean(task.complete) })) as LocalTask[]; } catch { return null; } }

export function LocalStoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<LocalTask[]>(seedTasks);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { (async () => { const current = safeTasks(await AsyncStorage.getItem(STORAGE_KEY)); const legacy = current ? null : safeTasks(await AsyncStorage.getItem(LEGACY_KEY)); if (current || legacy) { const migrated = current || legacy || seedTasks; setTasks(migrated); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } setHydrated(true); })().catch(() => setHydrated(true)); }, []);
  const persist = async (next: LocalTask[]) => { setTasks(next); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const value = useMemo<TaskStore>(() => ({ tasks, hydrated, addTask: async (input) => persist([{ ...input, id: `${Date.now()}`, complete: false }, ...tasks]), updateTask: async (id, input) => persist(tasks.map((task) => task.id === id ? { ...task, ...input } : task)), deleteTask: async (id) => persist(tasks.filter((task) => task.id !== id)), deleteProjectTasks: async (projectId, projectTitle) => persist(tasks.filter((task) => !filterProjectLinkedTasks([task], projectId, projectTitle).length)), toggleTask: async (id) => persist(tasks.map((task) => task.id === id ? { ...task, complete: !task.complete } : task)) }), [hydrated, tasks]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
export function useLocalTasks() { const value = useContext(TaskContext); if (!value) throw new Error("useLocalTasks must be used inside LocalStoreProvider"); return value; }
