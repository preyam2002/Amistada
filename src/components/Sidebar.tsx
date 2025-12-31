"use client";

import SidebarClient from "./SidebarClient";

type Room = {
  id: string;
  name: string;
  is_main_ai_room: boolean;
  [key: string]: unknown;
};

type SidebarProps = {
  rooms: Room[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

export default function Sidebar({
  rooms,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  return (
    <SidebarClient
      rooms={rooms}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    />
  );
}
