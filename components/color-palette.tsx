import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { CONNEX_COLOR_VALUES } from "@/lib/entity-colors";

export const CONNEX_COLORS = CONNEX_COLOR_VALUES.map((value, index) => ({ name: ["Ocean", "Indigo", "Violet", "Rose", "Orange", "Amber", "Green", "Teal", "Slate"][index], value }));

export function ColorPalette({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const colors = useColors();
  return <View accessibilityLabel="Choose color">
    <Text style={[styles.label, { color: colors.muted }]}>COLOR</Text>
    <View style={styles.row}>{CONNEX_COLORS.map((item) => <Pressable key={item.value} onPress={() => onChange(item.value)} accessibilityLabel={`${item.name} color`} accessibilityRole="button" style={[styles.swatch, { backgroundColor: item.value }, value === item.value && { borderColor: colors.foreground, borderWidth: 3 }]}><View style={styles.inner}>{value === item.value && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}</View></Pressable>)}</View>
  </View>;
}

export function colorWithAlpha(hex: string, alpha: string) { return `${hex}${alpha}`; }

const styles = StyleSheet.create({ label: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 5, marginBottom: 8 }, row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }, swatch: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderColor: "transparent" }, inner: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" } });
