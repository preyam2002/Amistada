"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendGift(
  roomId: string,
  giftId: string,
  receiverId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // 1. Record transaction
  const { error } = await supabase.from("transactions").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    type: "gift",
    item_id: giftId,
    amount: 50, // Mock amount
  });

  if (error) return { error: "Failed to send gift" };

  // 2. Send message to chat
  const giftName = giftId === "coffee" ? "☕ Coffee" : "🎁 Gift";
  await supabase.from("messages").insert({
    room_id: roomId,
    content: `**${user.email?.split("@")[0]}** sent a ${giftName}!`,
    is_ai: true, // System message style
  });

  // 3. Award reputation (optional)
  const { giveKudos } = await import("@/lib/db/queries");
  await giveKudos(user.id, receiverId); // Sending a gift counts as kudos too?

  return { success: true };
}

export async function explainMatch(roomId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Check if user has "Gold" or pay 100 credits
  // For MVP, just allow it but record it
  await supabase.from("transactions").insert({
    sender_id: user.id,
    type: "feature_usage",
    item_id: "explain_match",
    amount: 100,
  });

  // Fetch profiles
  const { data: members } = await supabase
    .from("room_members")
    .select("user_id, profiles(*)")
    .eq("room_id", roomId);

  const user1 = members?.find((m) => m.user_id === user.id)?.profiles;
  const user2 = members?.find((m) => m.user_id !== user.id)?.profiles;

  if (!user1 || !user2) return { error: "Could not find profiles" };

  // Generate explanation
  const prompt = `
    Analyze the compatibility between these two users based on their profiles:
    User 1: ${JSON.stringify(user1)}
    User 2: ${JSON.stringify(user2)}
    
    Explain why they were matched in 3 fun, insightful bullet points.
  `;

  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a relationship expert AI. Be fun, brief, and insightful.",
      },
      { role: "user", content: prompt },
    ],
  });

  return { explanation: response.choices[0].message.content };
}
