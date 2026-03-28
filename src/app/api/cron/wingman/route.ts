import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndFacilitateRoom } from "@/app/actions/wingman";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Find intro rooms with messages older than 30 minutes where last message is human
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: staleRooms } = await supabase
    .from("rooms")
    .select("id")
    .eq("type", "INTRO_GROUP")
    .eq("archived", false);

  if (!staleRooms || staleRooms.length === 0) {
    return NextResponse.json({ checked: 0, intervened: 0 });
  }

  let intervened = 0;

  for (const room of staleRooms) {
    try {
      const result = await checkAndFacilitateRoom(room.id);
      if (result?.status === "intervened") intervened++;
    } catch (e) {
      console.error(`Wingman error for room ${room.id}:`, e);
    }
  }

  return NextResponse.json({
    checked: staleRooms.length,
    intervened,
  });
}
