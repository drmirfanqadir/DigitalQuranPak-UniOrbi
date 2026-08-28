import { motion, AnimatePresence } from "motion/react";
import {
  Play, Pause, SkipBack, SkipForward,
  Repeat, Repeat1, AlignCenter,
  Loader2, ChevronDown, ChevronUp, Music2,
} from "lucide-react";
import { useState, useRef } from "react";
import { RECITERS, type ReciterId } from "@/lib/quran-api.ts";
import type { PlaybackState, RepeatMode } from "@/hooks/use-audio-player.ts";
import { cn } from "@/lib/utils.ts";

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface AudioPlayerProps {
  surahName: string;
  surahNumber: number;
  currentAyahIndex: number;
  totalAyahs: number;
  reciterId: ReciterId;
  playbackState: PlaybackState;
  progress: number;
  duration: number;
  currentTime: number;
  repeatMode: RepeatMode;
  autoScroll: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (ratio: number) => void;
  onChangeReciter: (id: ReciterId) => void;
  onToggleRepeat: () => void;
  onToggleAutoScroll: () => void;
}

export default function AudioPlayer({
  surahName,
  surahNumber,
  currentAyahIndex,
  totalAyahs,
  reciterId,
  playbackState,
  progress,
  duration,
  currentTime,
  repeatMode,
  autoScroll,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
  onChangeReciter,
  onToggleRepeat,
  onToggleAutoScroll,
}: AudioPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const isPlaying = playbackState === "playing";
  const isLoading = playbackState === "loading";
  const currentReciter = RECITERS.find(r => r.id === reciterId);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio);
  };

  // suppress unused warning
  void surahNumber;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
        borderTop: "1px solid rgba(100,220,160,0.25)",
        boxShadow: "0 -8px 32px rgba(60,180,130,0.10), 0 -1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      <div
        ref={progressRef}
        className="w-full h-1 cursor-pointer group/prog"
        onClick={handleProgressClick}
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #22c55e, #0ea5e9, #22c55e)",
            backgroundSize: "200% 100%",
            animation: isPlaying ? "shimmer 3s linear infinite" : "none",
          }}
        />
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}>
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  {[0, 0.2, 0.4, 0.6, 0.2].map((delay, i) => (
                    <div key={i} className="w-0.5 wave-bar rounded-full bg-white"
                      style={{ height: "100%", animationDelay: `${delay}s` }} />
                  ))}
                </div>
              ) : (
                <Music2 className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-slate-800">
                {surahName} \u2014 Ayah {currentAyahIndex + 1}/{totalAyahs}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{currentReciter?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={currentAyahIndex === 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30">
              <SkipBack className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isPlaying
                  ? <Pause className="w-4 h-4" />
                  : <Play className="w-4 h-4 translate-x-px" />
              }
            </button>

            <button onClick={onNext} disabled={currentAyahIndex >= totalAyahs - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30">
              <SkipForward className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleRepeat}
              className={cn("p-1.5 rounded-lg transition-colors", repeatMode !== "none" ? "text-primary bg-primary/10" : "text-slate-400 hover:bg-slate-100")}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "one" ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onToggleAutoScroll}
              className={cn("p-1.5 rounded-lg transition-colors", autoScroll ? "text-primary bg-primary/10" : "text-slate-400 hover:bg-slate-100")}
              title="Auto-scroll"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-1 border-t border-border/40 mt-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Reciters</p>
                <div className="flex flex-wrap gap-1.5">
                  {RECITERS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => onChangeReciter(r.id as ReciterId)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full transition-all",
                        r.id === reciterId
                          ? "text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                      style={r.id === reciterId
                        ? { background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }
                        : {}
                      }
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
