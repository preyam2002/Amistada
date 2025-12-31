"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureUserOnboarding } from "@/lib/onboarding";
import { redirect } from "next/navigation";
import * as fs from "fs";
import * as path from "path";

function log(msg: string) {
  fs.appendFileSync(
    path.join(process.cwd(), "debug.log"),
    `${new Date().toISOString()} - ${msg}\n`
  );
}

export async function introduceUser(_query?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  log("Starting introduceUser");

  // Ensure profile + main AI room exist
  await ensureUserOnboarding(
    supabase,
    user.id,
    user.email || "",
    user.user_metadata?.full_name || user.user_metadata?.name
  );

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("created_by", user.id)
    .eq("is_main_ai_room", true)
    .single();

  if (room?.id) {
    redirect(`/rooms/${room.id}`);
  }

  redirect("/rooms");
}
