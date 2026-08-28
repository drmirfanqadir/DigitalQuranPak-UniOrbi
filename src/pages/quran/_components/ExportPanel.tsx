import { useState, useRef } from "react";
import { Download, FileText, Share2, X } from "lucide-react";
import { toast } from "sonner";
import type { Ayah } from "@/lib/quran-api.ts";

interface ExportPanelProps {
  ayah: Ayah;
  surahNumber: number;
  surahEnglishName: string;
  arabicText: string;
  translation1: string;
  translation1Label: string;
  onClose: () => void;
}

export default function ExportPanel({
  ayah,
  surahNumber,
  surahEnglishName,
  arabicText,
  translation1,
  translation1Label,
  onClose,
}: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const exportAsText = () => {
    const text = `${arabicText}\n\n${translation1}\n\n\u2014 ${surahEnglishName} ${surahNumber}:${ayah.numberInSurah}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quran-${surahNumber}-${ayah.numberInSurah}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded!");
    onClose();
  };

  const exportAsImage = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `quran-${surahNumber}-${ayah.numberInSurah}.png`;
      a.click();
      toast.success("Image exported!");
      onClose();
    } catch {
      toast.error("Failed to export image");
    } finally {
      setExporting(false);
    }
  };

  const shareVerse = async () => {
    const text = `${arabicText}\n\n${translation1}\n\n\u2014 ${surahEnglishName} ${surahNumber}:${ayah.numberInSurah}`;
    if (navigator.share) {
      await navigator.share({ text, title: `Quran ${surahNumber}:${ayah.numberInSurah}` });
    } else {
      void navigator.clipboard.writeText(text);
      toast.success("Copied for sharing!");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
        onClick={e => e.stopPropagation()}
      >
        <div ref={cardRef} className="p-6"
          style={{ background: "linear-gradient(135deg, #ecfdf5, #e0f2fe, #faf5ff)" }}>
          <div className="font-arabic text-2xl text-right text-slate-800 leading-loose mb-4 pb-4 border-b border-slate-200" dir="rtl">
            {arabicText}
            <span className="mx-2 text-sm text-emerald-600"> ︰{ayah.numberInSurah}︱</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">{translation1Label}</p>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">{translation1}</p>
          <p className="text-xs text-right text-slate-500 font-medium">
            — {surahEnglishName} {surahNumber}:{ayah.numberInSurah}
          </p>
        </div>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Export as</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => void exportAsImage()} disabled={exporting}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
              <Download className="w-4 h-4" />
              Image
            </button>
            <button onClick={exportAsText}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              <FileText className="w-4 h-4" />
              Text
            </button>
            <button onClick={() => void shareVerse()}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
