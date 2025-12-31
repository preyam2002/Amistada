"use server";

import { createClient } from "@/lib/supabase/server";
import { generateRoast, RoastData } from "@/lib/ai";

export type { RoastData };

export async function getRoast(): Promise<{
  roast?: RoastData;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: messages, error } = await supabase
    .from("messages")
    .select("content")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !messages || messages.length < 5) {
    return { error: "Not enough material to roast you yet! Chat more." };
  }

  const messageTexts = messages.map((m) => m.content);
  const roast = await generateRoast(messageTexts);

  return { roast };
}
