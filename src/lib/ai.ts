import OpenAI from "openai";
import { updateUserProfileData } from "./db/queries";
import { AMISTALA_PERSONAS } from "./personas";

// Lazy initialization of OpenAI to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function inferInterests(text: string): Promise<string[]> {
  try {
    const openai = getOpenAIClient();
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting user interests, hobbies, and personality traits from text. Return a JSON array of strings representing the interests found. If none are found, return an empty array. Example: ['coding', 'hiking', 'sci-fi']. Keep interests general but descriptive.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    const result = JSON.parse(content);
    return result.interests || [];
  } catch (error) {
    console.error("Error inferring interests:", error);
    return [];
  }
}

export async function inferProfileData(
  text: string
): Promise<{ interests: string[]; persona: string[]; looking_for: string[] }> {
  try {
    const openai = getOpenAIClient();
    const personasList = AMISTALA_PERSONAS.map(
      (p: { name: string; description: string }) =>
        `${p.name}: ${p.description}`
    ).join("\n");

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting user profile data from text. 
            Return a JSON object with three arrays: 'interests' (hobbies/topics), 'persona' (who they are), and 'looking_for' (who they want to meet).
            
            For 'persona', try to match the user to one of the following Amistala Archetypes if their language/vibe fits:
            ${personasList}
            
            If they fit multiple, pick the top 1-2. If they don't fit any well, use a generic descriptor (e.g. Student, Engineer).
            
            Example: {'interests': ['coding'], 'persona': ['The Architect'], 'looking_for': ['Mentor']}. 
            Do NOT include attributes of people the user is looking for in 'interests' or 'persona'.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return { interests: [], persona: [], looking_for: [] };

    const result = JSON.parse(content);
    return {
      interests: result.interests || [],
      persona: result.persona || [],
      looking_for: result.looking_for || [],
    };
  } catch (error) {
    console.error("Error inferring profile data:", error);
    return { interests: [], persona: [], looking_for: [] };
  }
}

export async function generateAIResponse({
  roomType,
  messages,
  usersInfo,
  newInterests,
  user1Chats,
  user2Chats,
}: {
  roomType: "main_ai" | "intro_room";
  messages?: { content: string; is_ai: boolean; sender_id?: string }[];
  usersInfo?: { id: string; display_name: string }[];
  newInterests?: string[];
  user1Chats?: string[];
  user2Chats?: string[];
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Using stub response.");
    return "I'm Amistala, but my brain (API Key) is missing! Please check the configuration.";
  }

  try {
    if (roomType === "main_ai") {
      const systemPrompt = `You are Amistala, a friendly, cozy, and slightly poetic AI matchmaker. 
      Your goal is to help users feel comfortable and learn about them to find them good matches.
      - Tone: Warm, inviting, non-corporate, slightly whimsical.
      - Do NOT sound like a robot or a standard assistant.
      - If the user mentions interests, acknowledge them enthusiastically.
      - Keep responses concise (under 3 sentences usually).`;

      let userMessage = "Hello!";

      // Use the last user message if available
      const lastUserMsg = messages?.filter((m) => !m.is_ai).pop()?.content;
      if (lastUserMsg) {
        userMessage = lastUserMsg;

        // Infer and save profile data
        const inferred = await inferProfileData(lastUserMsg);
        if (
          inferred.interests.length > 0 ||
          inferred.persona.length > 0 ||
          inferred.looking_for.length > 0
        ) {
          const userId = usersInfo?.[0]?.id;
          if (userId) {
            await updateUserProfileData(userId, inferred);
            const updates = [];
            if (inferred.interests.length)
              updates.push(`Interests: ${inferred.interests.join(", ")}`);
            if (inferred.persona.length)
              updates.push(`Persona: ${inferred.persona.join(", ")}`);
            if (inferred.looking_for.length)
              updates.push(`Looking For: ${inferred.looking_for.join(", ")}`);

            userMessage += `\n(System Note: User data extracted: ${updates.join(
              "; "
            )})`;
          }
        }
      } else if (newInterests && newInterests.length > 0) {
        userMessage = `I just mentioned these interests: ${newInterests.join(
          ", "
        )}.`;
      } else if (messages && messages.length > 0) {
        userMessage = "I'm here.";
      }

      const completion = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      return completion.choices[0].message.content || "I'm here to listen!";
    }

    if (roomType === "intro_room") {
      const names =
        usersInfo?.map((u) => u.display_name).join(" and ") || "friends";
      const user1Name = usersInfo?.[0]?.display_name || "User 1";
      const user2Name = usersInfo?.[1]?.display_name || "User 2";

      const systemPrompt = `You are Amistala, a warm and intuitive host introducing two people.
      Your goal is to break the ice and find common ground.
      - Tone: Friendly, encouraging, cozy.
      - You have access to snippets of their past conversations. Use this to suggest specific topics.
      - If they have shared interests, highlight them.
      - Ask a specific, fun question to get them talking.`;

      let context = "";
      if (user1Chats && user1Chats.length > 0) {
        context += `${user1Name} has talked about: ${user1Chats
          .slice(0, 5)
          .join(", ")}. `;
      }
      if (user2Chats && user2Chats.length > 0) {
        context += `${user2Name} has talked about: ${user2Chats
          .slice(0, 5)
          .join(", ")}. `;
      }

      const prompt = `Introduce ${names}. ${context} Suggest a topic they might both like based on this context.`;

      const completion = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      });

      return (
        completion.choices[0].message.content ||
        `Hello ${names}! I think you two will get along great.`
      );
    }

    return "I'm listening...";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "I'm having a little trouble thinking right now, but I'm glad you're here!";
  }
}

