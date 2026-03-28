import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get message count for stats
  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", user.id);

  // Get room count
  const { count: roomCount } = await supabase
    .from("room_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get reputation
  const { data: reputation } = await supabase
    .from("reputation_scores")
    .select("score")
    .eq("user_id", user.id)
    .single();

  return (
    <SettingsClient
      email={user.email || ""}
      displayName={profile?.display_name || ""}
      createdAt={user.created_at}
      stats={{
        messages: messageCount || 0,
        rooms: roomCount || 0,
        reputation: reputation?.score || 0,
      }}
    />
  );
}
