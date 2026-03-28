"use client";

import { createContext, useContext, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

type LayoutContextType = {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
}

type Room = {
  id: string;
  name: string;
  is_main_ai_room: boolean;
  [key: string]: unknown;
};

export default function AppLayoutClient({
  rooms,
  archivedRooms = [],
  children,
}: {
  rooms: Room[];
  archivedRooms?: Room[];
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      <ToastProvider>
        <div className="flex h-screen bg-[#050814] overflow-hidden">
          <Sidebar
            rooms={rooms}
            archivedRooms={archivedRooms}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <main className="flex-1 flex flex-col min-w-0 relative">
            {children}
          </main>

          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </ToastProvider>
    </LayoutContext.Provider>
  );
}
