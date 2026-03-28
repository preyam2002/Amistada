"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function unarchiveRoom(roomId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Unarchive the room membership
  await supabase
    .from("room_members")
    .update({ is_archived: false, left_at: null })
    .eq("room_id", roomId)
    .eq("user_id", user.id);

  // Unarchive the room itself if it was archived
  await supabase
    .from("rooms")
    .update({ archived: false })
    .eq("id", roomId);

  revalidatePath("/rooms");
  return { success: true };
}

export async function createTopicRoom(topic: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  if (!topic.trim() || topic.length > 100) {
    return { error: "Topic must be 1-100 characters." };
  }

  const { data: newRoom, error } = await supabase
    .from("rooms")
    .insert({
      name: topic.trim(),
      type: "INTRO_GROUP",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("room_members").insert({
    room_id: newRoom.id,
    user_id: user.id,
  });

  // Welcome message
  await supabase.from("messages").insert({
    room_id: newRoom.id,
    content: `Welcome to **${topic.trim()}**! This room was created for discussion. Invite others or start chatting.`,
    is_ai: true,
  });

  revalidatePath("/rooms");
  return { success: true, roomId: newRoom.id };
}
