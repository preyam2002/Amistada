"use client";

import { useRef } from "react";
import { Download, Share2 } from "lucide-react";

interface SoulCardProps {
  displayName: string;
  persona: string[];
  interests: string[];
  avatarColor?: string;
}

export function SoulCard({
  displayName,
  persona,
  interests,
  avatarColor = "bg-gradient-to-br from-[#A78BFA] to-[#FB7185]",
}: SoulCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    // In a real app, we'd use html2canvas or similar
    alert("Download feature coming soon! (Requires html2canvas)");
  };

  const primaryPersona = persona[0] || "Mystery";
  const secondaryPersona = persona[1];

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className="relative w-80 h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-[#0B1020] border border-[#A78BFA]/20 group hover:border-[#A78BFA]/50 transition-all duration-500"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F2937]/50 to-[#050814] z-0" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A78BFA]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FB7185]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center p-8 text-center">
          {/* Header */}
          <div className="mt-4 mb-2">
            <h3 className="text-[#A78BFA] text-sm uppercase tracking-widest font-medium">
              Amistala Soul Card
            </h3>
          </div>

          {/* Avatar / Visual */}
          <div className="my-6 relative">
            <div className={`w-32 h-32 rounded-full ${avatarColor} p-1`}>
              <div className="w-full h-full rounded-full bg-[#0B1020] flex items-center justify-center border-4 border-transparent">
                <span className="text-4xl font-bold text-white">
                  {displayName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#FB7185] text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              Level 1
            </div>
          </div>

          {/* Name & Archetype */}
          <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-[#A78BFA]/20 text-[#A78BFA] text-sm font-medium border border-[#A78BFA]/30">
              &quot;{primaryPersona}&quot;
            </span>
            {secondaryPersona && (
              <span className="px-3 py-1 rounded-full bg-[#FB7185]/20 text-[#FB7185] text-sm font-medium border border-[#FB7185]/30">
                {secondaryPersona}
              </span>
            )}
          </div>

          {/* Interests */}
          <div className="w-full space-y-3">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A78BFA]/30 to-transparent" />
            <p className="text-[#9CA3AF] text-sm italic">
              &quot;Vibes with...&quot;
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {interests.slice(0, 5).map((interest, i) => (
                <span
                  key={i}
                  className="text-xs text-[#E5E7EB] bg-[#1F2937] px-2 py-1 rounded-md border border-[#374151]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6">
            <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">
              amistala.com
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-[#A78BFA] hover:bg-[#A78BFA]/90 text-white rounded-xl transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Save Image
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] rounded-xl transition-colors text-sm font-medium">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
