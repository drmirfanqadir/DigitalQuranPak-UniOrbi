import { Palette } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useState } from "react";

export type AppTheme = "crystal" | "emerald" | "crimson" | "ocean" | "sunset" | "midnight";

export const THEME_STORAGE_KEY = "qs_theme";

export const THEMES: { id: AppTheme; label: string; colors: string[]; bg: string }[] = [
  {
    id: "crystal",
    label: "Crystal",
    colors: ["#e0f2fe", "#dcfce7", "#faf5ff"],
    bg: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 35%, #faf5ff 65%, #f0fdf4 100%)",
  },
  {
    id: "emerald",
    label: "Emerald",
    colors: ["#22c55e", "#10b981", "#06b6d4"],
    bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 35%, #ccfbf1 65%, #cffafe 100%)",
  },
  {
    id: "crimson",
    label: "Crimson",
    colors: ["#ef4444", "#f43f5e", "#a855f7"],
    bg: "linear-gradient(135deg, #fff1f2 0%, #fce7f3 40%, #faf5ff 70%, #fff1f2 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: ["#0ea5e9", "#3b82f6", "#06b6d4"],
    bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #dbeafe 65%, #cffafe 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    colors: ["#f59e0b", "#f97316", "#ef4444"],
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fff7ed 65%, #fef9c3 100%)",
  },
  {
    id: "midnight",
    label: "Midnight",
    colors: ["#6366f1", "#8b5cf6", "#0ea5e9"],
    bg: "linear-gradient(135deg, #1e1b4b 0%, #1e1035 35%, #0c1a3a 65%, #1a1035 100%)",
  },
];

export function loadTheme(): AppTheme {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return (t as AppTheme | null) ?? "crystal";
  } catch {
    return "crystal";
  }
}

interface ThemeSwitcherProps {
  currentTheme: AppTheme;
  onChange: (theme: AppTheme) => void;
}

export default function ThemeSwitcher({ currentTheme, onChange }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
          open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        <Palette className="w-3.5 h-3.5" />
        Theme
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 p-3 rounded-xl shadow-xl w-52"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(100,220,160,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Theme</p>
          <div className="grid grid-cols-2 gap-1.5">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => { onChange(t.id); setOpen(false); }}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-xs",
                  currentTheme === t.id ? "ring-2 ring-primary bg-primary/8 font-semibold" : "hover:bg-muted"
                )}
              >
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: t.bg }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
