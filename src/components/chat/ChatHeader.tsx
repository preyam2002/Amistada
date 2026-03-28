"use client";

import {
  MoreVertical,
  Sparkles,
  Gift,
  Flame,
  Menu,
  Copy,
  Download,
} from "lucide-react";

type ChatHeaderProps = {
  roomName: string;
  isAiRoom: boolean;
  online: boolean;
  currentUserId: string;
  members: { id: string; display_name: string; avatar_color: string }[];
  onMenuClick?: () => void;
  loadingCompatibility: boolean;
  loadingWrapped: boolean;
  loadingRoast: boolean;
  loadingSummary: boolean;
  useRelativeTime: boolean;
  copyingRoom: boolean;
  onToggleTime: () => void;
  onCopyRoomLink: () => void;
  onExportChat: () => void;
  onTriggerWrapped: () => void;
  onTriggerRoast: () => void;
  onCheckCompatibility: () => void;
  onExplainMatch: () => void;
  onCatchUp: () => void;
};

export function ChatHeader({
  roomName,
  isAiRoom,
  online,
  currentUserId,
  members,
  onMenuClick,
  loadingCompatibility,
  loadingWrapped,
  loadingRoast,
  loadingSummary,
  useRelativeTime,
  copyingRoom,
  onToggleTime,
  onCopyRoomLink,
  onExportChat,
  onTriggerWrapped,
  onTriggerRoast,
  onCheckCompatibility,
  onExplainMatch,
  onCatchUp,
}: ChatHeaderProps) {
  return (
    <div className="h-16 border-b border-[#A78BFA]/10 flex items-center justify-between px-4 sm:px-6 bg-[#0B1020]/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden text-[#9CA3AF] hover:text-white transition-colors p-2"
          >
            <Menu size={24} />
          </button>
        )}

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAiRoom
              ? "bg-gradient-to-br from-[#A78BFA] to-[#FB7185]"
              : "bg-[#1F2937]"
          }`}
        >
          {isAiRoom ? (
            <span className="text-white font-bold">AI</span>
          ) : (
            <span className="text-[#9CA3AF] font-medium">
              {roomName.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-medium text-[#F9FAFB]">{roomName}</h2>
          <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                online ? "bg-green-500" : "bg-[#FBBF24]"
              }`}
            ></span>
            {!isAiRoom && members && members.length > 0
              ? members
                  .filter((m) => m.id !== currentUserId)
                  .map((m) => m.display_name)
                  .join(", ")
              : online
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTime}
          className="text-[#9CA3AF] hover:text-white transition-colors p-2 rounded-full hover:bg-[#1F2937]"
          title={useRelativeTime ? "Show exact time" : "Show relative time"}
        >
          🕒
        </button>
        <button
          onClick={onCopyRoomLink}
          disabled={copyingRoom}
          className="text-[#9CA3AF] hover:text-white transition-colors p-2 rounded-full hover:bg-[#1F2937]"
          title="Copy room link"
        >
          <Copy size={16} className={copyingRoom ? "animate-pulse" : ""} />
        </button>
        <button
          onClick={onExportChat}
          className="text-[#9CA3AF] hover:text-white transition-colors p-2 rounded-full hover:bg-[#1F2937]"
          title="Export chat (.txt)"
        >
          <Download size={16} />
        </button>
        <button
          onClick={onTriggerWrapped}
          disabled={loadingWrapped}
          className="text-[#FB7185] hover:text-white transition-colors p-2 rounded-full hover:bg-[#FB7185]/10"
          title="My Wrapped"
        >
          <Gift size={20} className={loadingWrapped ? "animate-spin" : ""} />
        </button>
        <button
          onClick={onTriggerRoast}
          disabled={loadingRoast}
          className="text-[#FF6B35] hover:text-white transition-colors p-2 rounded-full hover:bg-[#FF6B35]/10"
          title="Roast Me 🔥"
        >
          <Flame size={20} className={loadingRoast ? "animate-spin" : ""} />
        </button>

        {!isAiRoom && (
          <>
            <button
              onClick={onCheckCompatibility}
              disabled={loadingCompatibility}
              className="text-[#A78BFA] hover:text-white transition-colors p-2 rounded-full hover:bg-[#A78BFA]/10"
              title="Check Compatibility"
            >
              <Sparkles
                size={20}
                className={loadingCompatibility ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={onExplainMatch}
              className="text-[#FBBF24] hover:text-white transition-colors p-2 rounded-full hover:bg-[#FBBF24]/10"
              title="Why did we match? (Gold Feature)"
            >
              <span className="font-bold text-xs">WHY?</span>
            </button>
          </>
        )}
        <button
          onClick={onCatchUp}
          disabled={loadingSummary}
          className="text-xs font-medium bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 text-[#A78BFA] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          {loadingSummary ? (
            <span className="animate-spin">✨</span>
          ) : (
            <span>✨ Catch Up</span>
          )}
        </button>
        <button className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}
