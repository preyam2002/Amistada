"use client";

import ChatWindow from "@/components/ChatWindow";
import { useLayout } from "../../layout-client";

type Message = {
  id: string;
  content: string;
  sender_id: string | null;
  recipient_id: string | null;
  is_ai: boolean;
  created_at: string;
  media_url?: string | null;
  media_type?: "image" | "audio" | null;
  profiles?: {
    display_name: string;
    avatar_color: string;
  };
};

type RoomPageClientProps = {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  roomName: string;
  isAiRoom: boolean;
};

export default function RoomPageClient({
  roomId,
  initialMessages,
  currentUserId,
  roomName,
  isAiRoom,
}: RoomPageClientProps) {
  const { setIsMobileMenuOpen } = useLayout();

  return (
    <ChatWindow
      roomId={roomId}
      initialMessages={initialMessages}
      currentUserId={currentUserId}
      roomName={roomName}
      isAiRoom={isAiRoom}
      onMenuClick={() => setIsMobileMenuOpen(true)}
    />
  );
}
