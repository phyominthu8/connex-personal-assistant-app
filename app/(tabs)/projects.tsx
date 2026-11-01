import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { usePreferences } from "@/lib/preferences";
import { formatGreeting } from "@/lib/greeting";
import { useProjects, type LocalMilestone } from "@/lib/project-store";
import { useLocalTasks } from "@/lib/local-store";
import { ProjectTimeline } from "@/components/project-timeline";
import { getProjectHealth, PROJECT_HEALTH_LABELS } from "@/lib/project-health";
import { getProjectDateError } from "@/lib/project-date";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { DatePicker } from "@/components/task-pickers";
import { formatDateReadable, quickDateKey, toDateKey } from "@/lib/task-date";
import { ColorPalette } from "@/components/color-palette";
import { isOverdueDate } from "@/lib/task-milestones";

const types = ["all", "personal", "work", "team", "other"] as const;
const statuses = ["all", "active", "completed", "on_hold", "archived"] as const;
type ProjectListItem = { id: string; title: string; description?: string | null; startDate?: string; endDate?: string; type: "personal" | "work" | "team" | "other"; status: "active" | "completed" | "on_hold" | "archived"; color: string; icon: string };

function matchesProjectDateFilter(project: ProjectListItem, filter: string | undefined, now = new Date()) {
  if (!filter || filter === "All" || filter === "Completed") return true;
  const today = toDateKey(now);
  if (filter === "Overdue") return Boolean(project.endDate && project.endDate < today && project.status !== "completed");
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const weekEnd = toDateKey(endOfWeek);
  if (filter === "Today") return Boolean(project.startDate && project.endDate && project.startDate <= today && project.endDate >= today);
  if (filter === "This Week") return Boolean(project.startDate && project.startDate <= weekEnd && (!project.endDate || project.endDate >= today));
  return true;
}

function ProjectTimelinePreview({ project, authenticated, localMilestones }: { project: ProjectListItem; authenticated: boolean; localMilestones: LocalMilestone[] }) {
  const serverProject = authenticated && /^\d+$/.test(project.id);
  const milestonesQuery = trpc.projects.milestones.useQuery({ projectId: serverProject ? Number(project.id) : 1 }, { enabled: serverProject, retry: false });
  const milestones: LocalMilestone[] = serverProject
    ? (milestonesQuery.data || []).map((milestone) => ({ id: String(milestone.id), projectId: String(milestone.projectId), title: milestone.title, color: milestone.color || "#D97706", dueDate: milestone.dueDate || "", reminderAt: milestone.reminderAt ? new Date(milestone.reminderAt).toISOString() : undefined, completed: milestone.completed }))
    : localMilestones.filter((milestone) => milestone.projectId === project.id);
  return <ProjectTimeline milestones={milestones} startDate={project.startDate} endDate={project.endDate} color={project.color} compact />;
}

