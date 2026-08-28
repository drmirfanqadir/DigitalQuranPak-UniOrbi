import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Loader2, AlertCircle, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import {
  fetchSurahList,
  fetchSurahMultiEdition,
  type SurahMeta,
  type SurahData,
  type TranslationId,
  type ReciterId,
} from "@/lib/quran-api.ts";
import { applyTajweedColors } from "@/lib/tajweed.tsx";
import { useAudioPlayer } from "@/hooks/use-audio-player.ts";

import SurahSidebar from "./_components/SurahSidebar.tsx";
import SurahHeader from "./_components/SurahHeader.tsx";
import VerseCard from "./_components/VerseCard.tsx";
import AudioPlayer from "./_components/AudioPlayer.tsx";
import ReaderControls from "./_components/ReaderControls.tsx";
import ThemeSwitcher, { THEMES, loadTheme, type AppTheme } from "./_components/ThemeSwitcher.tsx";
import JumpToVerse from "./_components/JumpToVerse.tsx";
import ExportPanel from "./_components/ExportPanel.tsx";

const LS_FAV = "qs_favorites";
const LS_BOOK = "qs_bookmarks";
const LS_PROGRESS = "qs_progress";
const LS_FONTSIZE = "qs_fontsize";
const LS_TRANS1 = "qs_trans1";
const LS_TRANS2 = "qs_trans2";
const LS_TAJWEED = "qs_tajweed";

