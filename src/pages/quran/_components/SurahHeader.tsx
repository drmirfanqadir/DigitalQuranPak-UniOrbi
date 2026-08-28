import { Star, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { SurahMeta } from "@/lib/quran-api.ts";

interface SurahHeaderProps {
  surah: SurahMeta;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const BISMILLAH = "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ";

export default function SurahHeader({
  surah,
  isFavorite,
  onToggleFavorite,
  onPrev,
  onNext,
}: SurahHeaderProps) {
  const showBismillah = surah.number !== 1 && surah.number !== 9;

  return (
    <div className="relative rounded-2xl overflow-hidden mb-4"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(210,255,235,0.6) 50%, rgba(255,255,255,0.9) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(100,220,160,0.25)",
        boxShadow: "0 8px 32px rgba(60,180,130,0.12), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: "linear-gradient(90deg, transparent, rgba(80,200,140,0.6), rgba(100,160,255,0.6), transparent)" }}
      />

      <div className="px-6 py-5 text-center">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: surah.revelationType === "Meccan"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(34,197,94,0.15)",
                color: surah.revelationType === "Meccan" ? "#b45309" : "#15803d",
              }}
            >
              <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
              {surah.revelationType}
            </span>
            <span className="text-xs text-muted-foreground">{surah.numberOfAyahs} verses</span>
          </div>

          <button
            onClick={onNext}
            disabled={!onNext}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-3 text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}
        >
          {surah.number}
        </div>

        <h1 className="font-arabic text-5xl font-bold mb-1 text-shimmer leading-none">
          {surah.name}
        </h1>

        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-lg font-semibold tracking-widest uppercase text-slate-700" style={{ fontFamily: "Cinzel Decorative, serif" }}>
            {surah.englishName}
          </p>
          <button
            onClick={onToggleFavorite}
            className="p-1 rounded-full transition-all hover:scale-110"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-4 h-4 ${isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{surah.englishNameTranslation}</p>

        {showBismillah && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="font-arabic text-2xl text-slate-700 leading-loose">{BISMILLAH}</p>
          </div>
        )}
      </div>
    </div>
  );
}
