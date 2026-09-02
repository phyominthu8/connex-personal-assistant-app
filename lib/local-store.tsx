import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocalTask = {
  id: string;
  title: string;
  due: string;
  priority: "Low" | "Medium" | "High";
  project: string;
  complete: boolean;
};

const STORAGE_KEY = "personal-assistant.tasks.v1";
const seedTasks: LocalTask[] = [
  { id: "1", title: "Prepare weekly priorities", due: "Today · 9:00 AM", priority: "High", project: "Personal", complete: false },
  { id: "2", title: "Review project milestones", due: "Today · 11:30 AM", priority: "Medium", project: "Website refresh", complete: true },
  { id: "3", title: "Call with design team", due: "Today · 3:00 PM", priority: "Medium", project: "Website refresh", complete: false },
  { id: "4", title: "Plan next week’s meals", due: "Tomorrow", priority: "Low", project: "Personal", complete: false },
];

type TaskStore = { tasks: LocalTask[]; hydrated: boolean; addTask: (input: Pick<LocalTask, "title" | "project" | "priority" | "due">) => Promise<void>; toggleTask: (id: string) => Promise<void> };
const TaskContext = createContext<TaskStore | null>(null);

export function LocalStoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<LocalTask[]>(seedTasks);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { AsyncStorage.getItem(STORAGE_KEY).then((value) => { if (value) setTasks(JSON.parse(value) as LocalTask[]); }).catch(() => undefined).finally(() => setHydrated(true)); }, []);
  const persist = async (next: LocalTask[]) => { setTasks(next); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const value = useMemo<TaskStore>(() => ({ tasks, hydrated, addTask: async (input) => { await persist([{ ...input, id: `${Date.now()}`, complete: false }, ...tasks]); }, toggleTask: async (id) => { await persist(tasks.map((task) => task.id === id ? { ...task, complete: !task.complete } : task)); } }), [hydrated, tasks]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useLocalTasks() { const value = useContext(TaskContext); if (!value) throw new Error("useLocalTasks must be used inside LocalStoreProvider"); return value; }
