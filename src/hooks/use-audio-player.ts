import { useState, useEffect, useRef, useCallback } from "react";
import { getAudioUrl, RECITERS, type ReciterId } from "@/lib/quran-api.ts";

export type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";
export type RepeatMode = "none" | "all" | "one";

export interface AudioPosition {
  surahNumber: number;
  ayahIndex: number; // 0-based
  reciterId: ReciterId;
}

const STORAGE_KEY = "qs_audio_pos";

function loadPosition(): AudioPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AudioPosition) : null;
  } catch {
    return null;
  }
}

function savePosition(pos: AudioPosition) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // ignore
  }
}

export function useAudioPlayer(
  surahNumber: number,
  totalAyahs: number,
  onAyahChange: (ayahIndex: number) => void
) {
  const saved = loadPosition();

  const [reciterId, setReciterId] = useState<ReciterId>(
    saved?.reciterId ?? RECITERS[0].id
  );
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [progress, setProgress] = useState(0); // 0-1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [autoScroll, setAutoScroll] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const surahRef = useRef(surahNumber);
  surahRef.current = surahNumber;

  const totalRef = useRef(totalAyahs);
  totalRef.current = totalAyahs;

  const repeatRef = useRef(repeatMode);
  repeatRef.current = repeatMode;

  const autoScrollRef = useRef(autoScroll);
  autoScrollRef.current = autoScroll;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const loadAndPlay = useCallback((ayahIdx: number, recId: ReciterId) => {
    const ayahNumber = ayahIdx + 1;
    const url = getAudioUrl(recId, surahRef.current, ayahNumber);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlaybackState("loading");
    setCurrentAyahIndex(ayahIdx);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener("playing", () => setPlaybackState("playing"));
    audio.addEventListener("pause", () => {
      if (!audio.ended) setPlaybackState("paused");
    });
    audio.addEventListener("error", () => setPlaybackState("error"));

    audio.addEventListener("ended", () => {
      const repeat = repeatRef.current;
      const total = totalRef.current;
      if (repeat === "one") {
        void audio.play();
        return;
      }
      const nextIdx = ayahIdx + 1;
      if (nextIdx < total) {
        setCurrentAyahIndex(nextIdx);
        onAyahChange(nextIdx);
        if (autoScrollRef.current) {
          const el = document.getElementById(`verse-${surahRef.current}:${nextIdx + 1}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        loadAndPlay(nextIdx, recId);
      } else if (repeat === "all") {
        setCurrentAyahIndex(0);
        onAyahChange(0);
        loadAndPlay(0, recId);
      } else {
        setPlaybackState("idle");
      }
    });

    void audio.play().catch(() => setPlaybackState("error"));

    savePosition({ surahNumber: surahRef.current, ayahIndex: ayahIdx, reciterId: recId });
  }, [onAyahChange]);

  const play = useCallback(() => {
    if (playbackState === "paused" && audioRef.current) {
      void audioRef.current.play();
    } else if (playbackState === "idle" || playbackState === "error") {
      loadAndPlay(currentAyahIndex, reciterId);
    }
  }, [playbackState, currentAyahIndex, reciterId, loadAndPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const next = useCallback(() => {
    const nextIdx = Math.min(currentAyahIndex + 1, totalRef.current - 1);
    onAyahChange(nextIdx);
    loadAndPlay(nextIdx, reciterId);
  }, [currentAyahIndex, reciterId, loadAndPlay, onAyahChange]);

  const prev = useCallback(() => {
    const prevIdx = Math.max(currentAyahIndex - 1, 0);
    onAyahChange(prevIdx);
    loadAndPlay(prevIdx, reciterId);
  }, [currentAyahIndex, reciterId, loadAndPlay, onAyahChange]);

  const seekTo = useCallback((ratio: number) => {
    if (audioRef.current && audioRef.current.duration > 0) {
      audioRef.current.currentTime = ratio * audioRef.current.duration;
    }
  }, []);

  const playAyah = useCallback((ayahIndex: number) => {
    onAyahChange(ayahIndex);
    loadAndPlay(ayahIndex, reciterId);
  }, [reciterId, loadAndPlay, onAyahChange]);

  const changeReciter = useCallback((id: ReciterId) => {
    setReciterId(id);
    if (playbackState === "playing" || playbackState === "loading") {
      loadAndPlay(currentAyahIndex, id);
    }
  }, [playbackState, currentAyahIndex, loadAndPlay]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => prev === "none" ? "all" : prev === "all" ? "one" : "none");
  }, []);

  return {
    reciterId,
    currentAyahIndex,
    playbackState,
    progress,
    duration,
    currentTime,
    repeatMode,
    autoScroll,
    play,
    pause,
    next,
    prev,
    seekTo,
    playAyah,
    changeReciter,
    toggleRepeat,
    setAutoScroll,
  };
}
