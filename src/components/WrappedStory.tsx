"use client";

import { useState, useRef } from "react";
import { X, Share2, Loader2, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { WrappedStats } from "@/app/actions/wrapped";

type WrappedStoryProps = {
  stats: WrappedStats;
  onClose: () => void;
};

export function WrappedStory({ stats, onClose }: WrappedStoryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const totalSlides = 5;
  const cardRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide((p) => p + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide((p) => p - 1);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `amistada-wrapped-${new Date().getFullYear()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
      alert("Failed to download image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Amistala Wrapped",
          text: `I chatted ${stats.totalMessages} times on Amistala! My vibe is ${stats.analysis.vibe}.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  // Auto-advance (optional, maybe annoying for reading stats, let's keep it manual for now)

  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#FB7185]">
              Your Amistada
              <br />
              Wrapped
            </h1>
            <p className="text-xl text-white/80">
              Here&apos;s what we noticed about your vibe... <br /> Let&apos;s
              see how you connected.
            </p>
            <div className="text-6xl">🎁</div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              The Numbers
            </h2>

            <div className="space-y-2">
              <div className="text-6xl font-bold text-[#A78BFA]">
                {stats.totalMessages}
              </div>
              <div className="text-sm text-white/60 uppercase tracking-wider">
                Messages Sent
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-6xl font-bold text-[#FB7185]">
                {stats.totalWords}
              </div>
              <div className="text-sm text-white/60 uppercase tracking-wider">
                Words Typed
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-6xl">{stats.topEmoji}</div>
              <div className="text-sm text-white/60 uppercase tracking-wider">
                Top Emoji
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              Your Vibe
            </h2>

            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] to-[#60A5FA]">
              {stats.analysis.persona}
            </div>

            <p className="text-lg text-white/90 italic px-4">
              &quot;{stats.analysis.vibe}&quot;
            </p>

            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 uppercase mb-1">
                Communication Style
              </div>
              <div className="text-xl font-medium text-white">
                &quot;{stats.analysis.communication_style}&quot;
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              Top Topics
            </h2>

            <div className="flex flex-wrap justify-center gap-3 content-center max-w-xs">
              {stats.analysis.top_topics.map((topic, i) => (
                <span
                  key={i}
                  className={`px-4 py-2 rounded-full text-white font-medium border border-white/20
                    ${i === 0 ? "bg-[#A78BFA]/20 text-xl" : ""}
                    ${i === 1 ? "bg-[#FB7185]/20 text-lg" : ""}
                    ${i > 1 ? "bg-white/5 text-base" : ""}
                  `}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in-up">
            <div className="text-sm text-white/50 uppercase tracking-widest mb-4">
              Summary
            </div>

            <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md w-full max-w-xs space-y-4">
              <div className="text-xl font-medium text-white">
                &quot;{stats.analysis.persona}&quot;
              </div>
              <div className="h-px bg-white/20 w-full"></div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <div className="text-xs text-white/50">Messages</div>
                  <div className="text-xl font-bold text-white">
                    {stats.totalMessages}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Vibe</div>
                  <div className="text-xl font-bold text-white">
                    {stats.topEmoji}
                  </div>
                </div>
              </div>
              <div className="text-sm text-white/80 italic">
                &quot;{stats.analysis.vibe}&quot;
              </div>
              <div className="text-[10px] text-white/40 text-center pt-2">
                amistada.app/wrapped
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
              >
                {downloading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                Save Image
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white z-20"
      >
        <X size={32} />
      </button>

      {/* Story Container */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md h-full sm:h-[80vh] sm:rounded-3xl overflow-hidden bg-[#111827] flex flex-col"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex gap-1">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  i < currentSlide
                    ? "w-full"
                    : i === currentSlide
                    ? "w-full"
                    : "w-0"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#A78BFA]/20 via-[#0B1020] to-[#0B1020]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#FB7185]/10 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex-1 p-8 flex flex-col">
          {renderSlideContent()}
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 z-0 flex">
          <div className="flex-1" onClick={prevSlide}></div>
          <div className="flex-1" onClick={nextSlide}></div>
        </div>
      </div>
    </div>
  );
}
