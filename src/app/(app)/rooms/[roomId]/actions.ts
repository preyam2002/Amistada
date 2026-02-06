"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAIResponse, type CompatibilityReport } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type { CompatibilityReport };

export async function sendMessage(
  roomId: string,
  content: string,
  mediaUrl?: string,
  mediaType?: "image" | "audio"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const userId = user.id;

  // 1. Check for slash commands (only if content is present and not just media)
  const lowerContent = content?.trim().toLowerCase() || "";

  if (lowerContent.startsWith("/ai ") || lowerContent.startsWith("/")) {
    let command = "";
    if (lowerContent.startsWith("/ai ")) {
      command = lowerContent.replace("/ai ", "").trim();
    } else {
      command = lowerContent.substring(1).trim();
    }

    // Insert user message first (so they see what they typed)
    await supabase.from("messages").insert({
      room_id: roomId,
      sender_id: userId,
      content,
      media_url: mediaUrl,
      media_type: mediaType,
    });

    let aiResponse = "";
    const isPrivate = true;

    if (command === "leave") {
      await supabase
        .from("room_members")
        .update({ left_at: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("user_id", userId);

      aiResponse =
        "You have left the room. You can find it in your archives if you wish to return.";
    } else if (command === "archive") {
      await supabase
        .from("room_members")
        .update({ is_archived: true })
        .eq("room_id", roomId)
        .eq("user_id", userId);

      aiResponse = "Room archived.";
    } else if (command === "next") {
      // Leave current room
      await supabase
        .from("room_members")
        .update({ left_at: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("user_id", userId);

      // Trigger introduceUser
      const { introduceUser } = await import("@/app/actions/introduce");
      await introduceUser(); // This will redirect
      return;
    } else if (command === "profile") {
      // Fetch profile
      const { data: members } = await supabase
        .from("room_members")
        .select("user_id")
        .eq("room_id", roomId);

      const otherUserId = members?.find((m) => m.user_id !== userId)?.user_id;

      if (otherUserId) {
        const { getProfileWithReveal, getUserBadges } = await import(
          "@/lib/db/queries"
        );
        const profile = await getProfileWithReveal(otherUserId, userId);
        const badges = await getUserBadges(otherUserId);
        const badgeStr =
          badges.length > 0
            ? badges
                .map(
                  (b: { icon: string; name: string }) => `${b.icon} ${b.name}`
                )
                .join(", ")
            : "None";

        if (profile) {
          aiResponse = `**Profile for Match:**\nName: ${
            profile.display_name
          }\nBadges: ${badgeStr}\nInterests: ${
            profile.interests?.join(", ") || "None"
          }\nPersona: ${profile.persona?.join(", ") || "None"}\nLooking For: ${
            profile.looking_for?.join(", ") || "None"
          }\nBio: ${profile.bio || "None"}`;
        } else {
          aiResponse = "Profile not found.";
        }
      } else {
        // Fallback to own profile if no match found (e.g. alone in room)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        const { getUserBadges } = await import("@/lib/db/queries");
        const badges = await getUserBadges(userId);
        const badgeStr =
          badges.length > 0
            ? badges
                .map(
                  (b: { icon: string; name: string }) => `${b.icon} ${b.name}`
                )
                .join(", ")
            : "None";

        if (profile) {
          aiResponse = `**Your Profile:**\nName: ${
            profile.display_name
          }\nBadges: ${badgeStr}\nInterests: ${
            profile.interests?.join(", ") || "None"
          }`;
        }
      }
    } else if (command.startsWith("search ")) {
      const query = command.substring(7).trim();
      if (!query) {
        aiResponse = "Please specify a search term (e.g. /search coding).";
      } else {
        const { searchUsersByTextQuery } = await import("@/lib/db/queries");
        const matches = await searchUsersByTextQuery(query, userId);

        if (matches && matches.length > 0) {
          const matchNames = matches
            .map(
              (m: { display_name: string }) =>
                `**${m.display_name}**`
            )
            .join("\n- ");
          aiResponse = `**Found ${matches.length} matches for "${query}":**\n- ${matchNames}\n\nType **/profile** to see details of your current match.`;
        } else {
          aiResponse = `No matches found for "${query}".`;
        }
      }
    } else if (command === "wrapped") {
      // Trigger Wrapped Analysis
      const { getWrappedAnalysisAction } = await import("./actions");
      const { analysis, error } = await getWrappedAnalysisAction(roomId);

      if (error) {
        aiResponse = error;
      } else if (analysis) {
        aiResponse = `**🎵 Your Amistala Wrapped 🎵**\n\n**Persona:** ${
          analysis.persona
        }\n**Vibe:** ${analysis.vibe}\n**Communication Style:** ${
          analysis.communication_style
        }\n**Top Topics:** ${analysis.top_topics.join(", ")}`;
      }
    } else if (command === "help") {
      aiResponse =
        "Available commands:\n/next - Find a new match\n/leave - Leave this room\n/archive - Archive this room\n/profile - View your profile\n/search [term] - Search for users\n/create [topic] - Create a topic room\n/wrapped - See your personality analysis\n/help - Show this message";
    } else {
      // If it starts with /ai but command unknown, or just /unknown
      // Only respond if it was explicitly /ai or a known command.
      // But here we capture ALL / commands.
      // If it's just /hello, maybe we shouldn't error?
      // But for now, let's assume all / are commands.
      aiResponse = "I'm sorry, I didn't recognize that command. Try /help.";
    }

    // Send AI response (private)
    if (aiResponse) {
      await supabase.from("messages").insert({
        room_id: roomId,
        content: aiResponse,
        is_ai: true,
        recipient_id: isPrivate ? userId : null,
      });
    }

    revalidatePath(`/rooms/${roomId}`);
    if (command === "leave" || command === "archive") {
      redirect("/rooms");
    }
    return;
  } else if (lowerContent.startsWith("/create ")) {
    // Handle /create [Topic]
    const topic = content.substring(8).trim();
    if (!topic) return { error: "Please specify a topic." };

    // Create new room
    const { data: newRoom, error: createError } = await supabase
      .from("rooms")
      .insert({
        name: topic,
        type: "INTRO_GROUP",
        created_by: userId,
      })
      .select()
      .single();

    if (createError) return { error: createError.message };

    // Add creator to room
    await supabase.from("room_members").insert({
      room_id: newRoom.id,
      user_id: userId,
    });

    // Notify user
    await supabase.from("messages").insert({
      room_id: roomId,
      content: `Created new room: **${topic}**. Redirecting you...`,
      is_ai: true,
      recipient_id: userId,
    });

    redirect(`/rooms/${newRoom.id}`);
  }

  // 2. Insert user message
  const { error } = await supabase.from("messages").insert({
    room_id: roomId,
    sender_id: userId,
    content,
    media_url: mediaUrl,
    media_type: mediaType,
  });

  if (error) return { error: error.message };

  // 2.5 Check for Progressive Reveal
  // Count messages between these two users in this room
  // For MVP, just count total messages in room / 2 (approx) or just total messages
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId);

  if (count && count === 10) {
    // Trigger reveal!
    const { data: members } = await supabase
      .from("room_members")
      .select("user_id")
      .eq("room_id", roomId);

    if (members && members.length === 2) {
      const user1 = members[0].user_id;
      const user2 = members[1].user_id;
      const { createReveal } = await import("@/lib/db/queries");
      await createReveal(user1, user2);
      await createReveal(user2, user1);

      await supabase.from("messages").insert({
        room_id: roomId,
        content:
          "🎉 You've been chatting for a while! **Full profiles have been revealed.** Type **/profile** to see more about your match.",
        is_ai: true,
      });
    }
  }

  // 2.6 Check for Badges
  const { checkAndAwardBadges } = await import("@/lib/db/queries");
  const newBadges = await checkAndAwardBadges(userId);
  if (newBadges.length > 0) {
    await supabase.from("messages").insert({
      room_id: roomId,
      content: `🏆 **Achievement Unlocked!** You earned the **${newBadges.join(
        ", "
      )}** badge!`,
      is_ai: true,
      recipient_id: userId,
    });
  }

  // 3. Check if it's the AI room
  const { data: room } = await supabase
    .from("rooms")
    .select("is_main_ai_room, type")
    .eq("id", roomId)
    .single();

  if (room?.is_main_ai_room) {
    // Extract interests from the message
    const { inferProfileData, detectTrendingTopic } = await import("@/lib/ai");
    const inferredData = await inferProfileData(content);
    let newInterests: string[] = [];

    if (
      inferredData.interests.length > 0 ||
      inferredData.persona.length > 0 ||
      inferredData.looking_for.length > 0
    ) {
      const { updateUserProfileData } = await import("@/lib/db/queries");
      await updateUserProfileData(userId, inferredData);

      // If interests changed, we might want to notify AI
      // But for now, just track if we found anything new
      if (inferredData.interests.length > 0) {
        newInterests = inferredData.interests;
      }
    }

    // Check for trending topics (every message for now, but ideally sampled)
    // Fetch last 20 messages to analyze context
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("content")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(20);

    const messageTexts = recentMessages?.map((m) => m.content).reverse() || [];
    const trending = await detectTrendingTopic(messageTexts);

    // Check for scheduling intent
    const { detectSchedulingIntent } = await import("@/lib/ai");
    const scheduling = await detectSchedulingIntent(content);

    if (scheduling.isScheduling) {
      await supabase.from("messages").insert({
        room_id: roomId,
        content: `📅 It sounds like you're planning to meet! \n**Suggested Time:** ${
          scheduling.suggestedTime || "TBD"
        }\n**Event:** ${
          scheduling.eventTitle || "Hangout"
        }\n*(Calendar integration coming soon!)*`,
        is_ai: true,
      });
    } else if (trending.topic) {
      // Announce it!
      // Check if we haven't announced it recently (omitted for MVP simplicity)
      await supabase.from("messages").insert({
        room_id: roomId,
        content: `It seems like a lot of you are talking about **${trending.topic}**. Would you like me to create a room for it? (Type **/create ${trending.topic}**)`,
        is_ai: true,
      });
    } else {
      // Trigger AI response (normal chatter)
      const aiResponse = await generateAIResponse({
        roomType: "main_ai",
        messages: [], // Pass history if needed
        newInterests: newInterests.length > 0 ? newInterests : undefined,
      });

      await supabase.from("messages").insert({
        room_id: roomId,
        content: aiResponse,
        is_ai: true,
      });
    }
  } else {
    // 4. Check for Scheduling Intent (in normal rooms)
    const { detectSchedulingIntent } = await import("@/lib/ai");
    const scheduling = await detectSchedulingIntent(content);

    if (scheduling.isScheduling) {
      const title = scheduling.eventTitle || "Amistala Meetup";
      // Simple Google Calendar link (defaults to now if no time)
      // If we had a time, we'd format it. For now, just open the create event page.
      const encodedTitle = encodeURIComponent(title);
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}`;

      await supabase.from("messages").insert({
        room_id: roomId,
        content: `📅 **Scheduling Detected:** It sounds like you're planning to meet! [Create Calendar Event](${calendarUrl})`,
        is_ai: true,
        recipient_id: userId, // Only show to the sender for now to avoid spam, or show to everyone? Let's show to sender.
      });
    }
  }

  revalidatePath(`/rooms/${roomId}`);
}

