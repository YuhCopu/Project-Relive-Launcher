import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { HiX, HiMinus } from "react-icons/hi";

const Frame: React.FC = () => <div data-tauri-drag-region className="fixed w-screen h-7 top-0 left-0 flex justify-end items-center z-[110] pointer-events-none"><div className="flex text-white h-full pointer-events-auto"><button aria-label="Minimize" onClick={() => getCurrentWindow().minimize()} className="w-10 h-7 flex justify-center items-center hover:bg-white/15 transition-all rounded-sm"><HiMinus /></button><button aria-label="Close" onClick={() => getCurrentWindow().close()} className="w-10 h-7 flex justify-center items-center hover:bg-red-500/50 transition-all rounded-sm"><HiX /></button></div></div>;
export default Frame;
