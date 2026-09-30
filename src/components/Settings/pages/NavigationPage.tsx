import React from "react";
import { motion } from "framer-motion";
import { useNavigationStore, NavigationBlur, NavigationPosition, NavigationSize } from "@/zustand/NavigationStore";
import { RotateCcw } from "lucide-react";

const modes: Array<{ id: NavigationPosition; name: string; description: string }> = [
  { id: "left", name: "Left Floating", description: "Vertical glass dock" },
  { id: "bottom", name: "Bottom Floating", description: "Centered pill dock" },
  { id: "top", name: "Top Floating", description: "Centered top dock" },
];

export const NavigationPage = () => {
  const settings = useNavigationStore();
  return (
    <div className="flex flex-col gap-7 text-white/80">
      <div><h2 className="text-lg font-semibold text-white">Navigation</h2><p className="text-xs text-white/45 mt-1">Tune the floating control dock to match how you use the launcher.</p></div>

      <section><h3 className="text-sm font-semibold text-white mb-3">Navigation style</h3><div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => <motion.button key={mode.id} whileHover={{ y: -2 }} whileTap={{ scale: .98 }} onClick={() => settings.setSettings({ position: mode.id })} className={`text-left rounded-2xl p-3 border transition-all ${settings.position === mode.id ? "border-[var(--accent)]/60 bg-[var(--theme-active)]" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}>
          <div className="h-24 rounded-xl bg-black/20 border border-white/10 relative overflow-hidden mb-3">
            <div className={`absolute ${mode.id === "left" ? "left-3 top-1/2 -translate-y-1/2 flex-col" : mode.id === "bottom" ? "bottom-3 left-1/2 -translate-x-1/2" : "top-3 left-1/2 -translate-x-1/2"} flex gap-1.5 p-1.5 rounded-xl bg-white/10 border border-white/15`}>
              {[0,1,2,3].map((i) => <span key={i} className="w-4 h-4 rounded-md bg-white/20" />)}
            </div>
          </div>
          <p className="text-sm text-white font-medium">{mode.name}</p><p className="text-[11px] text-white/40 mt-0.5">{mode.description}</p>
        </motion.button>)}
      </div></section>

      <div className="grid grid-cols-2 gap-5">
        <SettingGroup title="Size"><Segment value={settings.size} options={["small","medium","large"]} onChange={(v) => settings.setSettings({ size: v as NavigationSize })} /></SettingGroup>
        <SettingGroup title="Blur"><Segment value={settings.blur} options={["low","medium","high"]} onChange={(v) => settings.setSettings({ blur: v as NavigationBlur })} /></SettingGroup>
      </div>

      <SettingGroup title={`Opacity · ${Math.round(settings.opacity * 100)}%`}><input aria-label="Navigation opacity" type="range" min="0.45" max="1" step="0.01" value={settings.opacity} onChange={(e) => settings.setSettings({ opacity: Number(e.target.value) })} className="w-full accent-[var(--accent)]" /></SettingGroup>
      <SettingGroup title={`Icon spacing · ${settings.spacing}px`}><input aria-label="Navigation spacing" type="range" min="4" max="22" step="1" value={settings.spacing} onChange={(e) => settings.setSettings({ spacing: Number(e.target.value) })} className="w-full accent-[var(--accent)]" /></SettingGroup>

      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[.025]">
        <ToggleRow label="Show navigation tooltips" description="Keep icon-only navigation understandable on hover and keyboard focus." value={settings.showTooltips} onChange={(v) => settings.setSettings({ showTooltips: v })} />
        <ToggleRow label="Auto-hide navigation" description="Fade the dock until the pointer approaches its edge." value={settings.autoHide} onChange={(v) => settings.setSettings({ autoHide: v })} />
      </div>
      <div className="flex justify-end"><button onClick={settings.resetSettings} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white hover:bg-white/10"><RotateCcw size={13} />Reset navigation</button></div>
    </div>
  );
};

const SettingGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <div><p className="text-xs font-medium text-white/65 mb-2">{title}</p>{children}</div>;
const Segment: React.FC<{ value: string; options: string[]; onChange: (v: string) => void }> = ({ value, options, onChange }) => <div className="flex gap-1 rounded-xl border border-white/10 bg-black/10 p-1">{options.map((o) => <button key={o} onClick={() => onChange(o)} className={`flex-1 capitalize px-2 py-2 rounded-lg text-xs transition ${value === o ? "bg-[var(--theme-active)] text-white" : "text-white/45 hover:text-white hover:bg-white/5"}`}>{o}</button>)}</div>;
const ToggleRow: React.FC<{ label: string; description: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, description, value, onChange }) => <div className="flex items-center justify-between gap-5 p-4"><div><p className="text-sm text-white/80">{label}</p><p className="text-[11px] text-white/35 mt-1">{description}</p></div><button role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full p-1 transition ${value ? "bg-[var(--accent)]" : "bg-white/10"}`}><span className={`block w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} /></button></div>;
