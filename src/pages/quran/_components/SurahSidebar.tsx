import { useState, useMemo } from "react";
import { Search, Star, StarOff, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { SurahMeta } from "@/lib/quran-api.ts";

interface SurahSidebarProps {
  surahs: SurahMeta[];
  currentSurah: number;
  favorites: number[];
  onSelectSurah: (n: number) => void;
  onToggleFavorite: (n: number) => void;
}

export default function SurahSidebar({
  surahs,
  currentSurah,
  favorites,
  onSelectSurah,
  onToggleFavorite,
}: SurahSidebarProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "favorites">("all");

  const filtered = useMemo(() => {
    const base = tab === "favorites" ? surahs.filter(s => favorites.includes(s.number)) : surahs;
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(s =>
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.number.toString().includes(q) ||
      s.name.includes(search)
    );
  }, [surahs, tab, favorites, search]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search surah..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-muted/60 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex border-b border-border/50">
        {(["all", "favorites"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "all" ? "All" : "Favorites"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">No surahs found</p>
          </div>
        )}
        {filtered.map(surah => {
          const isFav = favorites.includes(surah.number);
          const isActive = surah.number === currentSurah;
          return (
            <div
              key={surah.number}
              className={cn(
                "group flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all hover:bg-primary/8",
                isActive && "bg-primary/12 border-r-2 border-primary"
              )}
              onClick={() => onSelectSurah(surah.number)}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {surah.number}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-semibold truncate", isActive && "text-primary")}>
                    {surah.englishName}
                  </span>
                  <span className="font-arabic text-sm text-right text-slate-600 ml-1 shrink-0">
                    {surah.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {surah.englishNameTranslation} · {surah.numberOfAyahs}v
                  </span>
                  <span className={cn("text-[10px]", surah.revelationType === "Meccan" ? "text-amber-600" : "text-emerald-600")}>
                    {surah.revelationType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); onToggleFavorite(surah.number); }}
                  className="p-0.5 rounded"
                  title={isFav ? "Remove favorite" : "Add favorite"}
                >
                  {isFav
                    ? <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    : <StarOff className="w-3 h-3 text-muted-foreground" />
                  }
                </button>
                {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
              </div>
              {isFav && !isActive && (
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
