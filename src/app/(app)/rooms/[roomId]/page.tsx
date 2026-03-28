import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RoomPageClient from "./page-client";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentUserId = user.id;

  // Fetch room details
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (!room) {
    redirect("/rooms");
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*, profiles(display_name, avatar_color)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  // Fetch room members
  const { data: members } = await supabase
    .from("room_members")
    .select("user_id, profiles(display_name, avatar_color)")
    .eq("room_id", roomId)
    .is("left_at", null);

  const roomMembers = (members || []).map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return {
      id: m.user_id,
      display_name: profile?.display_name || "User",
      avatar_color: profile?.avatar_color || "",
    };
  });

  return (
    <RoomPageClient
      roomId={roomId}
      initialMessages={messages || []}
      currentUserId={currentUserId}
      roomName={room.name}
      isAiRoom={room.is_main_ai_room}
      members={roomMembers}
    />
  );
}
