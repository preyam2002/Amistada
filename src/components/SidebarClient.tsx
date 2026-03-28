"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, X, Archive, ChevronDown, ChevronRight, Settings, RotateCcw, Plus } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { unarchiveRoom, createTopicRoom } from "@/app/actions/room";
import { IntroduceButton } from "./IntroduceButton";
import { Button } from "@/components/ui";
import { Avatar } from "@/components/ui";

type Room = {
  id: string;
  name: string;
  is_main_ai_room: boolean;
  last_message?: string | null;
  last_message_at?: string | null;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

type SidebarProps = {
  rooms: Room[];
  archivedRooms?: Room[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

export default function SidebarClient({
  rooms,
  archivedRooms = [],
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomTopic, setNewRoomTopic] = useState("");
  const [creating, setCreating] = useState(false);
  const [lastRead, setLastRead] = useState<Record<string, string>>({});

  // Load last-read timestamps from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("amistada-last-read");
      if (saved) setLastRead(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const hasUnread = (room: Room) => {
    if (!room.last_message_at) return false;
    const lastReadTime = lastRead[room.id];
    if (!lastReadTime) return !!room.last_message;
    return new Date(room.last_message_at) > new Date(lastReadTime);
  };

  const markRead = (roomId: string) => {
    const now = new Date().toISOString();
    const updated = { ...lastRead, [roomId]: now };
    setLastRead(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("amistada-last-read", JSON.stringify(updated));
    }
  };

  return (
    <div
      className={`
        fixed md:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }
        w-[280px] bg-[#0B1020] border-r border-[#A78BFA]/10 flex flex-col h-full
      `}
    >
      {/* Mobile close button */}
      <Button
        onClick={() => setIsMobileMenuOpen(false)}
        variant="ghost"
        size="sm"
        className="md:hidden absolute top-4 right-4"
      >
        <X size={24} />
      </Button>

      <div className="p-4 border-b border-[#A78BFA]/10">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#A78BFA] to-[#FB7185] mb-4">
          Amistala
        </h1>
        <IntroduceButton />
        <div className="mt-3 flex items-center justify-center gap-4">
          <Link
            href="/profile"
            className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors flex items-center gap-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings size={12} />
            Settings
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Create Room */}
        <div className="px-2 pb-2">
          {!showCreateRoom ? (
            <button
              onClick={() => setShowCreateRoom(true)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#A78BFA]/5 rounded-xl transition-colors"
            >
              <Plus size={14} />
              <span>Create Topic Room</span>
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-[#1F2937]/50 rounded-xl border border-[#A78BFA]/10">
              <input
                type="text"
                value={newRoomTopic}
                onChange={(e) => setNewRoomTopic(e.target.value)}
                placeholder="Room topic..."
                maxLength={100}
                className="w-full bg-[#050814] border border-[#A78BFA]/20 rounded-lg px-3 py-2 text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#A78BFA]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowCreateRoom(false);
                    setNewRoomTopic("");
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="primary"
                  disabled={!newRoomTopic.trim() || creating}
                  onClick={async () => {
                    setCreating(true);
                    const res = await createTopicRoom(newRoomTopic);
                    setCreating(false);
                    if (res.roomId) {
                      setShowCreateRoom(false);
                      setNewRoomTopic("");
                      window.location.href = `/rooms/${res.roomId}`;
                    }
                  }}
                  className="flex-1"
                >
                  {creating ? "Creating..." : "Create"}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateRoom(false);
                    setNewRoomTopic("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {rooms.map((room) => {
          const unread = hasUnread(room);
          return (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="block p-3 rounded-xl hover:bg-[#A78BFA]/5 transition-colors group"
              onClick={() => {
                markRead(room.id);
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar
                    name={room.is_main_ai_room ? "AI" : room.name}
                    variant={room.is_main_ai_room ? "gradient" : "default"}
                    size="md"
                  />
                  {unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#FB7185] rounded-full border-2 border-[#0B1020]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className={`font-medium truncate text-sm ${unread ? "text-white" : "text-[#F9FAFB]"}`}>
                      {room.name}
                    </h3>
                    {room.last_message_at && (
                      <span className={`text-[10px] flex-shrink-0 ${unread ? "text-[#FB7185]" : "text-[#6B7280]"}`}>
                        {timeAgo(room.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate group-hover:text-[#D1D5DB] ${unread ? "text-[#D1D5DB] font-medium" : "text-[#9CA3AF]"}`}>
                    {room.last_message
                      ? room.last_message.substring(0, 50)
                      : room.is_main_ai_room
                      ? "Your personal AI companion"
                      : "No messages yet"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}

        {rooms.length === 0 && (
          <div className="p-4 text-center text-[#9CA3AF] text-sm">
            No conversations yet.
          </div>
        )}

        {/* Archived Rooms */}
        {archivedRooms.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#A78BFA]/10">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              {showArchived ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Archive size={14} />
              <span>Archived ({archivedRooms.length})</span>
            </button>
            {showArchived && (
              <div className="space-y-1 mt-1">
                {archivedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center gap-2 p-2 pl-8 rounded-xl hover:bg-[#A78BFA]/5 transition-colors group opacity-60 hover:opacity-100"
                  >
                    <Link
                      href={`/rooms/${room.id}`}
                      className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Avatar name={room.name} variant="default" size="sm" />
                      <span className="text-[#9CA3AF] text-xs truncate group-hover:text-[#D1D5DB]">
                        {room.name}
                      </span>
                    </Link>
                    <button
                      onClick={async () => {
                        await unarchiveRoom(room.id);
                        window.location.reload();
                      }}
                      className="text-[#9CA3AF] hover:text-[#34D399] p-1 rounded transition-colors flex-shrink-0"
                      title="Unarchive room"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#A78BFA]/10">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[#9CA3AF] hover:text-[#FB7185]"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
