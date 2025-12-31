"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Set next event to next Friday at 8 PM
    const calculateNextEvent = () => {
      const now = new Date();
      const nextFriday = new Date();
      nextFriday.setDate(now.getDate() + ((7 - now.getDay() + 5) % 7 || 7));
      nextFriday.setHours(20, 0, 0, 0);

      if (nextFriday < now) {
        nextFriday.setDate(nextFriday.getDate() + 7);
      }

      const diff = nextFriday.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateNextEvent();
    const timer = setInterval(calculateNextEvent, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#A78BFA]/10 to-[#FB7185]/10 border border-[#A78BFA]/20 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#A78BFA]/20 flex items-center justify-center text-[#A78BFA]">
          <Clock size={20} />
        </div>
        <div>
          <h3 className="text-white font-medium text-sm">
            Next Blind Date Event
          </h3>
          <p className="text-[#9CA3AF] text-xs">Friday Night Live</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[#FB7185] font-bold font-mono text-lg">
          {timeLeft}
        </span>
      </div>
    </div>
  );
}