export type CompatibilityReport = {
  score: number;
  summary: string;
  reason: string;
  shared_interests: string[];
};

export async function generateCompatibilityReport(
  messages: { content: string; sender_id: string }[],
  user1Name: string,
  user2Name: string
): Promise<CompatibilityReport> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      score: 42,
      summary: "API Key Missing",
      reason: "I can't calculate compatibility without my brain!",
      shared_interests: ["Mystery"],
    };
  }

  try {
    const systemPrompt = `You are Amistala's Compatibility Expert. 
    Analyze the conversation between ${user1Name} and ${user2Name}.
    Determine a "Compatibility Score" (0-100) based on:
    - Flow of conversation (are they responding well?)
    - Shared topics/interests
    - Sentiment/Tone
    
    Return ONLY a JSON object with this structure:
    {
      "score": number,
      "summary": "Short, punchy 1-sentence summary of their vibe (e.g. 'Chaotic Good Energy' or 'Soulmate Potential')",
      "reason": "A 1-2 sentence explanation of why they match well.",
      "shared_interests": ["list", "of", "detected", "interests"]
    }`;

    const conversationText = messages
      .map(
        (m) =>
          `${m.sender_id === "user1" ? user1Name : user2Name}: ${m.content}`
      )
      .join("\n");

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the chat history:\n${conversationText.substring(
            0,
            3000
          )}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content returned");

    return JSON.parse(content) as CompatibilityReport;
  } catch (error) {
    console.error("Compatibility Report Error:", error);
    return {
      score: 50,
      summary: "It's a start!",
      reason: "We need more conversation to be sure.",
      shared_interests: [],
    };
  }
}

export async function rankMatches(
  userProfile: {
    interests?: string[];
    persona?: string[];
    looking_for?: string[];
  },
  candidates: { profile: Record<string, unknown>; sharedInterests: string[] }[]
): Promise<number> {
  if (!process.env.OPENAI_API_KEY || candidates.length === 0) {
    return 0; // Default to first candidate if no AI
  }

  try {
    const candidatesList = candidates
      .map(
        (c, i) =>
          `${i}: ${JSON.stringify(
            c.profile
          )} (Shared Interests: ${c.sharedInterests.join(", ")})`
      )
      .join("\n");

    const prompt = `
    I need to find the best match for this user:
    User: ${JSON.stringify(userProfile)}

    Candidates:
    ${candidatesList}

    Which candidate (0-${candidates.length - 1}) is the best match?
    Consider shared interests and overall vibe.
    Return ONLY the index number.
    `;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0].message.content?.trim();
    const index = parseInt(content || "0");
    return isNaN(index) ? 0 : index;
  } catch (e) {
    console.error("Error ranking matches:", e);
    return 0;
  }
}

export async function filterUsersWithAI(
  query: string,
  candidates: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  if (!process.env.OPENAI_API_KEY || candidates.length === 0) {
    return [];
  }

  try {
    const candidatesList = candidates
      .map((c, i) => `${i}: ${JSON.stringify(c)}`)
      .join("\n");

    const prompt = `
    I need to find users that match this search query: "${query}"

    Candidates:
    ${candidatesList}

    Return a JSON array of indices of the users that are good matches.
    Example: [0, 3, 5]
    If no matches, return [].
    `;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    const indices = Array.isArray(parsed.indices)
      ? parsed.indices
      : Array.isArray(parsed)
      ? parsed
      : [];

    return indices
      .map((i: number) => candidates[Number(i)])
      .filter((c: unknown) => c !== undefined);
  } catch (e) {
    console.error("Error searching users:", e);
    return [];
  }
}

export type WrappedAnalysis = {
  persona: string;
  vibe: string;
  top_topics: string[];
  communication_style: string;
};

