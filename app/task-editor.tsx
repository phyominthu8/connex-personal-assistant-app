import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLocalTasks } from "@/lib/local-store";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function TaskEditorScreen() {
  const colors = useColors();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [date, setDate] = useState("Today");
  const params = useLocalSearchParams<{ project?: string }>();
  const { addTask } = useLocalTasks();
  const { user } = useAuth();
  const createTaskMutation = trpc.tasks.create.useMutation();
  const save = async () => {
    if (!title.trim()) {
      Alert.alert("Add a title", "Give your task a short, clear name first.");
      return;
    }
    if (user) {
      await createTaskMutation.mutateAsync({ title: title.trim(), project: params.project || "Personal", priority: priority as "Low" | "Medium" | "High", dueLabel: date, description: notes.trim() || undefined });
    } else {
      await addTask({ title: title.trim(), project: params.project || "Personal", priority: priority as "Low" | "Medium" | "High", due: date });
    }
    Alert.alert("Task saved", "Your task was added to today’s plan.", [{ text: "Done", onPress: () => router.back() }]);
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" containerClassName="bg-background"><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Pressable onPress={() => router.back()} accessibilityLabel="Close task editor" style={styles.close}><Ionicons name="close" size={22} color={colors.foreground} /></Pressable><Text style={[styles.headerTitle, { color: colors.foreground }]}>New task</Text><Pressable onPress={save}><Text style={[styles.save, { color: colors.primary }]}>Save</Text></Pressable></View><Text style={[styles.label, { color: colors.muted }]}>WHAT NEEDS TO GET DONE?</Text><TextInput autoFocus value={title} onChangeText={setTitle} placeholder="Task title" placeholderTextColor={colors.muted} style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]} returnKeyType="next" /><TextInput value={notes} onChangeText={setNotes} placeholder="Add notes (optional)" placeholderTextColor={colors.muted} multiline style={[styles.notesInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /><Text style={[styles.label, { color: colors.muted }]}>PLAN IT</Text><View style={styles.choiceRow}>{["Today", "Tomorrow", "Next week"].map((item) => <Pressable key={item} onPress={() => setDate(item)} style={[styles.choice, { borderColor: colors.border }, date === item && { backgroundColor: colors.primary, borderColor: colors.primary }]}><Ionicons name="calendar-outline" size={16} color={date === item ? "#FFFFFF" : colors.muted} /><Text style={[styles.choiceText, { color: date === item ? "#FFFFFF" : colors.foreground }]}>{item}</Text></Pressable>)}</View><Text style={[styles.label, { color: colors.muted }]}>PRIORITY</Text><View style={styles.choiceRow}>{["Low", "Medium", "High"].map((item) => <Pressable key={item} onPress={() => setPriority(item)} style={[styles.priority, { borderColor: colors.border }, priority === item && { backgroundColor: item === "High" ? colors.error : colors.primary, borderColor: item === "High" ? colors.error : colors.primary }]}><Text style={[styles.choiceText, { color: priority === item ? "#FFFFFF" : colors.foreground }]}>{item}</Text></Pressable>)}</View><View style={[styles.tip, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="bulb-outline" size={19} color={colors.warning} /><Text style={[styles.tipText, { color: colors.muted }]}>Keep tasks small and specific. You can always add more detail later.</Text></View><Pressable onPress={save} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.primaryText}>Create task</Text></Pressable></ScrollView></KeyboardAvoidingView></ScreenContainer>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { paddingTop: 8, paddingBottom: 28 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }, close: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(127,137,164,0.12)" }, headerTitle: { fontSize: 17, fontWeight: "800" }, save: { fontSize: 15, fontWeight: "800" }, label: { fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 10 }, titleInput: { fontSize: 25, fontWeight: "700", paddingVertical: 10, borderBottomWidth: 1, marginBottom: 18 }, notesInput: { minHeight: 100, borderRadius: 17, borderWidth: 1, padding: 14, fontSize: 14, textAlignVertical: "top", marginBottom: 28 }, choiceRow: { flexDirection: "row", gap: 8, marginBottom: 28 }, choice: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11 }, choiceText: { fontSize: 12, fontWeight: "700" }, priority: { minWidth: 76, alignItems: "center", borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 11 }, tip: { flexDirection: "row", gap: 10, borderWidth: 1, borderRadius: 16, padding: 14, alignItems: "center", marginBottom: 28 }, tipText: { flex: 1, fontSize: 12, lineHeight: 18 }, primaryButton: { height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" }, primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] } });
