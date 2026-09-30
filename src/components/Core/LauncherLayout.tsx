import React from "react";
import { useNavigationStore } from "@/zustand/NavigationStore";
import Sidebar from "./Sidebar";

const LauncherLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const position = useNavigationStore((s) => s.position);
  return (
    <div className={`launcher-layout launcher-layout-${position}`}>
      <Sidebar />
      <main className="launcher-content">{children}</main>
    </div>
  );
};

export default LauncherLayout;
