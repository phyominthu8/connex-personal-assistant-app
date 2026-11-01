import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from "expo-audio";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { parseVoiceIntent, type VoiceIntent } from "@/lib/voice-intent";
import { useLocalTasks } from "@/lib/local-store";
import { useProjects } from "@/lib/project-store";
import { isOverdueDate } from "@/lib/task-milestones";
import { matchesTaskDateFilter, quickDateKey, toDateKey, type TaskDateFilter } from "@/lib/task-date";
import { sortSearchResultsByDueDate, type VoiceSearchResult } from "@/lib/voice-search";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

type SearchResult = VoiceSearchResult & { kind: "task" | "project" | "milestone"; subtitle: string; projectId?: string; project?: string; milestoneId?: string };

function projectMatches(project: { status: string; startDate?: string; endDate?: string }, filter: string | undefined, today: string) {
  if (!filter || filter === "All") return true;
  if (filter === "Completed") return project.status === "completed";
  if (filter === "Active") return project.status === "active";
  if (filter === "On Hold") return project.status === "on_hold";
  if (filter === "Archived") return project.status === "archived";
  if (filter === "Overdue") return Boolean(project.endDate && project.endDate < today && project.status !== "completed");
  if (filter === "Today") return Boolean(project.startDate && project.endDate && project.startDate <= today && project.endDate >= today);
  if (filter === "Tomorrow") {
    const tomorrow = quickDateKey("Tomorrow");
    return Boolean(project.startDate && project.endDate && project.startDate <= tomorrow && project.endDate >= tomorrow);
  }
  if (filter === "This Week") {
    const end = new Date();
    end.setDate(end.getDate() + (7 - end.getDay()));
    const weekEnd = toDateKey(end);
    return Boolean(project.startDate && project.startDate <= weekEnd && (!project.endDate || project.endDate >= today));
  }
  return true;
}

