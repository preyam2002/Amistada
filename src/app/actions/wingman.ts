"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai";

export async function checkAndFacilitateRoom(roomId: string) {
  const supabase = await createClient();

  // 1. Get last message
  const { data: lastMessages } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(1);

  const lastMessage = lastMessages?.[0];

  if (!lastMessage) return; // Empty room, maybe don't intervene yet

  // 2. Check if stalled (e.g., > 30 minutes for demo purposes, usually 24h)
  const lastMsgTime = new Date(lastMessage.created_at).getTime();
  const now = new Date().getTime();
  const diffInMinutes = (now - lastMsgTime) / (1000 * 60);

  if (diffInMinutes < 30) {
    return { status: "active" };
  }

  // 3. Check if last message was AI
  if (lastMessage.is_ai) {
    return { status: "waiting_for_human" };
  }

  // 4. Get room members to know who we are talking to
  const { data: members } = await supabase
    .from("room_members")
    .select("user_id, profiles(display_name, interests)")
    .eq("room_id", roomId);

  if (!members || members.length < 2) return;

  const usersInfo = members.map((m) => {
    const profiles = m.profiles as
      | { display_name?: string; interests?: string[] }
      | { display_name?: string; interests?: string[] }[]
      | null;
    const displayName = Array.isArray(profiles)
      ? profiles[0]?.display_name || "User"
      : profiles?.display_name || "User";
    return {
      id: m.user_id,
      display_name: displayName,
    };
  });

  // 5. Get recent context
  const { data: recentMessages } = await supabase
    .from("messages")
    .select("content, is_ai, profiles(id, display_name)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(10);

  const contextMessages = recentMessages?.reverse().map((m) => {
    return {
      content: m.content,
      is_ai: m.is_ai,
      sender_id: m.profiles
        ? Array.isArray(m.profiles)
          ? (m.profiles[0] as { id: string })?.id
          : (m.profiles as { id: string }).id
        : undefined,
    };
  });

  const aiMessage = await generateAIResponse({
    roomType: "intro_room", // It acts as a host
    usersInfo: usersInfo,
    messages:
      (contextMessages as {
        content: string;
        sender_id: string | undefined;
        is_ai: boolean;
      }[]) || [],
  });

  // 7. Send message
  await supabase.from("messages").insert({
    room_id: roomId,
    content: aiMessage,
    is_ai: true,
  });

  return { status: "intervened", message: aiMessage };
}