export async function generateWrappedAnalysis(
  messages: string[]
): Promise<WrappedAnalysis> {
  if (!process.env.OPENAI_API_KEY || messages.length === 0) {
    return {
      persona: "The Mystery",
      vibe: "Unknown",
      top_topics: ["Silence"],
      communication_style: "Quiet",
    };
  }

  try {
    const prompt = `
    Analyze these messages from a single user to create a "Spotify Wrapped" style personality summary.
    
    Messages:
    ${messages.slice(0, 50).join("\n")}
    
    Return a JSON object:
    {
      "persona": "Creative Title (e.g. 'The Philosopher', 'The Hype Man')",
      "vibe": "1 sentence description of their energy",
      "top_topics": ["topic1", "topic2", "topic3"],
      "communication_style": "1-2 words (e.g. 'Direct & Witty', 'Warm & Verbose')"
    }
    `;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content");

    return JSON.parse(content) as WrappedAnalysis;
  } catch (e) {
    console.error("Error generating wrapped analysis:", e);
    return {
      persona: "The Enigma",
      vibe: "Hard to read",
      top_topics: ["Everything"],
      communication_style: "Varied",
    };
  }
}

export type RoastData = {
  roastTitle: string;
  roastDescription: string;
  burnLevel: "Mild" | "Medium" | "Scorched Earth";
};

export async function generateRoast(messages: string[]): Promise<RoastData> {
  if (!process.env.OPENAI_API_KEY || messages.length === 0) {
    return {
      roastTitle: "Too Boring to Roast",
      roastDescription:
        "You haven't said enough for me to make fun of you yet.",
      burnLevel: "Mild",
    };
  }

  try {
    const prompt = `
    Roast this user based on their last few messages. Be funny, witty, and slightly edgy, but NOT mean-spirited or offensive. 
    Think "Comedy Central Roast" but safe for work.
    
    Messages:
    ${messages.slice(0, 30).join("\n")}
    
    Return a JSON object:
    {
      "roastTitle": "Short, punchy title (e.g. 'The Emoji Spammer', 'Captain Obvious')",
      "roastDescription": "1-2 sentences explaining why they deserve this title.",
      "burnLevel": "Mild" | "Medium" | "Scorched Earth"
    }
    `;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content");

    return JSON.parse(content) as RoastData;
  } catch (e) {
    console.error("Error generating roast:", e);
    return {
      roastTitle: "Teflon Don",
      roastDescription: "I tried to roast you, but my circuits overheated.",
      burnLevel: "Medium",
    };
  }
}

export async function generateRoomSummary(messages: string[]): Promise<string> {
  if (!process.env.OPENAI_API_KEY || messages.length === 0) {
    return "No messages to summarize.";
  }

  try {
    const messagesText = messages.join("\n");
    const prompt = `
    Summarize the following conversation into exactly 3 distinct bullet points.
    Focus on the main topics discussed and any key decisions or interesting points.
    Keep it concise.

    Conversation:
    ${messagesText}
    `;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return (
      completion.choices[0].message.content || "Could not generate summary."
    );
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
}

export async function detectTrendingTopic(
  messages: string[]
): Promise<{ topic: string | null; reason: string | null }> {
  if (!process.env.OPENAI_API_KEY || messages.length < 5) {
    return { topic: null, reason: null };
  }

  try {
    const messagesText = messages.join("\n");
    const prompt = `
    Analyze the following conversation from a general chat room.
    Is there a specific, distinct topic that multiple people are discussing intensely right now?
    (e.g., "Anime", "Crypto", "Hiking", "Dune").
    Ignore general chatter like "hello", "how are you".

    If yes, return a JSON object: { "topic": "Short Topic Name", "reason": "Why you think so" }
    If no, return { "topic": null, "reason": null }

    Conversation:
    ${messagesText}
    `;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) return { topic: null, reason: null };

    const result = JSON.parse(content);
    return {
      topic: result.topic || null,
      reason: result.reason || null,
    };
  } catch {
    return { topic: null, reason: null };
  }
}

export async function detectSchedulingIntent(message: string): Promise<{
  isScheduling: boolean;
  suggestedTime?: string;
  eventTitle?: string;
}> {
  if (!process.env.OPENAI_API_KEY) return { isScheduling: false };

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Analyze the message to see if the user is proposing a time to meet or hang out. Return a JSON object: { 'isScheduling': boolean, 'suggestedTime': string (ISO format or natural language if unsure), 'eventTitle': string (e.g. 'Coffee Chat') }. If no intent, isScheduling is false.",
        },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return { isScheduling: false };

    return JSON.parse(content);
  } catch (e) {
    console.error("Error detecting scheduling intent:", e);
    return { isScheduling: false };
  }
}
