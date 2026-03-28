"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, X, Archive, ChevronDown, ChevronRight, Settings } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { IntroduceButton } from "./IntroduceButton";
import { Button } from "@/components/ui";
import { Avatar } from "@/components/ui";

type Room = {
  id: string;
  name: string;
  is_main_ai_room: boolean;
};

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
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className="block p-3 rounded-xl hover:bg-[#A78BFA]/5 transition-colors group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-3">
              <Avatar
                name={room.is_main_ai_room ? "AI" : room.name}
                variant={room.is_main_ai_room ? "gradient" : "default"}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[#F9FAFB] font-medium truncate text-sm">
                    {room.name}
                  </h3>
                </div>
                <p className="text-[#9CA3AF] text-xs truncate group-hover:text-[#D1D5DB]">
                  {room.is_main_ai_room
                    ? "Your personal AI companion"
                    : "Group chat"}
                </p>
              </div>
            </div>
          </Link>
        ))}

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
                  <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="block p-2 pl-8 rounded-xl hover:bg-[#A78BFA]/5 transition-colors group opacity-60 hover:opacity-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={room.name}
                        variant="default"
                        size="sm"
                      />
                      <span className="text-[#9CA3AF] text-xs truncate group-hover:text-[#D1D5DB]">
                        {room.name}
                      </span>
                    </div>
                  </Link>
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
