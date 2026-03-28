import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function getRooms(includeArchived = false) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("rooms")
    .select(
      `
      *,
      room_members!inner(user_id, left_at, is_archived)
    `
    )
    .eq("room_members.user_id", user!.id)
    .order("created_at", { ascending: false });

  if (!includeArchived) {
    query = query.eq("archived", false);
  }

  const { data: rooms } = await query;
  if (!rooms || rooms.length === 0) return [];

  // Fetch last message for each room
  const roomIds = rooms.map((r) => r.id);
  const lastMessages: Record<string, { content: string; created_at: string }> = {};

  for (const roomId of roomIds) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("content, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (msgs && msgs[0]) {
      lastMessages[roomId] = msgs[0];
    }
  }

  return rooms.map((room) => ({
    ...room,
    last_message: lastMessages[room.id]?.content || null,
    last_message_at: lastMessages[room.id]?.created_at || room.created_at,
  }));
}

export async function searchUsers(query: string, excludeUserId: string) {
  const supabase = await createClient();

  // Simple text search on bio and interests
  // Note: This is a basic implementation. For production, we'd want full-text search or vector embeddings.
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", excludeUserId)
    .or(
      `bio.ilike.%${query}%,interests.cs.{${query}},persona.cs.{${query}},looking_for.cs.{${query}}`
    );
  return data || [];
}

export async function updateUserProfileData(
  userId: string,
  data: {
    display_name?: string;
    bio?: string;
    interests?: string[];
    persona?: string[];
    looking_for?: string[];
  }
) {
  const supabase = await createClient();

  // First get existing data
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, interests, persona, looking_for")
    .eq("id", userId)
    .single();

  const existingInterests = profile?.interests || [];
  const existingPersona = profile?.persona || [];
  const existingLookingFor = profile?.looking_for || [];

  // Merge and deduplicate arrays
  const updatedInterests = data.interests
    ? Array.from(new Set([...existingInterests, ...data.interests]))
    : existingInterests;
  const updatedPersona = data.persona
    ? Array.from(new Set([...existingPersona, ...data.persona]))
    : existingPersona;
  const updatedLookingFor = data.looking_for
    ? Array.from(new Set([...existingLookingFor, ...data.looking_for]))
    : existingLookingFor;

  // Generate embedding
  const profileText = [
    ...updatedInterests,
    ...updatedPersona,
    ...updatedLookingFor,
  ].join(" ");

  let embedding: number[] = [];
  if (profileText.length > 0) {
    try {
      const { generateEmbedding } = await import("@/lib/ai-embedding");
      embedding = await generateEmbedding(profileText);
    } catch (e) {
      console.error("Failed to generate embedding", e);
    }
  }

  const updateData: {
    interests: string[];
    persona: string[];
    looking_for: string[];
    updated_at: string;
    display_name?: string;
    embedding?: number[];
  } = {
    interests: updatedInterests,
    persona: updatedPersona,
    looking_for: updatedLookingFor,
    updated_at: new Date().toISOString(),
  };

  if (data.display_name) {
    updateData.display_name = data.display_name;
  }

  if (data.bio !== undefined) {
    (updateData as Record<string, unknown>).bio = data.bio;
  }

  if (embedding.length > 0) {
    updateData.embedding = embedding;
  }

  await supabase.from("profiles").update(updateData).eq("id", userId);

  return {
    display_name: data.display_name || profile?.display_name,
    interests: updatedInterests,
    persona: updatedPersona,
    looking_for: updatedLookingFor,
  };
}

export async function getReputation(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reputation_scores")
    .select("score")
    .eq("user_id", userId)
    .single();
  return data?.score || 0;
}

