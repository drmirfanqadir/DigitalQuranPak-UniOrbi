import { useState } from "react";
import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface JumpToVerseProps {
  surahNumber: number;
  totalAyahs: number;
  onJump: (ayahNumber: number) => void;
}

export default function JumpToVerse({ surahNumber, totalAyahs, onJump }: JumpToVerseProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleJump = () => {
    const parts = input.trim().split(":");
    let ayah: number;
    if (parts.length === 2) {
      const s = parseInt(parts[0]);
      const a = parseInt(parts[1]);
      if (s !== surahNumber) {
        setInput("");
        setOpen(false);
        return;
      }
      ayah = a;
    } else {
      ayah = parseInt(parts[0]);
    }
    if (!isNaN(ayah) && ayah >= 1 && ayah <= totalAyahs) {
      onJump(ayah);
      const el = document.getElementById(`verse-${surahNumber}:${ayah}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setInput("");
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
          open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
        )}
      >
        <Navigation className="w-3.5 h-3.5" />
        Jump to
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 flex items-center gap-1 p-1 rounded-xl shadow-xl"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(100,220,160,0.25)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <input
            autoFocus
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleJump()}
            placeholder={`Ayah (1-${totalAyahs})`}
            className="w-32 px-2 py-1 text-xs rounded-lg bg-muted/60 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={handleJump}
            className="px-2 py-1 rounded-lg text-xs text-white"
            style={{ background: "linear-gradient(135deg, #22c55e, #0ea5e9)" }}
          >
            Go
          </button>
        </div>
      )}
    </div>
  );
}