export default function VoiceAssistantScreen() {
  const colors = useColors();
  const { tasks } = useLocalTasks();
  const { projects, milestones } = useProjects();
  const { user } = useAuth();
  const serverProjectsQuery = trpc.projects.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textCommand, setTextCommand] = useState("");
  const [intent, setIntent] = useState<VoiceIntent>({ kind: "task", text: "" });
  const [resultsVisible, setResultsVisible] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const today = toDateKey(new Date());
  const searchableProjects = useMemo(() => {
    const combined = [...projects, ...(serverProjectsQuery.data || []).map((project) => ({ id: String(project.id), title: project.title, description: project.description || undefined, startDate: project.startDate || undefined, endDate: project.endDate || undefined, type: project.type as typeof projects[number]["type"], status: project.status as typeof projects[number]["status"], color: project.color || "#4F46E5", icon: project.icon || "folder" }))];
    return Array.from(new Map(combined.map((project) => [project.title.trim().toLowerCase(), project])).values());
  }, [projects, serverProjectsQuery.data]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (intent.kind !== "search") return [];
    const query = intent.query.toLowerCase().trim();
    const matchesText = (value: string) => !query || value.toLowerCase().includes(query);
    if (intent.entity === "tasks") {
      return tasks.filter((task) => matchesText(`${task.title} ${task.project}`) && matchesTaskDateFilter({ dueDate: task.dueDate, completed: task.complete }, (intent.filter || "All") as TaskDateFilter)).map((task) => ({ kind: "task", id: task.id, title: task.title, dueDate: task.dueDate, subtitle: `${task.project} · ${task.due || task.dueDate}`, project: task.project, projectId: task.projectId, milestoneId: task.milestoneId }));
    }
    if (intent.entity === "projects") {
      return searchableProjects.filter((project) => matchesText(project.title) && projectMatches(project, intent.filter, today)).map((project) => ({ kind: "project", id: project.id, title: project.title, dueDate: project.endDate, subtitle: `${project.status.replace("_", " ")}${project.endDate ? ` · Due ${project.endDate}` : ""}`, projectId: project.id }));
    }
    return milestones.filter((milestone) => {
      const project = projects.find((item) => item.id === milestone.projectId);
      const statusMatch = intent.filter === "Completed" ? milestone.completed : intent.filter === "Active" ? !milestone.completed : intent.filter === "On Hold" || intent.filter === "Archived" ? false : true;
      const tomorrow = quickDateKey("Tomorrow");
      const end = new Date();
      end.setDate(end.getDate() + (7 - end.getDay()));
      const weekEnd = toDateKey(end);
      const dateMatch = intent.filter === "Today" ? milestone.dueDate === today : intent.filter === "Tomorrow" ? milestone.dueDate === tomorrow : intent.filter === "This Week" ? Boolean(milestone.dueDate && milestone.dueDate >= today && milestone.dueDate <= weekEnd) : intent.filter === "Overdue" ? !milestone.completed && isOverdueDate(milestone.dueDate, today) : true;
      return statusMatch && dateMatch && matchesText(`${milestone.title} ${project?.title || ""}`);
    }).map((milestone) => ({ kind: "milestone", id: milestone.id, title: milestone.title, dueDate: milestone.dueDate, subtitle: `${projects.find((project) => project.id === milestone.projectId)?.title || "Project"}${milestone.dueDate ? ` · Due ${milestone.dueDate}` : ""}`, projectId: milestone.projectId, milestoneId: milestone.id }));
  }, [intent, milestones, projects, searchableProjects, tasks, today]);
  const sortedResults = useMemo(() => sortSearchResultsByDueDate(searchResults, sortAscending), [searchResults, sortAscending]);

  const startListening = async () => {
    try {
      if (listening) {
        await recorder.stop();
        setListening(false);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        Alert.alert("Recording complete", recorder.uri ? "Your recording was captured. Speech-to-text is not connected yet; use Text fallback to run the command." : "No recording file was produced.");
        return;
      }
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone permission needed", "Connex needs microphone access to listen to voice commands. Enable Microphone in Android Settings, then try again.");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setListening(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (error) {
      setListening(false);
      Alert.alert("Could not start microphone", error instanceof Error ? error.message : "Please check Connex microphone permission and try again.");
    }
  };
  const openResult = (result: SearchResult) => {
    setResultsVisible(false);
    if (result.kind === "task") router.push({ pathname: "/task-detail", params: { id: result.id, title: result.title, project: result.project, projectId: result.projectId, milestoneId: result.milestoneId } });
    else router.push({ pathname: "/project-detail", params: { projectId: result.projectId, milestoneId: result.milestoneId } });
  };
  const confirm = () => {
    if (!transcript.trim()) return;
    if (intent.kind === "create-project") return Alert.alert("Confirm project", `Create project “${intent.title || "Untitled project"}”?`, [{ text: "Cancel", style: "cancel" }, { text: "Create project", onPress: () => router.push({ pathname: "/projects", params: { create: "1", title: intent.title } }) }]);
    if (intent.kind === "create-milestone") return Alert.alert("Confirm milestone", intent.projectName ? `Create milestone “${intent.title || "Untitled milestone"}” in ${intent.projectName}?` : `Create milestone “${intent.title || "Untitled milestone"}”? Choose a project next.`, [{ text: "Cancel", style: "cancel" }, { text: "Choose project", onPress: () => router.push({ pathname: "/projects", params: intent.projectName ? { query: intent.projectName, milestoneTitle: intent.title } : { milestoneTitle: intent.title } }) }]);
    if (intent.kind === "search") return setResultsVisible(true);
    const taskTitle = intent.kind === "create-task" ? intent.title : transcript;
    Alert.alert("Confirm task", `Create a task from “${taskTitle}”?`, [{ text: "Cancel", style: "cancel" }, { text: "Create task", onPress: () => router.push({ pathname: "/task-editor", params: { project: "Personal", title: taskTitle } }) }]);
  };
  const applyTextCommand = () => { const next = parseVoiceIntent(textCommand); setIntent(next); setTranscript(textCommand.trim()); setSortAscending(true); setResultsVisible(false); };
  const confirmationLabel = intent.kind === "create-project" ? "Confirm project" : intent.kind === "create-milestone" ? "Confirm milestone" : intent.kind === "search" ? "Show results" : "Confirm task";
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.icon}><Ionicons name="chevron-back" size={21} color={colors.foreground} /></Pressable><Text style={[styles.headerTitle, { color: colors.foreground }]}>Voice Assistant</Text><View style={styles.icon} /></View><Text style={[styles.eyebrow, { color: colors.muted }]}>QUICK CAPTURE</Text><Text style={[styles.title, { color: colors.foreground }]}>Tell Connex what matters.</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Create tasks, projects, and milestones, or search your plan. Search results stay here so you can choose exactly what to open.</Text><View style={[styles.orb, { backgroundColor: listening ? colors.primary : colors.surface, borderColor: colors.primary }]}><Ionicons name={listening ? "mic" : "mic-outline"} size={40} color={listening ? "#FFFFFF" : colors.primary} /></View><Text style={[styles.status, { color: colors.foreground }]}>{listening ? "Listening…" : "Tap to speak"}</Text><Pressable onPress={startListening} style={[styles.listenButton, { backgroundColor: colors.primary }]}><Ionicons name={listening ? "stop" : "mic"} size={20} color="#FFFFFF" /><Text style={styles.listenText}>{listening ? "Stop listening" : "Start listening"}</Text></Pressable><View style={[styles.transcriptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.label, { color: colors.muted }]}>TRANSCRIPT</Text><Text style={[styles.transcript, { color: transcript ? colors.foreground : colors.muted }]}>{transcript || "Your words will appear here for confirmation."}</Text>{transcript ? <Pressable onPress={confirm}><Text style={[styles.confirm, { color: colors.primary }]}>{confirmationLabel}</Text></Pressable> : null}</View><Text style={[styles.label, { color: colors.muted }]}>TEXT FALLBACK</Text><View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput value={textCommand} onChangeText={setTextCommand} placeholder="e.g. Find overdue tasks" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} /><Pressable onPress={applyTextCommand} accessibilityLabel="Use text command"><Ionicons name="arrow-up-circle" size={28} color={colors.primary} /></Pressable></View><Text style={[styles.feedback, { color: colors.muted }]}>Examples: “Find overdue tasks”, “Find active projects”, or “Find completed milestones.”</Text></ScrollView><Modal visible={resultsVisible} transparent animationType="slide" onRequestClose={() => setResultsVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.resultsModal, { backgroundColor: colors.background }]}><View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.foreground }]}>Search results</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>{intent.kind === "search" ? `${intent.entity} · ${intent.filter || "All"}` : ""}</Text></View><View style={styles.modalActions}><Pressable onPress={() => setSortAscending((value) => !value)} accessibilityLabel="Sort results by due date"><Ionicons name="swap-vertical" size={18} color={colors.primary} /><Text style={[styles.sortText, { color: colors.primary }]}>{sortAscending ? "Due soonest" : "Due latest"}</Text></Pressable><Pressable onPress={() => setResultsVisible(false)} accessibilityLabel="Close search results"><Ionicons name="close" size={24} color={colors.foreground} /></Pressable></View></View>{sortedResults.length ? <ScrollView contentContainerStyle={styles.resultList}>{sortedResults.map((result) => <Pressable key={`${result.kind}-${result.id}`} onPress={() => openResult(result)} style={[styles.resultRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.resultIcon, { backgroundColor: colors.primary }]}><Ionicons name={result.kind === "task" ? "checkmark-circle-outline" : result.kind === "milestone" ? "flag-outline" : "folder-outline"} size={19} color="#FFFFFF" /></View><View style={styles.resultCopy}><Text style={[styles.resultTitle, { color: colors.foreground }]}>{result.title}</Text><Text style={[styles.resultSubtitle, { color: colors.muted }]}>{result.subtitle}</Text></View><Ionicons name="chevron-forward" size={19} color={colors.muted} /></Pressable>)}</ScrollView> : <View style={styles.noResults}><Ionicons name="search-outline" size={34} color={colors.muted} /><Text style={[styles.noResultsTitle, { color: colors.foreground }]}>No results found</Text><Text style={[styles.noResultsText, { color: colors.muted }]}>Try a different name, project, date, or status.</Text></View>}</View></View></Modal></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingTop: 8, paddingBottom: 40 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }, icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(127,137,164,0.12)", alignItems: "center", justifyContent: "center" }, headerTitle: { fontSize: 17, fontWeight: "800" }, eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 9 }, title: { fontSize: 29, fontWeight: "800", lineHeight: 35, marginBottom: 10 }, subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 34 }, orb: { width: 112, height: 112, borderRadius: 56, borderWidth: 2, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 15 }, status: { fontSize: 15, fontWeight: "800", textAlign: "center", marginBottom: 18 }, listenButton: { minHeight: 52, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 28 }, listenText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, transcriptCard: { borderWidth: 1, borderRadius: 18, padding: 16, minHeight: 120, marginBottom: 22 }, label: { fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 10 }, transcript: { fontSize: 14, lineHeight: 21 }, confirm: { fontSize: 13, fontWeight: "800", marginTop: 14 }, inputWrap: { borderWidth: 1, borderRadius: 16, minHeight: 54, flexDirection: "row", alignItems: "center", paddingHorizontal: 14 }, input: { flex: 1, fontSize: 13 }, feedback: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 18 }, modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.38)" }, resultsModal: { maxHeight: "78%", minHeight: 300, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20 }, modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, modalActions: { flexDirection: "row", alignItems: "center", gap: 12 }, modalTitle: { fontSize: 22, fontWeight: "800" }, modalSubtitle: { fontSize: 12, textTransform: "capitalize", marginTop: 3 }, sortText: { fontSize: 10, fontWeight: "800", marginLeft: 3 }, resultList: { gap: 10, paddingBottom: 24 }, resultRow: { minHeight: 72, borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: "row", alignItems: "center", gap: 11 }, resultIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" }, resultCopy: { flex: 1 }, resultTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 }, resultSubtitle: { fontSize: 12, textTransform: "capitalize" }, noResults: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 45 }, noResultsTitle: { fontSize: 17, fontWeight: "800", marginTop: 12 }, noResultsText: { fontSize: 13, textAlign: "center", marginTop: 6 } });
