import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Palette, SlidersHorizontal, Wrench, Settings2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/zustand/AuthStore";
import GlassContainer from "@/components/Global/GlassContainer";
import { GameOptionsPage } from "@/components/Settings/pages/GameOptionsPage";
import { OptionsPage } from "@/components/Settings/pages/OptionsPage";
import { DeveloperPage } from "@/components/Settings/pages/DeveloperPage";
import { ThemePage } from "@/components/Settings/pages/ThemePage";
import { NavigationPage } from "@/components/Settings/pages/NavigationPage";

const Settings: React.FC = () => {
  const isDev = useAuthStore((s) => s.account?.Roles.includes("Developer") ?? false);
  const [view, setView] = useState("Themes");
  const groups = [
    { label: "Appearance", items: [{ id: "Themes", icon: Palette }, { id: "Navigation", icon: SlidersHorizontal }, { id: "Customization", icon: Sparkles }] },
    { label: "Game", items: [{ id: "Game", icon: Gamepad2 }] },
    { label: "Launcher", items: [{ id: "General", icon: Settings2 }] },
    ...(isDev ? [{ label: "Developer", items: [{ id: "Developer", icon: Wrench }] }] : []),
  ];
  const render = () => {
    switch (view) {
      case "Navigation": return <NavigationPage />;
      case "Game": return <GameOptionsPage />;
      case "General": return <OptionsPage />;
      case "Developer": return <DeveloperPage />;
      case "Customization": return <ThemePage />;
      default: return <ThemePage />;
    }
  };

  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} className="w-full min-h-screen flex gap-5 px-5 py-8">
    <aside className="w-52 shrink-0"><div className="mb-4"><p className="text-[10px] uppercase tracking-[.24em] text-white/30">Launcher</p><h1 className="text-xl font-semibold text-white mt-1">Settings</h1></div><GlassContainer className="rounded-2xl p-2 sticky top-8">
      {groups.map((group) => <div key={group.label} className="mb-3 last:mb-0"><p className="px-2.5 py-2 text-[10px] uppercase tracking-wider text-white/25">{group.label}</p>{group.items.map((item) => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs transition-all ${active ? "bg-[var(--theme-active)] text-white shadow-[0_0_24px_var(--theme-glow)]" : "text-white/45 hover:text-white hover:bg-white/5"}`}><Icon size={15} />{item.id}</button>; })}</div>)}
    </GlassContainer></aside>
    <section className="min-w-0 flex-1"><GlassContainer className="rounded-2xl p-6 min-h-[calc(100vh-4rem)]">{render()}</GlassContainer></section>
  </motion.div>;
};
export default Settings;