export default function ProjectsScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ create?: string; title?: string; query?: string; milestoneQuery?: string; filter?: string; milestoneTitle?: string }>();
  const { preferences } = usePreferences();
  const { projects, milestones, addProject, deleteProject } = useProjects();
  const { tasks, deleteProjectTasks } = useLocalTasks();
  const { user } = useAuth();
  const authenticated = Boolean(user);
  const serverProjectsQuery = trpc.projects.list.useQuery(undefined, { enabled: authenticated, retry: false });
  const createProjectMutation = trpc.projects.create.useMutation({ onSuccess: () => void serverProjectsQuery.refetch() });
  const deleteProjectMutation = trpc.projects.delete.useMutation({ onSuccess: () => void serverProjectsQuery.refetch() });
  const projectSource: ProjectListItem[] = authenticated && serverProjectsQuery.data
    ? serverProjectsQuery.data.map((project) => ({ ...project, id: String(project.id), startDate: project.startDate || undefined, endDate: project.endDate || undefined, description: project.description || undefined, status: project.status as ProjectListItem["status"], type: project.type as ProjectListItem["type"] }))
    : projects;
  const [query, setQuery] = useState(typeof params.query === "string" ? params.query : "");
  const [type, setType] = useState<(typeof types)[number]>("all");
  const [viewMode, setViewMode] = useState<"cards" | "timeline">("timeline");
  const [status, setStatus] = useState<(typeof statuses)[number]>(params.filter === "Completed" ? "completed" : "all");
  const [sortNewest, setSortNewest] = useState(true);
  const [createVisible, setCreateVisible] = useState(params.create === "1");
  const [title, setTitle] = useState(typeof params.title === "string" ? params.title : "");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [newType, setNewType] = useState<"personal" | "work" | "team" | "other">("personal");
  const [newColor, setNewColor] = useState("#4F46E5");
  const [milestoneQuery] = useState(typeof params.milestoneQuery === "string" ? params.milestoneQuery : "");
  const milestoneRouted = useRef(false);

  const visibleProjects = useMemo(() => projectSource
    .filter((project) => (!query.trim() || project.title.toLowerCase().includes(query.toLowerCase())) && (type === "all" || project.type === type) && (status === "all" || project.status === status) && matchesProjectDateFilter(project, params.filter))
    .sort((a, b) => sortNewest ? b.id.localeCompare(a.id) : a.title.localeCompare(b.title)), [projectSource, query, sortNewest, status, type]);
  const milestoneResults = milestones.filter((milestone) => {
    const matchesText = !milestoneQuery.trim() || milestone.title.toLowerCase().includes(milestoneQuery.toLowerCase()) || projectSource.find((project) => project.id === milestone.projectId)?.title.toLowerCase().includes(milestoneQuery.toLowerCase());
    const matchesFilter = params.filter === "Completed" ? milestone.completed : params.filter === "Overdue" ? !milestone.completed && isOverdueDate(milestone.dueDate, quickDateKey("Today")) : true;
    return matchesText && matchesFilter;
  });

  useEffect(() => {
    if (milestoneRouted.current || !params.milestoneTitle || !params.query) return;
    const target = projectSource.find((project) => project.title.toLowerCase() === params.query?.toLowerCase());
    if (!target) return;
    milestoneRouted.current = true;
    router.push({ pathname: "/project-detail", params: { projectId: target.id, newMilestone: "1", milestoneTitle: params.milestoneTitle } });
  }, [params.milestoneTitle, params.query, projectSource]);

  const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setStartDateOpen(false);
    setEndDateOpen(false);
    setNewType("personal");
    setNewColor("#4F46E5");
  };

  const saveProject = async () => {
    if (!title.trim()) return Alert.alert("Project title required", "Add a name before saving.");
    const dateError = getProjectDateError(startDate, endDate);
    if (dateError) return Alert.alert("Invalid project dates", dateError);
    const input = { title: title.trim(), description: description.trim(), startDate: startDate.trim() || undefined, endDate: endDate.trim() || undefined, type: newType, status: "active" as const, color: newColor, icon: newType === "personal" ? "leaf" : "folder" };
    if (authenticated) await createProjectMutation.mutateAsync(input);
    else await addProject(input);
    resetCreateForm();
    setCreateVisible(false);
  };

  return <ScreenContainer className="px-5" containerClassName="bg-background">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.muted }]}>MAKE PROGRESS VISIBLE</Text><Text style={[styles.title, { color: colors.foreground }]}>{formatGreeting(preferences.name)}</Text></View><Pressable onPress={() => setCreateVisible(true)} accessibilityLabel="Create project" style={[styles.addButton, { backgroundColor: colors.primary }]}><Ionicons name="add" size={22} color="#FFFFFF" /></Pressable></View>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search projects" placeholderTextColor={colors.muted} style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{[...types, ...statuses].map((value) => { const active = value === type || value === status; return <Pressable key={value} onPress={() => value === "all" ? (type === "all" ? setStatus("all") : setType("all")) : (types.includes(value as typeof types[number]) ? setType(value as typeof types[number]) : setStatus(value as typeof statuses[number]))} style={[styles.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.surface }]}><Text style={{ color: active ? "#FFFFFF" : colors.foreground, fontSize: 12, fontWeight: "700" }}>{value === "on_hold" ? "On Hold" : value[0].toUpperCase() + value.slice(1)}</Text></Pressable>; })}<Pressable onPress={() => setSortNewest((value) => !value)} style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>{sortNewest ? "Newest" : "A–Z"}</Text></Pressable></ScrollView>
      {(milestoneQuery || params.milestoneTitle) && <View style={[styles.milestoneSearchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Milestones</Text>{milestoneResults.length ? milestoneResults.map((milestone) => <Pressable key={milestone.id} onPress={() => router.push({ pathname: "/project-detail", params: { projectId: milestone.projectId } })} style={styles.milestoneResult}><Ionicons name={milestone.completed ? "checkmark-circle" : "flag-outline"} size={18} color={milestone.completed ? colors.success : colors.warning} /><View><Text style={[styles.projectTitle, { color: colors.foreground }]}>{milestone.title}</Text><Text style={[styles.projectMeta, { color: colors.muted }]}>{projectSource.find((project) => project.id === milestone.projectId)?.title || "Project"}{milestone.dueDate ? ` · Due ${formatDateReadable(milestone.dueDate)}` : ""}</Text></View></Pressable>) : <Text style={[styles.empty, { color: colors.muted }]}>No matching milestones found.</Text>}</View>}
      <View style={styles.sectionHeader}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Projects</Text><Text style={[styles.count, { color: colors.muted }]}>{visibleProjects.length} shown</Text></View><View style={[styles.viewToggle, { borderColor: colors.border, backgroundColor: colors.surface }]}><Pressable onPress={() => setViewMode("cards")} style={[styles.viewButton, viewMode === "cards" && { backgroundColor: colors.primary }]}><Ionicons name="grid-outline" size={15} color={viewMode === "cards" ? "#FFFFFF" : colors.muted} /><Text style={[styles.viewButtonText, { color: viewMode === "cards" ? "#FFFFFF" : colors.muted }]}>Cards</Text></Pressable><Pressable onPress={() => setViewMode("timeline")} style={[styles.viewButton, viewMode === "timeline" && { backgroundColor: colors.primary }]}><Ionicons name="git-branch-outline" size={15} color={viewMode === "timeline" ? "#FFFFFF" : colors.muted} /><Text style={[styles.viewButtonText, { color: viewMode === "timeline" ? "#FFFFFF" : colors.muted }]}>Timeline</Text></Pressable></View></View>
      <View style={styles.list}>{visibleProjects.map((project) => {
        const linked = tasks.filter((task) => task.project === project.title);
        const completed = linked.filter((task) => task.complete).length;
        const progress = linked.length ? completed / linked.length : project.status === "completed" ? 1 : 0;
        const health = getProjectHealth(project.status, progress, project.endDate);
        const healthColor = health === "complete" ? colors.success : health === "at-risk" ? colors.error : health === "on-hold" ? colors.warning : colors.primary;
        return <View key={project.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable onPress={() => router.push({ pathname: "/project-detail", params: { projectId: project.id } })}>
            <View style={styles.cardTop}><View style={[styles.projectIcon, { backgroundColor: project.color }]}><Ionicons name={(project.icon as keyof typeof Ionicons.glyphMap) || "folder"} size={19} color="#FFFFFF" /></View><View style={styles.cardCopy}><Text style={[styles.projectTitle, { color: colors.foreground }]}>{project.title}</Text><Text style={[styles.projectMeta, { color: colors.muted }]}>{project.type} · {project.status === "on_hold" ? "On hold" : project.status}</Text>{(project.startDate || project.endDate) && <Text style={[styles.projectDates, { color: colors.muted }]}>{project.startDate || "No start"} → {project.endDate || "No due date"}</Text>}<View style={[styles.healthPill, { backgroundColor: `${healthColor}18` }]}><View style={[styles.healthDot, { backgroundColor: healthColor }]} /><Text style={[styles.healthText, { color: healthColor }]}>{PROJECT_HEALTH_LABELS[health]}</Text></View></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></View>
            <View style={styles.progressRow}><View style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressFill, { backgroundColor: project.color, width: `${Math.round(progress * 100)}%` }]} /></View><Text style={[styles.progressText, { color: colors.foreground }]}>{Math.round(progress * 100)}%</Text></View>{viewMode === "cards" && <Text style={[styles.taskText, { color: colors.muted }]}>{completed} of {linked.length} linked tasks</Text>}
            {viewMode === "timeline" && <ProjectTimelinePreview project={project} authenticated={authenticated} localMilestones={milestones} />}
          </Pressable>
          <View style={styles.cardActions}><Pressable onPress={() => router.push({ pathname: "/project-detail", params: { projectId: project.id, newMilestone: "1" } })} accessibilityLabel={`Add milestone to ${project.title}`}><Ionicons name="flag-outline" size={15} color={colors.warning} /><Text style={[styles.actionText, { color: colors.warning }]}>Add milestone</Text></Pressable><Pressable onPress={() => router.push({ pathname: "/project-detail", params: { projectId: project.id, edit: "1" } })}><Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text></Pressable><Pressable onPress={() => Alert.alert("Delete project?", `Remove ${project.title}, its tasks, milestones, and reminders?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { if (authenticated && /^\d+$/.test(project.id)) await deleteProjectMutation.mutateAsync({ id: Number(project.id) }); else { await deleteProjectTasks(project.id, project.title); await deleteProject(project.id); } } }])}><Text style={[styles.actionText, { color: colors.error }]}>Delete</Text></Pressable></View>
        </View>;
      })}</View>
    </ScrollView>
    <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}><View style={styles.modalBackdrop}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}><View style={[styles.modal, { backgroundColor: colors.background }]}><Text style={[styles.modalTitle, { color: colors.foreground }]}>New project</Text><TextInput value={title} onChangeText={setTitle} placeholder="Project title" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} /><TextInput value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={colors.muted} multiline style={[styles.input, styles.notes, { color: colors.foreground, borderColor: colors.border }]} /><Text style={[styles.modalLabel, { color: colors.muted }]}>START DATE</Text><Pressable onPress={() => setStartDateOpen(true)} style={[styles.dateChoice, { borderColor: colors.border, backgroundColor: colors.surface }]}><Ionicons name="play-outline" size={17} color={colors.primary} /><Text style={[styles.dateChoiceText, { color: startDate ? colors.foreground : colors.muted }]}>{startDate ? formatDateReadable(startDate) : "Select start date"}</Text></Pressable><Text style={[styles.modalLabel, { color: colors.muted }]}>DUE DATE</Text><Pressable onPress={() => setEndDateOpen(true)} style={[styles.dateChoice, { borderColor: colors.border, backgroundColor: colors.surface }]}><Ionicons name="calendar-outline" size={17} color={colors.primary} /><Text style={[styles.dateChoiceText, { color: endDate ? colors.foreground : colors.muted }]}>{endDate ? formatDateReadable(endDate) : "Select due date"}</Text></Pressable><Text style={[styles.dateHint, { color: colors.muted }]}>Dates are optional, but adding them enables the project timeline range and deadline tracking.</Text><ColorPalette value={newColor} onChange={setNewColor} /><View style={styles.typeRow}>{(["personal", "work", "team", "other"] as const).map((item) => <Pressable key={item} onPress={() => setNewType(item)} style={[styles.typeButton, { borderColor: newType === item ? colors.primary : colors.border, backgroundColor: newType === item ? colors.primary : colors.surface }]}><Text style={{ color: newType === item ? "#FFFFFF" : colors.foreground, fontSize: 12, fontWeight: "700" }}>{item}</Text></Pressable>)}</View><Pressable onPress={() => void saveProject()} style={[styles.save, { backgroundColor: colors.primary }]}><Text style={styles.saveText}>Create project</Text></Pressable><Pressable onPress={() => { resetCreateForm(); setCreateVisible(false); }}><Text style={[styles.cancel, { color: colors.muted }]}>Cancel</Text></Pressable></View></ScrollView></View></Modal><DatePicker value={startDate || quickDateKey("Today")} onChange={setStartDate} visible={startDateOpen} onClose={() => setStartDateOpen(false)} /><DatePicker value={endDate || startDate || quickDateKey("Today")} onChange={setEndDate} visible={endDateOpen} onClose={() => setEndDateOpen(false)} minDate={startDate || undefined} />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 30 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 6 }, title: { fontSize: 30, fontWeight: "800" }, addButton: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" }, search: { minHeight: 46, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, marginBottom: 10 }, chips: { gap: 8, paddingBottom: 18 }, chip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, viewToggle: { flexDirection: "row", borderWidth: 1, borderRadius: 11, padding: 3, gap: 3 }, viewButton: { minHeight: 28, borderRadius: 8, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }, viewButtonText: { fontSize: 10, fontWeight: "800" }, sectionTitle: { fontSize: 18, fontWeight: "800" }, count: { fontSize: 12 }, list: { gap: 12 }, card: { borderWidth: 1, borderRadius: 20, padding: 16 }, cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 }, projectIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 }, cardCopy: { flex: 1 }, projectTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 }, projectMeta: { fontSize: 12, textTransform: "capitalize", marginBottom: 4 }, projectDates: { fontSize: 11, marginBottom: 7 }, healthPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 }, healthDot: { width: 6, height: 6, borderRadius: 3 }, healthText: { fontSize: 10, fontWeight: "800" }, progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }, progressTrack: { height: 7, borderRadius: 4, flex: 1, overflow: "hidden" }, progressFill: { height: "100%", borderRadius: 4 }, progressText: { fontSize: 12, fontWeight: "800", width: 34, textAlign: "right" }, taskText: { fontSize: 12 }, cardActions: { flexDirection: "row", justifyContent: "flex-end", gap: 18, marginTop: 14 }, actionText: { fontSize: 12, fontWeight: "800" }, modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.35)" }, modalScroll: { width: "100%", alignItems: "center", justifyContent: "flex-end", paddingTop: 70 }, modal: { width: "100%", maxWidth: 640, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 32 }, modalTitle: { fontSize: 22, fontWeight: "800", marginBottom: 16 }, modalLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 5, marginBottom: 6 }, input: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, marginBottom: 10, fontSize: 14 }, notes: { minHeight: 82, textAlignVertical: "top", paddingTop: 12 }, dateHint: { fontSize: 11, lineHeight: 16, marginBottom: 14 }, typeRow: { flexDirection: "row", gap: 7, marginBottom: 18 }, typeButton: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 9, alignItems: "center" }, save: { minHeight: 50, borderRadius: 15, alignItems: "center", justifyContent: "center" }, saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, dateChoice: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, marginBottom: 10 }, dateChoiceText: { fontSize: 14, fontWeight: "700" }, milestoneSearchCard: { borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 16, gap: 12 }, milestoneResult: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 }, empty: { textAlign: "center", paddingVertical: 12, fontSize: 13 }, cancel: { textAlign: "center", marginTop: 16, fontSize: 14, fontWeight: "700" }
});