export async function giveKudos(giverId: string, receiverId: string) {
  const supabase = await createClient();

  // 1. Record event
  await supabase.from("reputation_events").insert({
    giver_id: giverId,
    receiver_id: receiverId,
    reason: "kudos",
  });

  // 2. Update score
  // Check if score exists
  const { data: existing } = await supabase
    .from("reputation_scores")
    .select("score")
    .eq("user_id", receiverId)
    .single();

  if (existing) {
    await supabase
      .from("reputation_scores")
      .update({
        score: existing.score + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", receiverId);
  } else {
    await supabase.from("reputation_scores").insert({
      user_id: receiverId,
      score: 1,
    });
  }

  return { success: true };
}

export async function searchUsersByEmbedding(userId: string, limit = 5) {
  const supabase = await createClient();

  // Get current user's embedding
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("embedding")
    .eq("id", userId)
    .single();

  if (!userProfile?.embedding) return [];

  const { data: similarUsers, error } = await supabase.rpc("match_profiles", {
    query_embedding: userProfile.embedding,
    match_threshold: 0.5, // Adjust threshold as needed
    match_count: limit,
    exclude_user_id: userId,
  });

  if (error) {
    console.error("Error searching users by embedding:", error);
    return [];
  }

  // Fetch full profiles for the matched IDs
  if (similarUsers && similarUsers.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in(
        "id",
        similarUsers.map((u: { id: string }) => u.id)
      );
    return profiles || [];
  }

  return [];
}

export async function searchUsersByTextQuery(
  query: string,
  excludeUserId: string,
  limit = 5
) {
  const supabase = await createClient();

  try {
    const { generateEmbedding } = await import("@/lib/ai-embedding");
    const queryEmbedding = await generateEmbedding(query);

    if (queryEmbedding.length === 0) {
      // Fallback to text search if embedding fails
      return searchUsers(query, excludeUserId);
    }

    const { data: similarUsers, error } = await supabase.rpc("match_profiles", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      exclude_user_id: excludeUserId,
    });

    if (error) {
      console.error("Error searching users by text query:", error);
      return searchUsers(query, excludeUserId);
    }

    if (similarUsers && similarUsers.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in(
          "id",
          similarUsers.map((u: { id: string }) => u.id)
        );
      return profiles || [];
    }
  } catch (e) {
    console.error("Error in searchUsersByTextQuery:", e);
    return searchUsers(query, excludeUserId);
  }

  return [];
}

export async function checkRevealStatus(ownerId: string, viewerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_reveals")
    .select("level")
    .eq("owner_id", ownerId)
    .eq("viewer_id", viewerId)
    .single();
  return data?.level || 0;
}

export async function createReveal(ownerId: string, viewerId: string) {
  const supabase = await createClient();
  // Check if already exists
  const { data } = await supabase
    .from("profile_reveals")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("viewer_id", viewerId)
    .single();

  if (!data) {
    await supabase.from("profile_reveals").insert({
      owner_id: ownerId,
      viewer_id: viewerId,
      level: 1,
    });
  }
}

export async function getProfileWithReveal(ownerId: string, viewerId: string) {
  const profile = await getProfile(ownerId);
  if (!profile) return null;

  if (ownerId === viewerId) return profile;

  const level = await checkRevealStatus(ownerId, viewerId);

  if (level === 0) {
    // Masked profile
    return {
      ...profile,
      bio: "🔒 Chat more to reveal bio",
      interests: profile.interests?.slice(0, 1).concat(["🔒 ..."]) || [],
      persona: ["🔒"],
      looking_for: ["🔒"],
    };
  }

  return profile;
}

export async function getUserBadges(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_badges")
    .select("badges(name, icon, description)")
    .eq("user_id", userId);

  // Supabase returns badges as an array, so we need to flatten it
  return (
    data
      ?.map((d) => (Array.isArray(d.badges) ? d.badges[0] : d.badges))
      .filter(Boolean) || []
  );
}

export async function checkAndAwardBadges(userId: string) {
  const supabase = await createClient();
  const newBadges: string[] = [];

  // 1. Chatterbox (100 messages)
  const { count: msgCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", userId);

  if (msgCount && msgCount >= 100) {
    await awardBadge(supabase, userId, "Chatterbox", newBadges);
  }

  // 2. Vibe Master (10 Kudos)
  const { count: kudosCount } = await supabase
    .from("reputation_scores")
    .select("score")
    .eq("user_id", userId)
    .single()
    .then(({ data }) => ({ count: data?.score || 0 }));

  if (kudosCount >= 10) {
    await awardBadge(supabase, userId, "Vibe Master", newBadges);
  }

  return newBadges;
}

async function awardBadge(
  supabase: ReturnType<typeof createClient> extends Promise<infer T>
    ? T
    : never,
  userId: string,
  badgeName: string,
  newBadges: string[]
) {
  // Get badge ID
  const { data: badge } = await supabase
    .from("badges")
    .select("id")
    .eq("name", badgeName)
    .single();

  if (!badge) return;

  // Check if already has it
  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badge.id)
    .single();

  if (!existing) {
    await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badge.id,
    });
    newBadges.push(badgeName);
  }
}
