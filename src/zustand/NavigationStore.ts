import { create } from "zustand";
import { Relive } from "@/relive";

export type NavigationPosition = "left" | "bottom" | "top";
export type NavigationSize = "small" | "medium" | "large";
export type NavigationBlur = "low" | "medium" | "high";

export interface NavigationSettings {
  position: NavigationPosition;
  size: NavigationSize;
  opacity: number;
  blur: NavigationBlur;
  spacing: number;
  showTooltips: boolean;
  autoHide: boolean;
}

const defaults: NavigationSettings = {
  position: "left",
  size: "medium",
  opacity: 0.82,
  blur: "medium",
  spacing: 10,
  showTooltips: true,
  autoHide: false,
};

interface NavigationStore extends NavigationSettings {
  setSettings: (settings: Partial<NavigationSettings>) => void;
  resetSettings: () => void;
}

const stored = Relive.Storage.get<Partial<NavigationSettings>>("navigation.settings");
const initial = { ...defaults, ...(stored ?? {}) };

export const useNavigationStore = create<NavigationStore>((set) => ({
  ...initial,
  setSettings: (settings) => {
    set((state) => {
      const next = { ...state, ...settings };
      Relive.Storage.set("navigation.settings", {
        position: next.position,
        size: next.size,
        opacity: next.opacity,
        blur: next.blur,
        spacing: next.spacing,
        showTooltips: next.showTooltips,
        autoHide: next.autoHide,
      });
      return next;
    });
  },
  resetSettings: () => {
    Relive.Storage.set("navigation.settings", defaults);
    set(defaults);
  },
}));

export { defaults as defaultNavigationSettings };
