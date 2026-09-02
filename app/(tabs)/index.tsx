import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { QuickSettingsMenu } from "@/components/quick-settings-menu";
import { useColors } from "@/hooks/use-colors";
import { useLocalTasks } from "@/lib/local-store";
import { toDateKey } from "@/lib/task-date";

const days = ["S", "M", "T", "W", "T", "F", "S"];
const calendarDays = Array.from({ length: 35 }, (_, index) => index + 1);

export default function CalendarScreen() {
  const colors = useColors();
  const { tasks: localTasks } = useLocalTasks();
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [monthOffset, setMonthOffset] = useState(0);
  const [quickSettingsVisible, setQuickSettingsVisible] = useState(false);
  const monthLabel = useMemo(() => (monthOffset === 0 ? "September 2026" : monthOffset > 0 ? "October 2026" : "August 2026"), [monthOffset]);
  const selectedDateKey = toDateKey(new Date(2026, 8 + monthOffset, selectedDay));
  const selectedTasks = localTasks.filter((task) => task.dueDate === selectedDateKey);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.muted }]}>MONDAY, SEPTEMBER 1</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Good morning</Text>
          </View>
          <View style={styles.headerActions}><Pressable onPress={() => router.push("/projects")} accessibilityLabel="Open projects" style={styles.iconButton}><Ionicons name="folder-outline" size={20} color={colors.foreground} /></Pressable><Pressable onPress={() => setQuickSettingsVisible(true)} accessibilityLabel="Open settings" style={styles.iconButton}>
            <Ionicons name="settings-outline" size={21} color={colors.foreground} />
          </Pressable></View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.summaryLabel}>YOUR DAY AT A GLANCE</Text>
            <Text style={styles.summaryTitle}>3 tasks planned</Text>
            <Text style={styles.summaryText}>One small step at a time.</Text>
          </View>
          <View style={styles.progressRing}><Text style={styles.progressText}>33%</Text></View>
        </View>

        <View style={styles.sectionHeader}>
          <Pressable onPress={() => setMonthOffset((value) => value - 1)} accessibilityLabel="Previous month"><Ionicons name="chevron-back" size={20} color={colors.foreground} /></Pressable>
          <Text style={[styles.month, { color: colors.foreground }]}>{monthLabel}</Text>
          <Pressable onPress={() => setMonthOffset((value) => value + 1)} accessibilityLabel="Next month"><Ionicons name="chevron-forward" size={20} color={colors.foreground} /></Pressable>
        </View>

        <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.weekRow}>{days.map((day, index) => <Text key={`${day}-${index}`} style={[styles.weekday, { color: colors.muted }]}>{day}</Text>)}</View>
          <View style={styles.grid}>{calendarDays.map((day) => {
            const dayKey = day > 0 ? toDateKey(new Date(2026, 8 + monthOffset, day)) : "";
            const hasTask = localTasks.some((task) => task.dueDate === dayKey);
            const selected = day === selectedDay;
            return <Pressable key={day} onPress={() => setSelectedDay(day)} style={[styles.dayCell, selected && { backgroundColor: colors.primary }]}><Text style={[styles.dayText, { color: selected ? "#FFFFFF" : colors.foreground }]}>{day}</Text>{hasTask && <View style={[styles.dot, { backgroundColor: selected ? "#FFFFFF" : colors.warning }]} />}</Pressable>;
          })}</View>
        </View>

        <View style={styles.sectionHeader}><View style={styles.dayTitleRow}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{monthLabel} · {selectedDay}</Text><Pressable onPress={() => setQuickSettingsVisible(true)} accessibilityLabel="Open day settings"><Ionicons name="settings-outline" size={19} color={colors.muted} /></Pressable></View><Text style={[styles.count, { color: colors.muted }]}>{selectedTasks.length} items</Text></View>
        <View style={styles.taskList}>{selectedTasks.length ? selectedTasks.map((task) => <View key={task.id} style={[styles.taskRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.taskMarker, { backgroundColor: task.priority === "High" ? colors.error : colors.primary }]} /><View style={styles.taskCopy}><Text style={[styles.taskTitle, { color: colors.foreground }, task.complete && styles.done]}>{task.title}</Text><Text style={[styles.taskTime, { color: colors.muted }]}>{task.due}</Text></View><Ionicons name={task.complete ? "checkmark-circle" : "ellipse-outline"} size={24} color={task.complete ? colors.success : colors.muted} /></View>) : <Text style={[styles.empty, { color: colors.muted }]}>No tasks planned for this date.</Text>}</View>

        <Pressable onPress={() => router.push("/task-editor")} style={({ pressed }) => [styles.captureButton, { backgroundColor: colors.warning }, pressed && styles.pressed]}><Ionicons name="add" size={22} color="#FFFFFF" /><Text style={styles.captureText}>Capture a task</Text></Pressable>
        <Pressable onPress={() => Alert.alert("Daily note", selectedTasks.length ? selectedTasks.map((task) => `• ${task.title}`).join("\\n") : "No tasks planned for this date yet.")} style={({ pressed }) => [styles.noteButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Ionicons name="document-text-outline" size={20} color={colors.primary} /><Text style={[styles.noteText, { color: colors.primary }]}>Generate Note</Text></Pressable>
      </ScrollView><QuickSettingsMenu visible={quickSettingsVisible} onClose={() => setQuickSettingsVisible(false)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 32 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.3, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.6 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(127, 137, 164, 0.12)" },
  summaryCard: { borderRadius: 24, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  summaryLabel: { color: "#C7CCFF", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 10 },
  summaryTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  summaryText: { color: "#E1E4FF", fontSize: 13 },
  progressRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 5, borderColor: "#A5AAFF", alignItems: "center", justifyContent: "center" },
  progressText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  headerActions: { flexDirection: "row", gap: 8 },
  dayTitleRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  month: { fontSize: 17, fontWeight: "800" },
  calendarCard: { borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 26 },
  weekRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  weekday: { width: 38, textAlign: "center", fontSize: 12, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.285%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 18, marginVertical: 1 },
  dayText: { fontSize: 13, fontWeight: "600" },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  count: { fontSize: 12, fontWeight: "600" },
  taskList: { gap: 10, marginBottom: 18 },
  taskRow: { minHeight: 70, borderRadius: 17, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  taskMarker: { width: 4, height: 38, borderRadius: 2, marginRight: 12 },
  taskCopy: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: "700", marginBottom: 5 },
  done: { textDecorationLine: "line-through", opacity: 0.55 },
  taskTime: { fontSize: 12 },
  captureButton: { height: 52, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  captureText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  noteButton: { height: 52, borderRadius: 18, borderWidth: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 },
  noteText: { fontSize: 15, fontWeight: "800" },
  empty: { textAlign: "center", paddingVertical: 22, fontSize: 13 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
