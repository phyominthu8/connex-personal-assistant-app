import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLocalTasks } from "@/lib/local-store";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { matchesTaskDateFilter, type TaskDateFilter } from "@/lib/task-date";

const initialTasks = [
  { id: "1", title: "Prepare weekly priorities", due: "Today · 9:00 AM", priority: "High", project: "Personal", complete: false },
  { id: "2", title: "Review project milestones", due: "Today · 11:30 AM", priority: "Medium", project: "Website refresh", complete: true },
  { id: "3", title: "Call with design team", due: "Today · 3:00 PM", priority: "Medium", project: "Website refresh", complete: false },
  { id: "4", title: "Plan next week’s meals", due: "Tomorrow", priority: "Low", project: "Personal", complete: false },
];

export default function TasksScreen() {
  const colors = useColors();
  const { tasks: localTasks, toggleTask } = useLocalTasks();
  const { user } = useAuth();
  const serverTasksQuery = trpc.tasks.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const updateTaskMutation = trpc.tasks.update.useMutation({ onSuccess: () => serverTasksQuery.refetch() });
  const tasks = user && serverTasksQuery.data ? serverTasksQuery.data.map((task) => ({ id: String(task.id), title: task.title, due: task.dueLabel, dueDate: task.dueDate || "", priority: task.priority, project: task.project, complete: task.completed })) : localTasks;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TaskDateFilter>("All");
  const filters: TaskDateFilter[] = ["All", "Today", "Tomorrow", "This Week", "Overdue", "Completed"];
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.project}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = matchesTaskDateFilter({ dueDate: task.dueDate, completed: task.complete }, filter);
    return matchesQuery && matchesFilter;
  }), [filter, query, tasks]);

  const toggle = (id: string) => { if (user) void updateTaskMutation.mutateAsync({ id: Number(id), completed: !tasks.find((task) => task.id === id)?.complete }); else void toggleTask(id); };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.muted }]}>YOUR ORGANIZER</Text><Text style={[styles.title, { color: colors.foreground }]}>Tasks</Text></View><Pressable onPress={() => router.push("/task-editor")} style={styles.addButton}><Ionicons name="add" size={22} color="#FFFFFF" /></Pressable></View>
      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="search" size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search tasks" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} returnKeyType="search" /></View>
      <View style={styles.filterRow}>{filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.chip, { borderColor: colors.border }, filter === item && { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={[styles.chipText, { color: filter === item ? "#FFFFFF" : colors.muted }]}>{item}</Text></Pressable>)}<Pressable accessibilityLabel="Sort tasks" style={styles.sort}><Ionicons name="options-outline" size={19} color={colors.foreground} /></Pressable></View>
      <View style={styles.listHeader}><Text style={[styles.listTitle, { color: colors.foreground }]}>{filter} tasks</Text><Text style={[styles.listCount, { color: colors.muted }]}>{visibleTasks.length} shown</Text></View>
      <FlatList data={visibleTasks} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/task-detail", params: { title: item.title, project: item.project } })} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Pressable onPress={() => toggle(item.id)} accessibilityLabel={item.complete ? `Mark ${item.title} incomplete` : `Complete ${item.title}`} style={styles.check}>{item.complete ? <Ionicons name="checkmark-circle" size={27} color={colors.success} /> : <Ionicons name="ellipse-outline" size={27} color={colors.muted} />}</Pressable><View style={styles.copy}><Text style={[styles.taskTitle, { color: colors.foreground }, item.complete && styles.complete]}>{item.title}</Text><Text style={[styles.due, { color: colors.muted }]}>{item.due}</Text><View style={styles.meta}><Text style={[styles.project, { color: colors.primary }]}>{item.project}</Text><Text style={[styles.priority, { color: item.priority === "High" ? colors.error : colors.muted }]}>{item.priority}</Text></View></View><Pressable accessibilityLabel={`More actions for ${item.title}`}><Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} /></Pressable></Pressable>} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 14, marginBottom: 20 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: "800" },
  addButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center" },
  search: { height: 48, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 8, marginBottom: 14 },
  input: { flex: 1, fontSize: 14 },
  filterRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 24 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  chipText: { fontSize: 12, fontWeight: "700" },
  sort: { marginLeft: "auto", width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(127,137,164,0.12)" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  listTitle: { fontSize: 18, fontWeight: "800" },
  listCount: { fontSize: 12, fontWeight: "600" },
  list: { gap: 10, paddingBottom: 30 },
  card: { minHeight: 92, borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center" },
  check: { marginRight: 12 },
  copy: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "700", marginBottom: 5 },
  complete: { textDecorationLine: "line-through", opacity: 0.5 },
  due: { fontSize: 12, marginBottom: 8 },
  meta: { flexDirection: "row", gap: 8 },
  project: { fontSize: 11, fontWeight: "700" },
  priority: { fontSize: 11, fontWeight: "700" },
});
