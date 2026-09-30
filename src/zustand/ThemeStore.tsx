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
  id?: string;
  name?: string;
  description?: string;
  gradient: ThemeGradient;
  accent: string;
  glow?: string;
  card?: string;
  active?: string;
  hover?: string;
}

export const defaultTheme: Theme = {
  id: "project-relive",
  name: "Project Relive",
  description: "The official Project Relive identity.",
  gradient: {
    c1: "rgba(143, 52, 79, 0.30)",
    c2: "rgba(98, 28, 52, 0.32)",
    c3: "rgba(155, 66, 100, 0.16)",
    base: "#130b10",
    angle: 135,
  },
  accent: "#c04b72",
  glow: "rgba(192, 75, 114, 0.28)",
  card: "rgba(255,255,255,0.055)",
  active: "rgba(192,75,114,0.22)",
  hover: "rgba(255,255,255,0.08)",
};

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resetTheme: () => void;
  applyTheme: (t: Theme) => void;
}

export const applyThemeToDocument = (t: Theme) => {
  const root = document.documentElement;
  const body = document.body;
  const { c1, c2, c3, base, angle } = t.gradient;
  root.style.setProperty("--theme-base", base);
  root.style.setProperty("--theme-c1", c1);
  root.style.setProperty("--theme-c2", c2);
  root.style.setProperty("--theme-c3", c3);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--theme-glow", t.glow ?? `${t.accent}55`);
  root.style.setProperty("--theme-card", t.card ?? "rgba(255,255,255,0.055)");
  root.style.setProperty("--theme-active", t.active ?? `${t.accent}33`);
  root.style.setProperty("--theme-hover", t.hover ?? "rgba(255,255,255,0.08)");
  body.style.background = `radial-gradient(circle at 20% 50%, ${c1}, transparent 50%), radial-gradient(circle at 80% 80%, ${c2}, transparent 50%), radial-gradient(circle at 40% 20%, ${c3}, transparent 50%), linear-gradient(${angle}deg, ${base}, color-mix(in srgb, ${base} 72%, ${t.accent}))`;
  body.style.backgroundAttachment = "fixed";
};

export const isValidTheme = (value: unknown): value is Theme => {
  if (!value || typeof value !== "object") return false;
  const v = value as Theme;
  return !!v.gradient &&
    typeof v.gradient.c1 === "string" &&
    typeof v.gradient.c2 === "string" &&
    typeof v.gradient.c3 === "string" &&
    typeof v.gradient.base === "string" &&
    typeof v.gradient.angle === "number" &&
    Number.isFinite(v.gradient.angle) &&
    typeof v.accent === "string";
};

const stored = Relive.Storage.get<Theme>("theme.current");
const initial = stored && isValidTheme(stored) ? stored : defaultTheme;

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initial,
  setTheme: (t) => {
    Relive.Storage.set("theme.current", t);
    set({ theme: t });
  },
  resetTheme: () => {
    Relive.Storage.set("theme.current", defaultTheme);
    set({ theme: defaultTheme });
  },
  applyTheme: (t) => applyThemeToDocument(t),
}));
