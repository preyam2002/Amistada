"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureUserOnboarding } from "@/lib/onboarding";
import { generateAIResponse } from "@/lib/ai";
import { redirect } from "next/navigation";

export async function findAndCreateMatch(query?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure profile + main AI room exist
  await ensureUserOnboarding(
    supabase,
    user.id,
    user.email || "",
    user.user_metadata?.full_name || user.user_metadata?.name
  );

  // Get user's current embedding
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("display_name, interests, embedding, persona, looking_for")
    .eq("id", user.id)
    .single();

  if (!userProfile?.embedding) {
    // Redirect to AI room to chat more and build profile
    const { data: aiRoom } = await supabase
      .from("rooms")
      .select("id")
      .eq("created_by", user.id)
      .eq("is_main_ai_room", true)
      .single();
    
    if (aiRoom?.id) {
      redirect(`/rooms/${aiRoom.id}`);
    }
    redirect("/rooms");
  }

  // Search for matching users using embedding similarity
  const { data: similarUsers, error: matchError } = await supabase.rpc("match_profiles", {
    query_embedding: userProfile.embedding,
    match_threshold: 0.4, // Lower threshold for better matches
    match_count: 10,
    exclude_user_id: user.id,
  });

  if (matchError) {
    return { error: "Failed to find matches. Please try again." };
  }

  if (!similarUsers || similarUsers.length === 0) {
    return { error: "no_match" };
  }

  // Filter out users we already have rooms with
  const { data: existingRoomMembers } = await supabase
    .from("room_members")
    .select("room_id, user_id")
    .eq("user_id", user.id);

  const existingRoomIds = existingRoomMembers?.map((rm) => rm.room_id) || [];
  
  // Get rooms that are not archived and have more than one member (excluding AI rooms)
  const { data: existingRooms } = await supabase
    .from("rooms")
    .select("id, room_members!inner(user_id)")
    .in("id", existingRoomIds)
    .not("is_main_ai_room", "is", true)
    .not("archived", "is", true);

  // Get all users we've already been matched with
  const alreadyMatchedUserIds = new Set<string>();
  existingRooms?.forEach((room) => {
    room.room_members?.forEach((rm: { user_id: string }) => {
      if (rm.user_id !== user.id) {
        alreadyMatchedUserIds.add(rm.user_id);
      }
    });
  });

  // Find a user we haven't matched with yet
  const availableMatch = similarUsers.find((u: { id: string }) => !alreadyMatchedUserIds.has(u.id));

  if (!availableMatch) {
    return { error: "no_new_matches" };
  }

  // Get the match user's profile
  const { data: matchProfile } = await supabase
    .from("profiles")
    .select("display_name, interests, persona, looking_for")
    .eq("id", availableMatch.id)
    .single();

  if (!matchProfile) {
    return { error: "Match profile not found. Please try again." };
  }

  // Create a new room for the match
  const { data: newRoom, error: roomError } = await supabase
    .from("rooms")
    .insert({
      name: "Match",
      type: "INTRO_GROUP",
      created_by: user.id,
    })
    .select()
    .single();

  if (roomError) {
    return { error: "Failed to create match room. Please try again." };
  }

  // Add both users to the room
  const { error: memberError1 } = await supabase
    .from("room_members")
    .insert({
      room_id: newRoom.id,
      user_id: user.id,
    });

  if (memberError1) {
    return { error: "Failed to join room. Please try again." };
  }

  const { error: memberError2 } = await supabase
    .from("room_members")
    .insert({
      room_id: newRoom.id,
      user_id: availableMatch.id,
    });

  if (memberError2) {
    return { error: "Failed to add match to room. Please try again." };
  }

  // Generate AI introduction message
  const usersInfo = [
    { id: user.id, display_name: userProfile.display_name || "You" },
    { id: availableMatch.id, display_name: matchProfile.display_name || "Match" },
  ];

  // Fetch some chat history for context
  const { data: user1Chats } = await supabase
    .from("messages")
    .select("content")
    .eq("sender_id", user.id)
    .limit(5);

  const { data: user2Chats } = await supabase
    .from("messages")
    .select("content")
    .eq("sender_id", availableMatch.id)
    .limit(5);

  const introMessage = await generateAIResponse({
    roomType: "intro_room",
    usersInfo,
    user1Chats: user1Chats?.map((m) => m.content) || [],
    user2Chats: user2Chats?.map((m) => m.content) || [],
  });

  // Send the introduction message
  await supabase.from("messages").insert({
    room_id: newRoom.id,
    content: introMessage,
    is_ai: true,
  });

  // Create progressive reveal entry
  await supabase.from("profile_reveals").insert({
    owner_id: user.id,
    viewer_id: availableMatch.id,
    level: 0,
  });

  await supabase.from("profile_reveals").insert({
    owner_id: availableMatch.id,
    viewer_id: user.id,
    level: 0,
  });

  // Redirect to the new room
  redirect(`/rooms/${newRoom.id}`);
}
