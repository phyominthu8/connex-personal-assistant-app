import { Platform } from "react-native";
import Constants from "expo-constants";

type NotificationsModule = typeof import("expo-notifications");

let notificationsPromise: Promise<NotificationsModule | null> | undefined;

/**
 * Expo Go does not include Android remote-notification support. Keep the
 * native module out of startup evaluation and return null when the current
 * runtime cannot provide it. Development builds still load it normally.
 */
export async function loadNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === "web") return null;
  if (Constants.appOwnership === "expo") return null;
  if (!notificationsPromise) {
    notificationsPromise = import("expo-notifications").catch(() => null);
  }
  return notificationsPromise;
}
