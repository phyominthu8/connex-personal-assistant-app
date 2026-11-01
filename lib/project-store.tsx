import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocalMilestone = { id: string; projectId: string; title: string; description?: string; dueDate: string; reminderAt?: string; completed: boolean };
export type LocalProject = { id: string; title: string; description?: string; startDate?: string; endDate?: string; type: "personal" | "work" | "team" | "other"; status: "active" | "completed" | "on_hold" | "archived"; color: string; icon: string };
const PROJECTS_KEY = "personal-assistant.projects.v1";
const MILESTONES_KEY = "personal-assistant.milestones.v1";
const seedProjects: LocalProject[] = [
  { id: "p1", title: "Website refresh", type: "work", status: "active", color: "#4F46E5", icon: "folder", startDate: "2026-09-01", endDate: "2026-09-30", description: "A focused refresh for the marketing site." },
  { id: "p2", title: "Home garden", type: "personal", status: "active", color: "#16A34A", icon: "leaf", startDate: "2026-09-03", endDate: "2026-10-15", description: "Plan and build the new garden beds." },
  { id: "p3", title: "Q3 planning", type: "work", status: "completed", color: "#F59E0B", icon: "flag", description: "Quarterly planning and handoff." },
];
const seedMilestones: LocalMilestone[] = [{ id: "m1", projectId: "p1", title: "Direction approved", dueDate: "2026-09-05", completed: true }, { id: "m2", projectId: "p1", title: "First concept shared", dueDate: "2026-09-12", completed: false }];
function parse<T>(raw: string | null, fallback: T): T { if (!raw) return fallback; try { const value = JSON.parse(raw); return value as T; } catch { return fallback; } }
type Store = { projects: LocalProject[]; milestones: LocalMilestone[]; hydrated: boolean; addProject: (input: Omit<LocalProject, "id">) => Promise<void>; updateProject: (id: string, input: Partial<Omit<LocalProject, "id">>) => Promise<void>; deleteProject: (id: string) => Promise<void>; addMilestone: (input: Omit<LocalMilestone, "id">) => Promise<void>; updateMilestone: (id: string, input: Partial<Omit<LocalMilestone, "id">>) => Promise<void>; deleteMilestone: (id: string) => Promise<void> };
const Context = createContext<Store | null>(null);
export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(seedProjects); const [milestones, setMilestones] = useState(seedMilestones); const [hydrated, setHydrated] = useState(false);
  useEffect(() => { Promise.all([AsyncStorage.getItem(PROJECTS_KEY), AsyncStorage.getItem(MILESTONES_KEY)]).then(([p, m]) => { setProjects(parse(p, seedProjects)); setMilestones(parse(m, seedMilestones)); }).catch(() => undefined).finally(() => setHydrated(true)); }, []);
  const persist = async (nextProjects: LocalProject[], nextMilestones = milestones) => { setProjects(nextProjects); setMilestones(nextMilestones); await Promise.all([AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(nextProjects)), AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(nextMilestones))]); };
  const value = useMemo<Store>(() => ({ projects, milestones, hydrated, addProject: async (input) => persist([{ ...input, id: `p-${Date.now()}` }, ...projects]), updateProject: async (id, input) => persist(projects.map((p) => p.id === id ? { ...p, ...input } : p)), deleteProject: async (id) => persist(projects.filter((p) => p.id !== id), milestones.filter((m) => m.projectId !== id)), addMilestone: async (input) => persist(projects, [{ ...input, id: `m-${Date.now()}` }, ...milestones]), updateMilestone: async (id, input) => persist(projects, milestones.map((m) => m.id === id ? { ...m, ...input } : m)), deleteMilestone: async (id) => persist(projects, milestones.filter((m) => m.id !== id)) }), [hydrated, milestones, projects]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProjects() { const value = useContext(Context); if (!value) throw new Error("useProjects must be used inside ProjectStoreProvider"); return value; }
