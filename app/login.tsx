import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { startOAuthLogin } from "@/constants/oauth";

export default function LoginScreen() {
  const colors = useColors();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      await startOAuthLogin();
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <View style={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Welcome" onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹ Back</Text>
        </Pressable>
        <View style={styles.hero}>
          <Image source={require("../assets/images/icon.png")} style={styles.logo} accessibilityLabel="Connex logo" />
          <Text style={[styles.title, { color: colors.foreground }]}>Log in to Connex</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Connect your account to keep your assistant in sync across devices.</Text>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Continue to Connex login" disabled={loggingIn} onPress={() => void handleLogin()} style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loggingIn ? 0.7 : 1 }]}>
            {loggingIn ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Continue to login</Text>}
          </Pressable>
          <Text style={[styles.privacy, { color: colors.muted }]}>Your local tasks and projects stay on this device while you sign in.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 6, paddingVertical: 20 },
  backButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  backText: { fontSize: 15, fontWeight: "800" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 32 },
  logo: { width: 132, height: 132, borderRadius: 34, marginBottom: 28 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "900", textAlign: "center", marginBottom: 12 },
  subtitle: { maxWidth: 460, fontSize: 15, lineHeight: 23, textAlign: "center" },
  actions: { width: "100%", maxWidth: 480, alignSelf: "center", paddingBottom: 8 },
  primaryButton: { minHeight: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  privacy: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 16 },
});
