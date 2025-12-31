"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Download, X, Loader2 } from "lucide-react";

type CompatibilityReport = {
  score: number;
  summary: string;
  reason: string;
  shared_interests: string[];
};

type CompatibilityCardProps = {
  report: CompatibilityReport;
  onClose: () => void;
  roomName: string;
};

export function CompatibilityCard({
  report,
  onClose,
  roomName,
}: CompatibilityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `amistada-compatibility-${roomName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* The Card Itself */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#A78BFA]/20 rounded-3xl p-8 shadow-2xl overflow-hidden relative"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A78BFA]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FB7185]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 text-center space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] text-xs font-medium tracking-wider uppercase">
              Amistada Match
            </div>

            <div className="space-y-2">
              <h2 className="text-[#9CA3AF] text-sm font-medium uppercase tracking-widest">
                Compatibility Score
              </h2>
              <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#FB7185] animate-pulse">
                {report.score}%
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                &quot;{report.summary}&quot;
              </h3>
              <p className="text-[#9CA3AF] leading-relaxed italic">
                {report.reason}
              </p>
            </div>

            {report.shared_interests.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-[#6B7280] mb-3 uppercase tracking-wider">
                  Bonding Over
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {report.shared_interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 rounded-full bg-white/5 text-[#F9FAFB] text-sm border border-white/10"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-[#6B7280]">
              <span>amistada.app</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-[#A78BFA] hover:bg-[#A78BFA]/90 text-white rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
}
