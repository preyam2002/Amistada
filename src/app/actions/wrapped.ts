"use server";

import { createClient } from "@/lib/supabase/server";
import { generateWrappedAnalysis, WrappedAnalysis } from "@/lib/ai";

export type WrappedStats = {
  totalMessages: number;
  totalWords: number;
  topEmoji: string;
  analysis: WrappedAnalysis;
};

export async function getWrappedStats(): Promise<{
  stats?: WrappedStats;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch user's messages (limit to last 200 for analysis, but count all for total)
  const { data: messages, error } = await supabase
    .from("messages")
    .select("content")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !messages || messages.length < 5) {
    return { error: "Not enough messages for a Wrapped yet!" };
  }

  const totalMessages = messages.length;
  const allContent = messages.map((m) => m.content).join(" ");
  const totalWords = allContent.split(/\s+/).length;

  // Simple emoji extraction (very basic regex)
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const emojis = allContent.match(emojiRegex) || [];

  const emojiCounts: Record<string, number> = {};
  let topEmoji = "None";
  let maxCount = 0;

  for (const emoji of emojis) {
    emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    if (emojiCounts[emoji] > maxCount) {
      maxCount = emojiCounts[emoji];
      topEmoji = emoji;
    }
  }

  // AI Analysis on a subset
  const analysisMessages = messages.slice(0, 50).map((m) => m.content);
  const analysis = await generateWrappedAnalysis(analysisMessages);

  return {
    stats: {
      totalMessages,
      totalWords,
      topEmoji,
      analysis,
    },
  };
}
