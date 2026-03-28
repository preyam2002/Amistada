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
  archivedRooms?: Room[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

export default function Sidebar({
  rooms,
  archivedRooms = [],
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  return (
    <SidebarClient
      rooms={rooms}
      archivedRooms={archivedRooms}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    />
  );
}
