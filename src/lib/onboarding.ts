import { SupabaseClient } from "@supabase/supabase-js";
import { generateAIResponse } from "@/lib/ai";

export async function ensureUserOnboarding(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  displayName?: string
) {
  // 1. Ensure Profile Exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    const name = displayName || userEmail.split("@")[0];
    await supabase.from("profiles").insert({
      id: userId,
      display_name: name,
      avatar_color: "bg-gradient-to-br from-[#A78BFA] to-[#FB7185]",
    });
  }

  // 2. Ensure AI Room Exists
  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("*")
    .eq("created_by", userId)
    .eq("is_main_ai_room", true)
    .single();

  if (!existingRoom) {
    // Create Room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        type: "AI_DM",
        name: "Amistala",
        is_main_ai_room: true,
        created_by: userId,
      })
      .select()
      .single();

    if (room && !roomError) {
      // Add Member
      await supabase.from("room_members").insert({
        room_id: room.id,
        user_id: userId,
      });

      // Generate AI Welcome
      const aiMsg = await generateAIResponse({ roomType: "main_ai" });

      // Send Message
      await supabase.from("messages").insert({
        room_id: room.id,
        content: aiMsg,
        is_ai: true,
      });
    }
  }
}
