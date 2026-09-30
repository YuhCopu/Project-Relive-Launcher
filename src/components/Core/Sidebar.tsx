import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LibraryBig, Trophy, Settings2, UserRound, Pencil, X, AlertCircle, Loader } from "lucide-react";
import { useAuthStore } from "@/zustand/AuthStore";
import { useNavigationStore } from "@/zustand/NavigationStore";
import { Relive } from "@/relive";
import GlassContainer from "../Global/GlassContainer";

const items = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Library", path: "/library", icon: LibraryBig },
  { label: "Leaderboards", path: "/leaderboards", icon: Trophy },
];

const sizeMap = {
  small: { button: 38, icon: 17, padding: 7 },
  medium: { button: 44, icon: 19, padding: 9 },
  large: { button: 50, icon: 21, padding: 11 },
} as const;

const blurMap = { low: "10px", medium: "18px", high: "28px" } as const;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuthStore();
  const { position, size, opacity, blur, spacing, showTooltips, autoHide } = useNavigationStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearDock, setNearDock] = useState(!autoHide);
  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const metrics = sizeMap[size];

  useEffect(() => {
    if (!autoHide) { setNearDock(true); return; }
    const handler = (e: MouseEvent) => {
      const h = window.innerHeight;
      const edgeDistance = position === "left" ? e.clientX : position === "top" ? e.clientY : h - e.clientY;
      setNearDock(edgeDistance < 110);
      if (profileRef.current?.contains(e.target as Node) === false && dropdownRef.current?.contains(e.target as Node) === false) setProfileOpen(false);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [autoHide, position]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node) && !dropdownRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const dockStyle = useMemo<React.CSSProperties>(() => ({
    opacity: autoHide && !nearDock ? Math.max(opacity * 0.25, 0.12) : opacity,
    backdropFilter: `blur(${blurMap[blur]}) saturate(145%)`,
    WebkitBackdropFilter: `blur(${blurMap[blur]}) saturate(145%)`,
    gap: spacing,
    padding: metrics.padding,
  }), [autoHide, nearDock, opacity, blur, spacing, metrics.padding]);

  const direction = position === "left" ? "column" : "row";
  const axisClass = direction === "column" ? "flex-col" : "flex-row";
  const positionClass = position === "left" ? "launcher-dock-left" : position === "bottom" ? "launcher-dock-bottom" : "launcher-dock-top";

  const saveUsername = async () => {
    const next = username.trim();
    if (!next || next.length < 3 || next.length > 32) { setError("Username must be between 3 and 32 characters"); return; }
    if (next === auth.account?.DisplayName) { setError("New username must be different from current username"); return; }
    if (!auth.base || !auth.jwt) { setError("Profile editing is unavailable until Project Relive services are configured."); return; }
    setLoading(true); setError(null);
    try {
      const response = await Relive.Requests.changeUsername(auth.base, next, auth.jwt);
      if (response.ok) {
        const updatedAccount = { ...auth.account, ...response.data.account };
        Relive.Storage.set("auth.account", updatedAccount);
        useAuthStore.setState({ account: updatedAccount });
        setEditing(false); setUsername("");
      } else setError((response.data as any)?.error || "Failed to change username");
    } catch { setError("An error occurred while changing username"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <motion.nav
        layout
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: autoHide && !nearDock ? Math.max(opacity * 0.25, 0.12) : opacity, scale: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className={`launcher-dock ${positionClass} ${axisClass}`}
        style={dockStyle}
        aria-label="Main navigation"
      >
        <button aria-label="Project Relive home" className="launcher-brand" onClick={() => navigate("/home")}>
          <img src="/ReliveLogo.png" alt="Project Relive" draggable={false} />
        </button>
        <div className={`flex ${axisClass}`} style={{ gap: spacing }}>
          {items.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <NavButton key={path} label={label} active={active} showTooltip={showTooltips} size={metrics.button}>
                <Icon size={metrics.icon} strokeWidth={2.1} />
                <button aria-label={label} className="absolute inset-0" onClick={() => navigate(path)} />
              </NavButton>
            );
          })}
        </div>
        <div className={`flex ${axisClass}`} style={{ gap: spacing }} ref={profileRef}>
          <NavButton label="Settings" active={location.pathname === "/settings"} showTooltip={showTooltips} size={metrics.button}>
            <Settings2 size={metrics.icon} strokeWidth={2.1} />
            <button aria-label="Settings" className="absolute inset-0" onClick={() => navigate("/settings")} />
          </NavButton>
          <div className="relative">
            <NavButton label="Profile" active={profileOpen} showTooltip={showTooltips} size={metrics.button}>
              {auth.account?.ProfilePicture ? <img src={auth.account.ProfilePicture} alt="Profile" className="w-7 h-7 rounded-lg object-cover" /> : <UserRound size={metrics.icon} />}
              <button aria-label="Profile" className="absolute inset-0" onClick={() => setProfileOpen((v) => !v)} />
            </NavButton>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.95, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  className={`absolute z-[90] ${position === "left" ? "left-14 bottom-0" : "right-0 bottom-14"}`}
                >
                  <div className="liquid-glass w-48 rounded-xl overflow-hidden border border-white/15 bg-black/25 backdrop-blur-xl shadow-2xl">
                    <div className="p-3 border-b border-white/10 flex items-center gap-2">
                      <img src={auth.account?.ProfilePicture ?? "/ReliveLogo.png"} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1"><p className="text-sm text-white truncate">{auth.account?.DisplayName ?? "Guest"}</p><p className="text-[11px] text-white/40">Project Relive</p></div>
                      <button aria-label="Edit profile" onClick={() => { setUsername(auth.account?.DisplayName ?? ""); setEditing(true); }} className="text-white/50 hover:text-white"><Pencil size={13} /></button>
                    </div>
                    <div className="p-1.5">
                      <button onClick={() => { setProfileOpen(false); navigate("/settings"); }} className="w-full text-left px-3 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10">Settings</button>
                      <button onClick={() => { auth.logout(); navigate("/"); }} className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-300 hover:bg-red-500/10">Log out</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }}>
              <GlassContainer className="w-96 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-white">Edit Username</h2><button aria-label="Close" onClick={() => setEditing(false)}><X size={18} className="text-white/50 hover:text-white" /></button></div>
                <input autoFocus value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }} maxLength={32} disabled={loading} className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:border-[var(--accent)]" placeholder="New username" />
                {error && <div className="mt-3 flex gap-2 items-center text-xs text-red-300"><AlertCircle size={14} />{error}</div>}
                <div className="flex justify-end gap-2 mt-5"><button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white">Cancel</button><button onClick={saveUsername} disabled={loading} className="px-4 py-2 rounded-xl bg-[var(--accent)]/25 border border-[var(--accent)]/40 text-white hover:bg-[var(--accent)]/35 flex items-center gap-2">{loading && <Loader size={13} className="animate-spin" />}Save</button></div>
              </GlassContainer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const NavButton: React.FC<{ label: string; active: boolean; showTooltip: boolean; size: number; children: React.ReactNode }> = ({ label, active, showTooltip, size, children }) => (
  <div className="relative group">
    <motion.div whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: .94 }} className={`launcher-nav-button ${active ? "is-active" : ""}`} style={{ width: size, height: size }}>
      {active && <motion.span layoutId="navigation-active" className="absolute inset-0 rounded-xl bg-[var(--theme-active)] border border-[var(--accent)]/25" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
      <span className={`relative z-10 transition-colors ${active ? "text-white" : "text-white/45 group-hover:text-white"}`}>{children}</span>
    </motion.div>
    {showTooltip && <span role="tooltip" className="launcher-tooltip">{label}</span>}
  </div>
);

export default Sidebar;
