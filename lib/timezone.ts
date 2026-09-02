import { Platform } from "react-native";

export function detectSystemTimezone(): string {
  try {
    if (Platform.OS !== "web") {
      // expo-localization exposes the device timezone through the first calendar.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Localization = require("expo-localization") as { getCalendars?: () => Array<{ timeZone?: string | null }> };
      const timezone = Localization.getCalendars?.()[0]?.timeZone;
      if (timezone) return timezone;
    }
  } catch { /* use runtime fallback */ }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
