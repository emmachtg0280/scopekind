import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
export const sestetTheme = defineTheme({
  name: "sestet",
  extends: neutralTheme,
  tokens: {
    "--color-accent": ["#234ed9", "#234ed9"],
    "--color-text-primary": ["#172c34", "#172c34"],
    "--color-text-secondary": ["#5b6b72", "#5b6b72"],
    "--color-text-accent": ["#234ed9", "#234ed9"],
  },
});
