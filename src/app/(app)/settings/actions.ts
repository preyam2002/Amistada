"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function exportUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("content, created_at, is_ai, room_id")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: true });

  const { data: rooms } = await supabase
    .from("room_members")
    .select("room_id, rooms(name, type, created_at)")
    .eq("user_id", user.id);

  const { data: badges } = await supabase
    .from("user_badges")
    .select("badges(name, icon, description)")
    .eq("user_id", user.id);

  return {
    data: {
      profile,
      messages: messages || [],
      rooms: rooms || [],
      badges: badges || [],
      exportedAt: new Date().toISOString(),
    },
  };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Delete user's messages
  await supabase.from("messages").delete().eq("sender_id", user.id);

  // Delete room memberships
  await supabase.from("room_members").delete().eq("user_id", user.id);

  // Delete profile reveals
  await supabase.from("profile_reveals").delete().or(`owner_id.eq.${user.id},viewer_id.eq.${user.id}`);

  // Delete reputation
  await supabase.from("reputation_scores").delete().eq("user_id", user.id);
  await supabase.from("reputation_events").delete().or(`giver_id.eq.${user.id},receiver_id.eq.${user.id}`);

  // Delete badges
  await supabase.from("user_badges").delete().eq("user_id", user.id);

  // Delete transactions
  await supabase.from("transactions").delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  // Delete profile
  await supabase.from("profiles").delete().eq("id", user.id);

  // Sign out
  await supabase.auth.signOut();

  redirect("/");
}