export async function getCompatibility(roomId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };
  const userId = user.id;

  // 1. Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!messages || messages.length < 5) {
    return { error: "Not enough conversation yet!" };
  }

  // 2. Fetch room members to get names
  const { data: members } = await supabase
    .from("room_members")
    .select("user_id, profiles(display_name)")
    .eq("room_id", roomId);

  const user1 = members?.find((m) => m.user_id === userId);
  const user2 = members?.find((m) => m.user_id !== userId);

  // Helper to safely get display name
  const getDisplayName = (
    member:
      | {
          user_id: string;
          profiles?: { display_name?: string } | { display_name?: string }[];
        }
      | undefined
  ) => {
    if (!member?.profiles) return "Unknown";
    if (Array.isArray(member.profiles)) {
      return member.profiles[0]?.display_name || "Unknown";
    }
    return member.profiles.display_name || "Unknown";
  };

  const user1Name = user1 ? getDisplayName(user1) : "You";
  const user2Name = user2 ? getDisplayName(user2) : "Them";

  // 3. Generate report
  const { generateCompatibilityReport } = await import("@/lib/ai");
  const report = await generateCompatibilityReport(
    messages.reverse(),
    user1Name,
    user2Name
  );

  return { report };
}

export async function getRoomSummary(roomId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // 1. Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("content, sender_id, profiles(display_name)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!messages || messages.length < 5) {
    return { error: "Not enough conversation to summarize yet!" };
  }

  // 2. Format messages for AI
  const formattedMessages = messages.reverse().map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    const senderName = profile?.display_name || "Unknown";
    return `${senderName}: ${m.content}`;
  });

  // 3. Generate summary
  const { generateRoomSummary } = await import("@/lib/ai");
  const summary = await generateRoomSummary(formattedMessages);

  return { summary };
}

export async function giveKudosAction(receiverId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };
  const userId = user.id;
  if (userId === receiverId)
    return { error: "You cannot give kudos to yourself!" };

  const { giveKudos, checkAndAwardBadges } = await import("@/lib/db/queries");
  await giveKudos(userId, receiverId);

  // Check badges for receiver
  await checkAndAwardBadges(receiverId);

  return { success: true };
}

export async function getReputationAction(userId: string) {
  const { getReputation } = await import("@/lib/db/queries");
  const score = await getReputation(userId);
  return { score };
}

export async function getWrappedAnalysisAction(roomId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };
  const userId = user.id;

  // Fetch user's messages in this room
  const { data: messages } = await supabase
    .from("messages")
    .select("content")
    .eq("room_id", roomId)
    .eq("sender_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!messages || messages.length < 10) {
    return {
      error: "Not enough data for a Wrapped analysis yet! Keep chatting.",
    };
  }

  const messageTexts = messages.map((m: { content: string }) => m.content);
  const { generateWrappedAnalysis } = await import("@/lib/ai");
  const analysis = await generateWrappedAnalysis(messageTexts);

  return { analysis };
}
