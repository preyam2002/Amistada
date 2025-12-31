import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RoomPageClient from "./page-client";

export default async function RoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = params;
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

  return (
    <RoomPageClient
      roomId={roomId}
      initialMessages={messages || []}
      currentUserId={currentUserId}
      roomName={room.name}
      isAiRoom={room.is_main_ai_room}
    />
  );
}
