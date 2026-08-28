import { Sliders, Languages } from "lucide-react";
import { TRANSLATIONS, type TranslationId } from "@/lib/quran-api.ts";
import { TAJWEED_COLORS } from "@/lib/tajweed.tsx";
import { cn } from "@/lib/utils.ts";
import { useState } from "react";

interface ReaderControlsProps {
  fontSize: number;
  trans1: TranslationId;
  trans2: TranslationId;
  tajweedOn: boolean;
  onFontSize: (n: number) => void;
  onTrans1: (id: TranslationId) => void;
  onTrans2: (id: TranslationId) => void;
  onToggleTajweed: () => void;
}

export default function ReaderControls({
  fontSize,
  trans1,
  trans2,
  tajweedOn,
  onFontSize,
  onTrans1,
  onTrans2,
  onToggleTajweed,
}: ReaderControlsProps) {
  const [open, setOpen] = useState<"font" | "trans" | "tajweed" | null>(null);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setOpen(open === "font" ? null : "font")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            open === "font" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          {fontSize}px
        </button>
        {open === "font" && (
          <div className="absolute right-0 top-full mt-1 z-50 p-3 rounded-xl shadow-xl w-40"
            style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(100,220,160,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Arabic font size</p>
            <input
              type="range" min={20} max={60} step={2} value={fontSize}
              onChange={e => onFontSize(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20</span><span>{fontSize}px</span><span>60</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(open === "trans" ? null : "trans")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            open === "trans" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Languages className="w-3.5 h-3.5" />
          Translations
        </button>
        {open === "trans" && (
          <div className="absolute right-0 top-full mt-1 z-50 p-3 rounded-xl shadow-xl w-64"
            style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(100,220,160,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            {(["Translation 1", trans1, onTrans1], ["Translation 2", trans2, onTrans2]) && 
             ([["Translation 1", trans1, onTrans1], ["Translation 2", trans2, onTrans2]] as const).map(([label, val, setter]) => (
              <div key={label} className="mb-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">{label}</p>
                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                  {TRANSLATIONS.map(t => (
                    <button key={t.id} onClick={() => setter(t.id as TranslationId)}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded text-xs transition-colors",
                        val === t.id ? "bg-primary/15 text-primary font-medium" : "hover:bg-muted text-slate-600"
                      )}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onToggleTajweed}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
          tajweedOn ? "text-white" : "bg-muted text-muted-foreground hover:text-foreground"
        )}
        style={tajweedOn ? { background: "linear-gradient(135deg, #22c55e, #0ea5e9)" } : {}}
      >
        <span className="font-arabic text-sm leading-none">ت</span>
        Tajweed
      </button>

      {tajweedOn && (
        <div className="hidden md:flex items-center gap-2">
          {Object.values(TAJWEED_COLORS).slice(0, 3).map(c => (
            <span key={c.label} className="text-[9px] flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: c.color }} />
              {c.label.split(" ")[0]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
