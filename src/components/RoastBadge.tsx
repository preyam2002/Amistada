"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { X, Flame, Download, Loader2 } from "lucide-react";
import { RoastData } from "@/lib/ai";

type RoastBadgeProps = {
  roast: RoastData;
  onClose: () => void;
};

export function RoastBadge({ roast, onClose }: RoastBadgeProps) {
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `amistada-roast-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setDownloading(false);
    }
  };

  const getBurnColor = (level: string) => {
    switch (level) {
      case "Mild":
        return "from-yellow-400 to-orange-500";
      case "Medium":
        return "from-orange-500 to-red-600";
      case "Scorched Earth":
        return "from-red-600 to-purple-900";
      default:
        return "from-orange-500 to-red-600";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
      <div className="relative max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>

        <div
          ref={cardRef}
          className="bg-[#111827] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
        >
          {/* Header Background */}
          <div
            className={`h-32 bg-gradient-to-br ${getBurnColor(
              roast.burnLevel
            )} flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <Flame
              size={64}
              className="text-white drop-shadow-lg animate-pulse"
            />
            <div className="absolute bottom-2 right-4 text-xs font-bold text-white/80 uppercase tracking-widest bg-black/20 px-2 py-1 rounded">
              Burn Level: {roast.burnLevel}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center space-y-6">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
                Official Roast Badge
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                {roast.roastTitle}
              </h2>
            </div>

            <p className="text-sm text-white/80 italic">
              &quot;{roast.roastDescription}&quot;
            </p>

            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/roast-badge.png"
                  alt="Roast Badge"
                  className="w-16 h-16 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <span>amistada.app/roast</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
          >
            {downloading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
            Save Badge
          </button>
        </div>
      </div>
    </div>
  );
}
