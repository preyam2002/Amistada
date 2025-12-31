"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { IntroduceButton } from "./IntroduceButton";

type SidebarProps = {
  rooms: {
    id: string;
    name: string;
    is_main_ai_room: boolean;
  }[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

export default function SidebarClient({
  rooms,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
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
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="md:hidden absolute top-4 right-4 text-[#9CA3AF] hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="p-4 border-b border-[#A78BFA]/10">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#A78BFA] to-[#FB7185] mb-4">
          Amistala
        </h1>
        <IntroduceButton />
        <Link
          href="/profile"
          className="mt-3 block text-center text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          View Profile
        </Link>
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
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  room.is_main_ai_room
                    ? "bg-gradient-to-br from-[#A78BFA] to-[#FB7185]"
                    : "bg-[#1F2937]"
                }`}
              >
                {room.is_main_ai_room ? (
                  <span className="text-white font-bold">AI</span>
                ) : (
                  <span className="text-[#9CA3AF] font-medium">
                    {room.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
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
      </div>

      <div className="p-4 border-t border-[#A78BFA]/10">
        <form action={logout}>
          <button className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#FB7185] transition-colors text-sm w-full px-2 py-1">
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
