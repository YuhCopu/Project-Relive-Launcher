import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Palette, RotateCcw, Search, Upload } from "lucide-react";
import GlassContainer from "@/components/Global/GlassContainer";
import { Theme, defaultTheme, isValidTheme, useThemeStore, applyThemeToDocument } from "@/zustand/ThemeStore";
import { useToastStore } from "@/zustand/ToastStore";

const hexOf = (value: string) => { const m=value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); if(!m) return value; return `#${[1,2,3].map(i=>Number(m[i]).toString(16).padStart(2,"0")).join("")}`; };
const rgba = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;
  const r = parseInt(value.slice(0,2),16), g = parseInt(value.slice(2,4),16), b = parseInt(value.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
};
const gradient = (t: Theme) => `linear-gradient(${t.gradient.angle}deg, ${t.gradient.c1}, ${t.gradient.c2}, ${t.gradient.c3}, ${t.gradient.base})`;
const t = (id:string,name:string,description:string,base:string,c1:string,c2:string,c3:string,accent:string,angle:number,category:string): Theme & {category:string} => ({ id,name,description,category,gradient:{base,c1:rgba(c1,.32),c2:rgba(c2,.30),c3:rgba(c3,.18),angle},accent,glow:rgba(accent,.28),card:"rgba(255,255,255,.055)",active:rgba(accent,.24),hover:"rgba(255,255,255,.085)" });

const presets: Array<Theme & {category:string}> = [
  {...defaultTheme, category:"Official"},
  t("void","Void","Black and purple, tuned for dark rooms.","#07050d","#5b21b6","#251047","#7c3aed","#a78bfa",155,"Dark"),
  t("midnight","Midnight","Deep navy with a cool electric accent.","#050914","#172554","#0f3b64","#1d4ed8","#60a5fa",145,"Dark"),
  t("ocean","Ocean","Deep cyan and blue like a midnight sea.","#031218","#0e7490","#164e63","#0369a1","#22d3ee",150,"Nature"),
  t("arctic","Arctic","Cold, clean blue-white glass.","#08121d","#bae6fd","#38bdf8","#dbeafe","#7dd3fc",135,"Minimal"),
  t("aurora","Aurora","Green, cyan and violet northern lights.","#06110f","#10b981","#06b6d4","#8b5cf6","#34d399",125,"Nature"),
  t("neon","Neon","High-energy cyberpunk contrast.","#09040d","#ec4899","#22d3ee","#a855f7","#f472b6",140,"Neon"),
  t("cyber","Cyber","Magenta, cyan and deep violet.","#08050f","#7e22ce","#db2777","#0891b2","#c084fc",160,"Neon"),
  t("ember","Ember","Dark red and orange heat.","#150704","#ea580c","#991b1b","#f97316","#fb923c",120,"Dark"),
  t("inferno","Inferno","Hot red, orange and gold.","#120301","#dc2626","#ea580c","#f59e0b","#fbbf24",115,"Neon"),
  t("rose","Rose","Deep pink with soft magenta glow.","#120611","#db2777","#9d174d","#ec4899","#f472b6",145,"Colorful"),
  t("sakura","Sakura","Pink petals over a violet dusk.","#120815","#f9a8d4","#c026d3","#8b5cf6","#f0abfc",130,"Colorful"),
  t("amethyst","Amethyst","Rich purple with a jewel-like glow.","#090611","#7e22ce","#4c1d95","#a855f7","#c084fc",150,"Colorful"),
  t("royal","Royal","Regal purple and electric blue.","#060812","#4338ca","#7e22ce","#2563eb","#818cf8",155,"Colorful"),
  t("emerald","Emerald","Deep green with luminous highlights.","#04110a","#047857","#065f46","#10b981","#34d399",145,"Nature"),
  t("jade","Jade","Green and cyan with a glassy feel.","#04100d","#059669","#0f766e","#14b8a6","#2dd4bf",145,"Nature"),
  t("forest","Forest","Earthy, deep woodland greens.","#070e08","#166534","#14532d","#365314","#86efac",135,"Nature"),
  t("toxic","Toxic","Acid green neon over black.","#050a03","#65a30d","#166534","#a3e635","#bef264",120,"Neon"),
  t("gold","Gold","Black glass with a premium gold accent.","#0d0a04","#a16207","#713f12","#ca8a04","#facc15",140,"Minimal"),
  t("sunset","Sunset","Orange, pink and purple horizon.","#12050a","#f97316","#db2777","#7c3aed","#fb7185",125,"Colorful"),
  t("blood-moon","Blood Moon","Deep crimson and black.","#0d0304","#991b1b","#450a0a","#dc2626","#ef4444",150,"Dark"),
  t("galaxy","Galaxy","Cosmic purple, blue and pink.","#05040e","#4c1d95","#1d4ed8","#db2777","#a78bfa",150,"Colorful"),
  t("synthwave","Synthwave","Retro-futuristic pink and blue.","#08040f","#ec4899","#4c1d95","#2563eb","#f0abfc",160,"Neon"),
  t("monochrome","Monochrome","Pure grayscale for a minimal setup.","#070707","#444444","#222222","#888888","#f5f5f5",135,"Minimal"),
];

const categories = ["All","Official","Dark","Colorful","Neon","Minimal","Nature"];

