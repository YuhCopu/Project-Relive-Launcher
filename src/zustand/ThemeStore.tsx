import { create } from "zustand";
import { Relive } from "@/relive";

export interface ThemeGradient {
  c1: string;
  c2: string;
  c3: string;
  base: string;
  angle: number;
}

export interface Theme {
  gradient: ThemeGradient;
  accent: string;
}

const defaultTheme: Theme = {
  gradient: {
    c1: "rgba(143, 52, 79, 0.28)",
    c2: "rgba(98, 28, 52, 0.30)",
    c3: "rgba(155, 66, 100, 0.14)",
    base: "#130b10",
    angle: 135,
  },
  accent: "#8f344f",
};

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resetTheme: () => void;
  applyTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  const stored = Relive.Storage.get<Theme>("theme.current");
  const initial = stored ?? defaultTheme;

  return {
    theme: initial,
    setTheme: (t) => {
      Relive.Storage.set("theme.current", t);
      set({ theme: t });
    },
    resetTheme: () => {
      Relive.Storage.set("theme.current", defaultTheme);
      set({ theme: defaultTheme });
    },
    applyTheme: (t) => {
      const root = document.body;
      const { c1, c2, c3, base, angle } = t.gradient;
      root.style.background = `
        radial-gradient(circle at 20% 50%, ${c1}, transparent 50%),
        radial-gradient(circle at 80% 80%, ${c2}, transparent 50%),
        radial-gradient(circle at 40% 20%, ${c3}, transparent 50%),
        linear-gradient(${angle}deg, ${base}, #24101a)
      `;
      root.style.backgroundAttachment = "fixed";
      root.style.setProperty("--accent", t.accent);
    },
  };
});

export { defaultTheme };
