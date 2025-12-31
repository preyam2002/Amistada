import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import * as aiModule from "@/lib/ai";
import {
  filterUsersWithAI,
  generateAIResponse,
  generateCompatibilityReport,
} from "@/lib/ai";
import { ensureUserOnboarding } from "@/lib/onboarding";
import { updateUserProfileData } from "@/lib/db/queries";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/db/queries", () => ({
  updateUserProfileData: vi.fn(),
}));

type InsertRecord = Record<string, unknown>;

class MockSupabaseClient {
  inserted = {
    profiles: [] as InsertRecord[],
    rooms: [] as InsertRecord[],
    roomMembers: [] as InsertRecord[],
    messages: [] as InsertRecord[],
  };

  constructor(
    private profileExists: boolean,
    private roomExists: boolean,
  ) {}

  from(table: string) {
    if (table === "profiles") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: this.profileExists ? { id: "user-123" } : null,
            }),
          }),
        }),
        insert: async (payload: InsertRecord) => {
          this.inserted.profiles.push(payload);
          return { data: null, error: null };
        },
      } as unknown as SupabaseClient;
    }

    if (table === "rooms") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () => ({
                data: this.roomExists
                  ? { id: "existing-room", is_main_ai_room: true }
                  : null,
              }),
            }),
          }),
        }),
        insert: (payload: InsertRecord) => {
          const roomRecord = { id: "room-123", ...payload };
          this.inserted.rooms.push(roomRecord);
          return {
            select: () => ({
              single: async () => ({ data: roomRecord, error: null }),
            }),
          };
        },
      } as unknown as SupabaseClient;
    }

    if (table === "room_members") {
      return {
        insert: async (payload: InsertRecord) => {
          this.inserted.roomMembers.push(payload);
          return { data: null, error: null };
        },
      } as unknown as SupabaseClient;
    }

    if (table === "messages") {
      return {
        insert: async (payload: InsertRecord) => {
          this.inserted.messages.push(payload);
          return { data: null, error: null };
        },
      } as unknown as SupabaseClient;
    }

    throw new Error(`Unexpected table ${table}`);
  }
}

const originalApiKey = process.env.OPENAI_API_KEY;
const mockedUpdateProfile = vi.mocked(updateUserProfileData);

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  process.env.OPENAI_API_KEY = originalApiKey;
});

describe("ensureUserOnboarding", () => {
  it("creates profile, room, member, and welcome message when missing", async () => {
    const supabase = new MockSupabaseClient(false, false);
    const aiSpy = vi
      .spyOn(aiModule, "generateAIResponse")
      .mockResolvedValue("Welcome!");

    await ensureUserOnboarding(
      supabase as unknown as SupabaseClient,
      "user-123",
      "friend@example.com",
      "Friendly User",
    );

    expect(supabase.inserted.profiles).toHaveLength(1);
    expect(supabase.inserted.rooms).toHaveLength(1);
    expect(supabase.inserted.roomMembers).toEqual([
      { room_id: "room-123", user_id: "user-123" },
    ]);
    expect(supabase.inserted.messages[0]).toMatchObject({
      room_id: "room-123",
      is_ai: true,
    });
    expect(aiSpy).toHaveBeenCalledWith({ roomType: "main_ai" });
    aiSpy.mockRestore();
  });

  it("skips creation when profile and room already exist", async () => {
    const supabase = new MockSupabaseClient(true, true);
    const aiSpy = vi.spyOn(aiModule, "generateAIResponse");

    await ensureUserOnboarding(
      supabase as unknown as SupabaseClient,
      "user-123",
      "friend@example.com",
    );

    expect(supabase.inserted.profiles).toHaveLength(0);
    expect(supabase.inserted.rooms).toHaveLength(0);
    expect(supabase.inserted.roomMembers).toHaveLength(0);
    expect(supabase.inserted.messages).toHaveLength(0);
    expect(aiSpy).not.toHaveBeenCalled();
    aiSpy.mockRestore();
  });
});

describe("AI helpers without API key", () => {
  it("returns stub response for generateAIResponse", async () => {
    const response = await generateAIResponse({
      roomType: "main_ai",
      messages: [{ content: "Hello!", is_ai: false }],
      usersInfo: [{ id: "user-123", display_name: "Friendly User" }],
    });

    expect(response).toContain("brain (API Key) is missing");
    expect(mockedUpdateProfile).not.toHaveBeenCalled();
  });

  it("returns default compatibility report", async () => {
    const report = await generateCompatibilityReport(
      [
        { content: "Hi there", sender_id: "user1" },
        { content: "Hello!", sender_id: "user2" },
      ],
      "User 1",
      "User 2",
    );

    expect(report).toMatchObject({
      score: 42,
      summary: "API Key Missing",
      reason: "I can't calculate compatibility without my brain!",
      shared_interests: ["Mystery"],
    });
  });

  it("filters users with empty result when key is missing", async () => {
    const result = await filterUsersWithAI("hiking", [
      { name: "Alex", interests: ["hiking", "music"] },
    ]);

    expect(result).toEqual([]);
  });
});
