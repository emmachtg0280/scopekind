import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

export const scopeKindTheme = defineTheme({
  name: "scopekind",
  extends: neutralTheme,
  color: { accent: ["#2455f5", "#8da9ff"], neutralStyle: "warm" },
  typography: {
    scale: { base: 15, ratio: 1.19 },
    body: { family: "DM Sans", fallbacks: "Arial, sans-serif" },
    heading: { family: "Space Grotesk", fallbacks: "Arial, sans-serif" },
  },
  radius: { base: 6, multiplier: 1.5 },
  tokens: {
    "--color-background-body": ["#f7f7f3", "#191b19"],
    "--color-background-surface": ["#ffffff", "#232722"],
    "--color-background-wash": ["#f1f2ec", "#20241f"],
  },
  localTokens: {
    "--sk-paper": ["#fff5d9", "#3f392a"],
    "--sk-tomato": ["#c24d36", "#fa947e"],
    "--sk-olive": ["#3e5338", "#c1d4b9"],
    "--sk-cover-font": "clamp(44px, 5vw, 72px)",
    "--sk-line": "1px solid var(--color-border)",
  },
});
