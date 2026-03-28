"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type TypingUser = {
  userId: string;
  displayName: string;
};

export function useTypingIndicator(
  roomId: string,
  currentUserId: string,
  currentDisplayName: string
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`typing:${roomId}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ userId: string; displayName: string; isTyping: boolean }>();
        const typing: TypingUser[] = [];
        for (const [, presences] of Object.entries(state)) {
          for (const p of presences) {
            if (p.userId !== currentUserId && p.isTyping) {
              typing.push({ userId: p.userId, displayName: p.displayName });
            }
          }
        }
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId: currentUserId,
            displayName: currentDisplayName,
            isTyping: false,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [roomId, currentUserId, currentDisplayName, supabase]);

  const startTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    channelRef.current?.track({
      userId: currentUserId,
      displayName: currentDisplayName,
      isTyping: true,
    });

    // Auto-stop after 3 seconds of no typing
    timeoutRef.current = setTimeout(() => {
      channelRef.current?.track({
        userId: currentUserId,
        displayName: currentDisplayName,
        isTyping: false,
      });
    }, 3000);
  }, [currentUserId, currentDisplayName]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    channelRef.current?.track({
      userId: currentUserId,
      displayName: currentDisplayName,
      isTyping: false,
    });
  }, [currentUserId, currentDisplayName]);

  return { typingUsers, startTyping, stopTyping };
}
