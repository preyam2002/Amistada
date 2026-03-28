import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRooms } from "@/lib/db/queries";
import AppLayoutClient from "./layout-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch rooms server-side (including archived for sidebar display)
  const allRooms = await getRooms(true);
  const activeRooms = allRooms.filter(
    (r) => !r.archived && !r.room_members?.some((m: { is_archived?: boolean; left_at?: string }) => m.is_archived || m.left_at)
  );
  const archivedRooms = allRooms.filter(
    (r) => r.archived || r.room_members?.some((m: { is_archived?: boolean; left_at?: string }) => m.is_archived || m.left_at)
  );

  return (
    <AppLayoutClient rooms={activeRooms} archivedRooms={archivedRooms}>
      {children}
    </AppLayoutClient>
  );
}
