import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { usePreferences } from "@/lib/preferences";

export default function WelcomeScreen() {
  const colors = useColors();
  const { preferences } = usePreferences();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image source={require("../assets/images/icon.png")} style={styles.logo} accessibilityLabel="Connex logo" />
          <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR DAY, CONNECTED</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome to Connex{preferences.name ? `\n${preferences.name}` : ""}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Your personal assistant for tasks, projects, milestones, calendar, and voice.</Text>
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Continue as guest" onPress={() => router.replace("/(tabs)")} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.primaryButtonText}>Continue as guest</Text>
          </Pressable>
          <Text style={[styles.footer, { color: colors.muted }]}>Start locally and connect your account whenever you are ready.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "space-between", paddingHorizontal: 6, paddingVertical: 28 },
  hero: { alignItems: "center", justifyContent: "center", flex: 1, paddingTop: 18 },
  logo: { width: 176, height: 176, borderRadius: 42, marginBottom: 30 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 10 },
  title: { fontSize: 40, lineHeight: 46, fontWeight: "900", textAlign: "center", marginBottom: 12 },
  subtitle: { maxWidth: 480, fontSize: 16, lineHeight: 24, textAlign: "center" },
  actions: { width: "100%", maxWidth: 480, alignSelf: "center", paddingBottom: 8 },
  primaryButton: { minHeight: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  footer: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 16 },
});
