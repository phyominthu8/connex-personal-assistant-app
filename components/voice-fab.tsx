import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";

export function VoiceFab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.container, { right: 18, bottom: Math.max(insets.bottom, 14) + 68 }]}>
      <Pressable
        onPress={() => router.push("/voice")}
        accessibilityRole="button"
        accessibilityLabel="Open Voice Assistant"
        accessibilityHint="Opens Voice Assistant from any screen"
        style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }, pressed && styles.pressed]}
      >
        <Ionicons name="mic" size={21} color="#FFFFFF" />
        <Text style={styles.label}>Voice</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", zIndex: 50, elevation: 50 },
  button: { minWidth: 82, height: 48, borderRadius: 24, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  label: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
});