export const ThemePage = () => {
  const { theme, setTheme, resetTheme } = useThemeStore();
  const addToast = useToastStore((s) => s.addToast);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [draft, setDraft] = useState<Theme>(theme);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => presets.filter((p) => (category === "All" || p.category === category) && `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())), [query, category]);
  const updateDraft = (patch: Partial<Theme>) => { const next = {...draft, ...patch}; setDraft(next); applyThemeToDocument(next); };
  const updateGradient = (patch: Partial<Theme["gradient"]>) => { const next = {...draft, gradient:{...draft.gradient,...patch}}; setDraft(next); applyThemeToDocument(next); };
  const choose = (preset: Theme) => { setDraft(preset); setTheme(preset); applyThemeToDocument(preset); };
  const reset = () => { setDraft(defaultTheme); resetTheme(); applyThemeToDocument(defaultTheme); };
  const exportTheme = () => { const blob = new Blob([JSON.stringify({...draft, name:draft.name ?? "My Theme"}, null, 2)], {type:"application/json"}); const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${(draft.name ?? "relive-theme").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()}.json`; a.click(); URL.revokeObjectURL(url); };
  const importTheme = (file: File) => { const reader=new FileReader(); reader.onload=()=>{ try { const parsed=JSON.parse(String(reader.result)); if (!isValidTheme(parsed)) throw new Error("Invalid theme"); const imported={...parsed,id:parsed.id ?? `custom-${Date.now()}`,name:parsed.name ?? "Imported Theme"}; setDraft(imported); setTheme(imported); applyThemeToDocument(imported); } catch { addToast("That theme file is invalid.", "error"); } }; reader.readAsText(file); };

  return <div className="flex flex-col gap-7">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-white">Themes</h2><p className="text-xs text-white/45 mt-1">Choose a complete visual identity or craft your own.</p></div><div className="flex gap-2"><button onClick={exportTheme} className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white flex items-center gap-2"><Download size={13}/>Export</button><button onClick={()=>inputRef.current?.click()} className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white flex items-center gap-2"><Upload size={13}/>Import</button><input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e)=>{const f=e.target.files?.[0]; if(f) importTheme(f); e.currentTarget.value="";}} /></div></div>
    <div className="flex flex-col gap-3"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search themes..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-black/10 text-sm text-white placeholder:text-white/25 outline-none focus:border-[var(--accent)]/50" /></div><div className="flex flex-wrap gap-1.5">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`px-2.5 py-1.5 rounded-lg text-[11px] transition ${category===c?"bg-[var(--theme-active)] text-white":"text-white/40 hover:text-white hover:bg-white/5"}`}>{c}</button>)}</div></div>
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">{filtered.map((preset)=><motion.button key={preset.id} whileHover={{y:-3}} whileTap={{scale:.985}} onClick={()=>choose(preset)} className={`text-left overflow-hidden rounded-2xl border transition ${theme.id===preset.id?"border-[var(--accent)]/70 shadow-[0_0_28px_var(--theme-glow)]":"border-white/10 hover:border-white/20"}`}><div className="h-28 p-2" style={{background:gradient(preset)}}><div className="h-full rounded-xl border border-white/10 bg-black/10 flex items-end justify-between p-2"><span className="w-8 h-2 rounded-full" style={{background:preset.accent}}/><span className="w-12 h-2 rounded-full bg-white/20"/></div></div><div className="p-3 bg-white/[.025]"><div className="flex items-center justify-between gap-2"><p className="text-sm text-white">{preset.name}</p>{theme.id===preset.id&&<span className="w-2 h-2 rounded-full" style={{background:preset.accent}}/>}</div><p className="text-[10px] text-white/35 mt-1 line-clamp-2">{preset.description}</p></div></motion.button>)}</div>
    <GlassContainer className="rounded-2xl p-4"><div className="flex items-center gap-2 mb-4"><Palette size={15} className="text-[var(--accent)]"/><div><p className="text-sm text-white">Custom theme</p><p className="text-[11px] text-white/35">Changes preview instantly. Save when you are happy.</p></div></div><div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[["Background","base"],["Gradient 1","c1"],["Gradient 2","c2"],["Gradient 3","c3"],["Accent","accent"]].map(([label,key])=><label key={key} className="flex items-center justify-between gap-3 text-xs text-white/60">{label}<input type="color" value={key==="accent"?draft.accent:hexOf((draft.gradient as any)[key])} onChange={(e)=>key==="accent"?updateDraft({accent:e.target.value}):updateGradient({[key]:rgba(e.target.value,key==="base"?1:.3)})} className="w-10 h-8 rounded-lg border border-white/10 bg-transparent cursor-pointer"/></label>)}</div><label className="block mt-4 text-xs text-white/50">Gradient angle <input type="range" min="0" max="360" value={draft.gradient.angle} onChange={(e)=>updateGradient({angle:Number(e.target.value)})} className="w-full accent-[var(--accent)] mt-2"/></label><div className="mt-4 h-16 rounded-xl border border-white/10" style={{background:gradient(draft)}}/><div className="flex justify-end gap-2 mt-4"><button onClick={reset} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/55 hover:text-white"><RotateCcw size={13}/>Reset</button><button onClick={()=>{setTheme(draft);applyThemeToDocument(draft)}} className="px-4 py-2 rounded-xl bg-[var(--theme-active)] border border-[var(--accent)]/40 text-xs text-white">Save custom theme</button></div></GlassContainer>
  </div>;
};