function ls<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function lsSet(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [surahData, setSurahData] = useState<SurahData[] | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [favorites, setFavorites] = useState<number[]>(() => ls<number[]>(LS_FAV, []));
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => ls(LS_BOOK, {}));
  const [fontSize, setFontSize] = useState<number>(() => ls(LS_FONTSIZE, 32));
  const [trans1, setTrans1] = useState<TranslationId>(() => ls(LS_TRANS1, "ur.jalandhry") as TranslationId);
  const [trans2, setTrans2] = useState<TranslationId>(() => ls(LS_TRANS2, "en.sahih") as TranslationId);
  const [tajweedOn, setTajweedOn] = useState<boolean>(() => ls(LS_TAJWEED, false));
  const [theme, setTheme] = useState<AppTheme>(loadTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportAyah, setExportAyah] = useState<{ surahIdx: number } | null>(null);
  const [activeAyahNum, setActiveAyahNum] = useState<number>(1);

  const mainRef = useRef<HTMLDivElement>(null);
  const themeData = THEMES.find(t => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    setLoadingList(true);
    fetchSurahList()
      .then(list => {
        setSurahs(list);
        const last = ls<number>(LS_PROGRESS, 1);
        setCurrentSurah(last);
      })
      .catch(() => setError("Failed to load Quran data. Please refresh."))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!currentSurah) return;
    setLoadingData(true);
    setSurahData(null);
    setError(null);
    const editions = ["quran-uthmani", trans1, trans2];
    fetchSurahMultiEdition(currentSurah, editions)
      .then(data => {
        setSurahData(data);
        lsSet(LS_PROGRESS, currentSurah);
      })
      .catch(() => {
        setError("Failed to load surah. Check your connection.");
        toast.error("Failed to load surah");
      })
      .finally(() => setLoadingData(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurah, trans1, trans2]);

  const totalAyahs = surahData?.[0]?.numberOfAyahs ?? surahData?.[0]?.ayahs.length ?? 0;

  const handleAyahChange = useCallback((idx: number) => {
    setActiveAyahNum(idx + 1);
  }, []);

  const audio = useAudioPlayer(currentSurah, totalAyahs, handleAyahChange);

  const currentMeta = surahs.find(s => s.number === currentSurah);

  const handleSelectSurah = (n: number) => {
    setCurrentSurah(n);
    setActiveAyahNum(1);
    setSidebarOpen(false);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  };

  const handleToggleFavorite = (n: number) => {
    setFavorites(prev => {
      const next = prev.includes(n) ? prev.filter(x => x !== n) : [...prev.slice(-9), n];
      lsSet(LS_FAV, next);
      return next;
    });
  };

  const handleToggleBookmark = (ayahNum: number) => {
    const key = `${currentSurah}:${ayahNum}`;
    setBookmarks(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) delete next[key];
      lsSet(LS_BOOK, next);
      return next;
    });
    toast.success(bookmarks[`${currentSurah}:${ayahNum}`] ? "Bookmark removed" : "Bookmarked!");
  };

  const handleThemeChange = (t: AppTheme) => {
    setTheme(t);
    lsSet("qs_theme", t);
  };

  const orbColors = {
    crystal:  ["rgba(134,239,172,0.5)", "rgba(147,197,253,0.4)", "rgba(216,180,254,0.35)"],
    emerald:  ["rgba(52,211,153,0.55)", "rgba(6,182,212,0.45)", "rgba(16,185,129,0.40)"],
    crimson:  ["rgba(248,113,113,0.45)", "rgba(192,132,252,0.40)", "rgba(251,113,133,0.40)"],
    ocean:    ["rgba(56,189,248,0.50)", "rgba(99,102,241,0.40)", "rgba(34,211,238,0.40)"],
    sunset:   ["rgba(251,191,36,0.50)", "rgba(251,146,60,0.45)", "rgba(248,113,113,0.40)"],
    midnight: ["rgba(99,102,241,0.60)", "rgba(139,92,246,0.55)", "rgba(14,165,233,0.50)"],
  }[theme];

  const isMidnight = theme === "midnight";

  if (loadingList) {
    return (
      <div className="h-screen flex items-center justify-center"
        style={{ background: themeData.bg }}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm text-slate-500">Loading Smart Quran Studio\u2026</p>
        </div>
      </div>
    );
  }

  if (error && !surahData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-red-400" />
          <p className="text-sm text-slate-600">{error}</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-sm text-white"
            style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const arabicAyahs = surahData?.[0]?.ayahs ?? [];
  const trans1Ayahs = surahData?.[1]?.ayahs ?? [];
  const trans2Ayahs = surahData?.[2]?.ayahs ?? [];
  const trans1Label = (surahData?.[1]?.edition.englishName ?? trans1).toUpperCase().replace(".", " \u00b7 ");
  const trans2Label = (surahData?.[2]?.edition.englishName ?? trans2).toUpperCase().replace(".", " \u00b7 ");

  return (
    <div
      className="relative"
      style={{
        background: themeData.bg,
        display: "grid",
        gridTemplateColumns: "256px 1fr",
        gridTemplateRows: "1fr",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="bg-orbs">
        <div className="bg-orb w-96 h-96 -top-20 -left-20" style={{ background: orbColors[0] }} />
        <div className="bg-orb bg-orb-2 w-80 h-80 top-1/2 -right-16" style={{ background: orbColors[1] }} />
        <div className="bg-orb bg-orb-3 w-72 h-72 bottom-20 left-1/3" style={{ background: orbColors[2] }} />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col md:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                background: isMidnight ? "rgba(20,15,50,0.96)" : "rgba(255,255,255,0.96)",
                backdropFilter: "blur(24px) saturate(180%)",
                borderRight: "1px solid rgba(100,220,160,0.2)",
              }}
            >
              <SidebarContent
                surahs={surahs}
                currentSurah={currentSurah}
                favorites={favorites}
                isMidnight={isMidnight}
                onSelectSurah={handleSelectSurah}
                onToggleFavorite={handleToggleFavorite}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className="flex flex-col relative z-10"
        style={{
          background: isMidnight ? "rgba(20,15,50,0.88)" : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px) saturate(180%)",
          borderRight: "1px solid rgba(100,220,160,0.2)",
          gridColumn: "1",
          gridRow: "1",
          overflow: "hidden",
        }}
      >
        <SidebarContent
          surahs={surahs}
          currentSurah={currentSurah}
          favorites={favorites}
          isMidnight={isMidnight}
          onSelectSurah={handleSelectSurah}
          onToggleFavorite={handleToggleFavorite}
        />
      </aside>

      <div
        className="flex flex-col min-w-0 relative z-10"
        style={{ gridColumn: "2", gridRow: "1", overflow: "hidden" }}
      >
        <header
          className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b"
          style={{
            background: isMidnight ? "rgba(20,15,50,0.82)" : "rgba(255,255,255,0.80)",
            backdropFilter: "blur(20px)",
            borderColor: isMidnight ? "rgba(255,255,255,0.1)" : "rgba(100,220,160,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-bold text-shimmer" style={{ fontFamily: "Cinzel Decorative, serif" }}>
                Smart Quran Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <JumpToVerse
              surahNumber={currentSurah}
              totalAyahs={totalAyahs}
              onJump={n => {
                setActiveAyahNum(n);
                audio.playAyah(n - 1);
              }}
            />
            <ReaderControls
              fontSize={fontSize}
              trans1={trans1}
              trans2={trans2}
              tajweedOn={tajweedOn}
              onFontSize={n => { setFontSize(n); lsSet(LS_FONTSIZE, n); }}
              onTrans1={id => { setTrans1(id); lsSet(LS_TRANS1, id); }}
              onTrans2={id => { setTrans2(id); lsSet(LS_TRANS2, id); }}
              onToggleTajweed={() => { setTajweedOn(p => { lsSet(LS_TAJWEED, !p); return !p; }); }}
            />
            <ThemeSwitcher currentTheme={theme} onChange={handleThemeChange} />
          </div>
        </header>

        <div ref={mainRef} className="flex-1 overflow-y-auto pb-28 px-4 pt-4">
          <div className="max-w-2xl mx-auto space-y-3">
            {currentMeta && (
              <SurahHeader
                surah={currentMeta}
                isFavorite={favorites.includes(currentSurah)}
                onToggleFavorite={() => handleToggleFavorite(currentSurah)}
                onPrev={currentSurah > 1 ? () => handleSelectSurah(currentSurah - 1) : undefined}
                onNext={currentSurah < 114 ? () => handleSelectSurah(currentSurah + 1) : undefined}
              />
            )}

            {loadingData && (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}>
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Loading verses\u2026</p>
              </div>
            )}

            {error && surahData === null && !loadingData && (
              <div className="py-8 text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {!loadingData && arabicAyahs.map((ayah, idx) => {
              const t1 = trans1Ayahs[idx]?.text ?? "";
              const t2 = trans2Ayahs[idx]?.text ?? "";
              const bKey = `${currentSurah}:${ayah.numberInSurah}`;

              return (
                <motion.div
                  key={`${currentSurah}-${ayah.numberInSurah}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.5) }}
                >
                  <VerseCard
                    ayah={ayah}
                    surahNumber={currentSurah}
                    surahEnglishName={currentMeta?.englishName ?? ""}
                    arabicText={ayah.text}
                    arabicNode={tajweedOn ? applyTajweedColors(ayah.text) : undefined}
                    translation1={t1}
                    translation2={t2}
                    translation1Label={trans1Label}
                    translation2Label={trans2Label}
                    fontSize={fontSize}
                    isActive={activeAyahNum === ayah.numberInSurah}
                    isBookmarked={!!bookmarks[bKey]}
                    onBookmark={() => handleToggleBookmark(ayah.numberInSurah)}
                    onPlayAyah={() => {
                      setActiveAyahNum(ayah.numberInSurah);
                      audio.playAyah(idx);
                    }}
                    onExport={() => setExportAyah({ surahIdx: idx })}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AudioPlayer
        surahName={currentMeta?.englishName ?? ""}
        surahNumber={currentSurah}
        currentAyahIndex={audio.currentAyahIndex}
        totalAyahs={totalAyahs || 1}
        reciterId={audio.reciterId}
        playbackState={audio.playbackState}
        progress={audio.progress}
        duration={audio.duration}
        currentTime={audio.currentTime}
        repeatMode={audio.repeatMode}
        autoScroll={audio.autoScroll}
        onPlay={audio.play}
        onPause={audio.pause}
        onNext={audio.next}
        onPrev={audio.prev}
        onSeek={audio.seekTo}
        onChangeReciter={id => audio.changeReciter(id as ReciterId)}
        onToggleRepeat={audio.toggleRepeat}
        onToggleAutoScroll={() => audio.setAutoScroll(!audio.autoScroll)}
      />

      {exportAyah !== null && arabicAyahs[exportAyah.surahIdx] && (
        <ExportPanel
          ayah={arabicAyahs[exportAyah.surahIdx]}
          surahNumber={currentSurah}
          surahEnglishName={currentMeta?.englishName ?? ""}
          arabicText={arabicAyahs[exportAyah.surahIdx].text}
          translation1={trans1Ayahs[exportAyah.surahIdx]?.text ?? ""}
          translation1Label={trans1Label}
          onClose={() => setExportAyah(null)}
        />
      )}
    </div>
  );
}

interface SidebarContentProps {
  surahs: SurahMeta[];
  currentSurah: number;
  favorites: number[];
  isMidnight: boolean;
  onSelectSurah: (n: number) => void;
  onToggleFavorite: (n: number) => void;
  onClose?: () => void;
}

function SidebarContent({
  surahs,
  currentSurah,
  favorites,
  isMidnight,
  onSelectSurah,
  onToggleFavorite,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: isMidnight ? "rgba(255,255,255,0.1)" : "rgba(100,220,160,0.2)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}>
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ fontFamily: "Cinzel Decorative, serif", color: isMidnight ? "#e2e8f0" : "#1e293b" }}>
              Smart Quran
            </p>
            <p className="text-[10px] text-muted-foreground">114 Surahs</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <SurahSidebar
        surahs={surahs}
        currentSurah={currentSurah}
        favorites={favorites}
        onSelectSurah={onSelectSurah}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
}
