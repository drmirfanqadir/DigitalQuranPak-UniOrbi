import { useState } from "react";
import { Copy, Bookmark, Share2, Check, Play, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import type { Ayah } from "@/lib/quran-api.ts";
import type { ReactNode } from "react";

const CARD_STYLES = [
  {
    bg: "linear-gradient(135deg, rgba(255,255,255,0.93) 0%, rgba(200,255,235,0.55) 100%)",
    border: "rgba(80,220,160,0.28)",
    shadow: "rgba(60,190,130,0.12)",
    numBg: "linear-gradient(135deg, rgba(60,200,140,0.9), rgba(40,170,220,0.9))",
    accent: "#22c55e",
    label: "emerald",
  },
  {
    bg: "linear-gradient(135deg, rgba(255,255,255,0.93) 0%, rgba(255,218,218,0.45) 100%)",
    border: "rgba(220,80,100,0.22)",
    shadow: "rgba(200,60,80,0.10)",
    numBg: "linear-gradient(135deg, rgba(220,80,100,0.9), rgba(180,60,200,0.9))",
    accent: "#ef4444",
    label: "crimson",
  },
  {
    bg: "linear-gradient(135deg, rgba(255,255,255,0.93) 0%, rgba(218,218,255,0.45) 100%)",
    border: "rgba(100,100,240,0.22)",
    shadow: "rgba(80,80,210,0.10)",
    numBg: "linear-gradient(135deg, rgba(100,100,240,0.9), rgba(60,180,220,0.9))",
    accent: "#6366f1",
    label: "violet",
  },
  {
    bg: "linear-gradient(135deg, rgba(255,255,255,0.93) 0%, rgba(255,245,200,0.50) 100%)",
    border: "rgba(220,180,40,0.28)",
    shadow: "rgba(200,160,20,0.12)",
    numBg: "linear-gradient(135deg, rgba(220,180,40,0.92), rgba(255,140,40,0.9))",
    accent: "#f59e0b",
    label: "gold",
  },
];

interface VerseCardProps {
  ayah: Ayah;
  surahNumber: number;
  surahEnglishName: string;
  arabicText: string;
  arabicNode?: ReactNode;
  translation1: string;
  translation2: string;
  translation1Label: string;
  translation2Label: string;
  fontSize: number;
  isActive?: boolean;
  isBookmarked?: boolean;
  onBookmark?: (n: number) => void;
  onPlayAyah?: () => void;
  onExport?: () => void;
}

export default function VerseCard({
  ayah,
  surahNumber,
  surahEnglishName,
  arabicText,
  arabicNode,
  translation1,
  translation2,
  translation1Label,
  translation2Label,
  fontSize,
  isActive = false,
  isBookmarked = false,
  onBookmark,
  onPlayAyah,
  onExport,
}: VerseCardProps) {
  const [copied, setCopied] = useState(false);
  const s = CARD_STYLES[ayah.numberInSurah % CARD_STYLES.length];

  const handleCopy = () => {
    const text = `${arabicText}\n\n${translation1}\n${translation2}\n\n[${surahEnglishName} ${surahNumber}:${ayah.numberInSurah}]`;
    void navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Verse copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `${arabicText}\n\n${translation1}\n\n\u2014 ${surahEnglishName} ${surahNumber}:${ayah.numberInSurah}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      void navigator.clipboard.writeText(text);
      toast.success("Verse copied for sharing!");
    }
  };

  return (
    <div
      id={`verse-${surahNumber}:${ayah.numberInSurah}`}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: s.bg,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${isActive ? s.accent + "80" : s.border}`,
        boxShadow: isActive
          ? `0 8px 32px ${s.shadow}, 0 0 0 2px ${s.border}, 0 1px 0 rgba(255,255,255,0.95) inset`
          : `0 4px 20px ${s.shadow}, 0 1px 0 rgba(255,255,255,0.95) inset`,
        transform: isActive ? "scale(1.005)" : "scale(1)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${s.border}, transparent)` }}
      />
      {isActive && (
        <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl" style={{ background: s.numBg }} />
      )}

      <div className={cn("p-5", isActive && "pl-6")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
              style={{ background: s.numBg }}
            >
              {ayah.numberInSurah}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Juz {ayah.juz} \u00b7 Page {ayah.page}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onPlayAyah && (
              <button onClick={onPlayAyah} className="p-1.5 rounded-lg hover:scale-110 transition-transform"
                style={{ background: s.numBg }} title="Play verse">
                <Play className="w-3.5 h-3.5 text-white translate-x-px" />
              </button>
            )}
            {onExport && (
              <button onClick={onExport} className="p-1.5 rounded-lg" title="Export">
                <Download className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
            <button onClick={() => onBookmark?.(ayah.numberInSurah)} className="p-1.5 rounded-lg" title="Bookmark">
              <Bookmark className={cn("w-3.5 h-3.5", isBookmarked ? "fill-amber-500 text-amber-500" : "text-slate-400")} />
            </button>
            <button onClick={handleCopy} className="p-1.5 rounded-lg" title="Copy">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            <button onClick={() => void handleShare()} className="p-1.5 rounded-lg" title="Share">
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        <div
          className="font-arabic text-right mb-4 pb-4 leading-loose"
          style={{
            fontSize: `${fontSize}px`,
            borderBottom: `1px solid ${s.border}`,
            color: "oklch(0.20 0.04 220)",
            textShadow: `0 1px 3px ${s.shadow}`,
          }}
          dir="rtl"
        >
          {arabicNode ?? arabicText}
          <span className="mx-2 text-sm" style={{ color: s.accent }}>
            {" "}﴾{ayah.numberInSurah}﴿
          </span>
        </div>

        <div className="space-y-3">
          <TranslationBlock label={translation1Label} text={translation1} />
          {translation2 && translation2 !== translation1 && (
            <TranslationBlock label={translation2Label} text={translation2} />
          )}
        </div>

        {ayah.sajda && (
          <div className="mt-3 flex justify-end">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: s.numBg }}>
              ۹ Sajda
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TranslationBlock({ label, text }: { label: string; text: string }) {
  const isRTL = label.includes("اردو") || label.includes("فارسی") || label.includes("عربي");
  return (
    <div>
      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 block">{label}</span>
      <p className={cn("text-sm leading-relaxed text-slate-700", isRTL && "font-arabic text-right")} dir={isRTL ? "rtl" : "ltr"}>
        {text}
      </p>
    </div>
  );
}
