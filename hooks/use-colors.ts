import { useMemo } from "react";
import { useColorScheme } from "./use-color-scheme";
import { Colors, type ColorScheme, type ThemeColorPalette } from "@/constants/theme";
import { usePreferences } from "@/lib/preferences";

export function useColors(colorSchemeOverride?: ColorScheme): ThemeColorPalette {
  const colorScheme = useColorScheme();
  const { preferences } = usePreferences();
  const scheme = (colorSchemeOverride ?? colorScheme ?? "light") as ColorScheme;
  return useMemo(() => ({
    ...Colors[scheme],
    primary: preferences.accent,
    tint: preferences.accent,
    tabIconSelected: preferences.accent,
  }), [preferences.accent, scheme]);
}
