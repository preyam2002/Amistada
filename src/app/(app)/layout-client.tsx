"use client";

import { createContext, useContext, useState } from "react";
import Sidebar from "@/components/Sidebar";

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

export default function AppLayoutClient({
  rooms,
  children,
}: {
  rooms: {
    id: string;
    name: string;
    is_main_ai_room: boolean;
    [key: string]: unknown;
  }[];
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      <div className="flex h-screen bg-[#050814] overflow-hidden">
        <Sidebar
          rooms={rooms}
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
    </LayoutContext.Provider>
  );
}
