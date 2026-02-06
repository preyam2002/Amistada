"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessage,
  getCompatibility,
  type CompatibilityReport,
} from "@/app/(app)/rooms/[roomId]/actions";
import { getWrappedStats, WrappedStats } from "@/app/actions/wrapped";
import { getRoast, RoastData } from "@/app/actions/roast";
import {
  Send,
  MoreVertical,
  User as UserIcon,
  Sparkles,
  ImageIcon,
  Mic,
  Copy,
  X,
  Gift,
  Flame,
  Menu,
  Heart,
  Reply,
  Download,
} from "lucide-react";
import { CompatibilityCard } from "@/components/CompatibilityCard";
import { WrappedStory } from "@/components/WrappedStory";
import { RoastBadge } from "@/components/RoastBadge";
import Image from "next/image";

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

type ChatWindowProps = {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  roomName: string;
  isAiRoom: boolean;
};

const slashCommands = [
  { cmd: "/next", desc: "Find a new match" },
  { cmd: "/leave", desc: "Leave this room" },
  { cmd: "/profile", desc: "View your profile" },
  { cmd: "/search", desc: "Browse rooms/users" },
  { cmd: "/create", desc: "Create topic room" },
  { cmd: "/catchup", desc: "Get a quick summary" },
  { cmd: "/clear", desc: "Clear your draft" },
  { cmd: "/wrapped", desc: "View your Wrapped" },
  { cmd: "/roast", desc: "Get roasted by AI" },
  { cmd: "/help", desc: "Show all commands" },
];

const quickPrompts = [
  "What’s a hobby that makes you lose track of time?",
  "What’s the best book or show you’ve enjoyed lately?",
  "What’s a small daily habit you’re proud of?",
];

const MAX_MESSAGE_LENGTH = 1000;

export default function ChatWindow({
  roomId,
  initialMessages,
  currentUserId,
  roomName,
  isAiRoom,
  isBlindMode = false,
  onMenuClick,
}: ChatWindowProps & { isBlindMode?: boolean; onMenuClick?: () => void }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [compatibilityReport, setCompatibilityReport] =
    useState<CompatibilityReport | null>(null);
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);

  const [showWrapped, setShowWrapped] = useState(false);
  const [wrappedStats, setWrappedStats] = useState<WrappedStats | null>(null);
  const [loadingWrapped, setLoadingWrapped] = useState(false);

  const [showRoast, setShowRoast] = useState(false);
  const [roastData, setRoastData] = useState<RoastData | null>(null);
  const [loadingRoast, setLoadingRoast] = useState(false);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [online, setOnline] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 160;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollToBottom(false);
      setUnreadCount(0);
    } else {
      setShowScrollToBottom(true);
      const diff = messages.length - prevMessageCountRef.current;
      if (diff > 0) setUnreadCount((c) => c + diff);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollToBottom(distanceFromBottom > 160);
    };
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true";
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        setNewMessage("/");
        inputRef.current?.focus();
      }
      if (!isTyping && (e.key === "?" || (e.shiftKey && e.key === "/"))) {
        e.preventDefault();
        setShowHelp(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // We need to fetch the profile if it's not AI
          // For simplicity in MVP, we might just push it and let it lack profile info momentarily,
          // or we can fetch it. Or we can rely on the fact that if it's us, we know our name.
          // If it's AI, no profile needed.

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    // Check for Wingman intervention
    const checkWingman = async () => {
      if (!isAiRoom) {
        try {
          const { checkAndFacilitateRoom } = await import(
            "@/app/actions/wingman"
          );
          await checkAndFacilitateRoom(roomId);
        } catch (e) {
          console.error("Wingman check failed", e);
        }
      }
    };

    // Run once on mount (with a small delay to let messages load/sync)
    const timer = setTimeout(checkWingman, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(timer);
    };
  }, [roomId, supabase, isAiRoom]);

  const handleCheckCompatibility = async () => {
    setLoadingCompatibility(true);
    try {
      const { report, error } = await getCompatibility(roomId);
      if (report) {
        setCompatibilityReport(report);
        setShowCompatibility(true);
      } else {
        console.error(error);
        alert(
          "Not enough conversation yet to judge compatibility! Keep chatting."
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompatibility(false);
    }
  };

  const handleTriggerWrapped = async () => {
    setLoadingWrapped(true);
    try {
      const { stats, error } = await getWrappedStats();
      if (stats) {
        setWrappedStats(stats);
        setShowWrapped(true);
      } else {
        alert(error || "Could not generate Wrapped.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWrapped(false);
    }
  };

  const handleTriggerRoast = async () => {
    setLoadingRoast(true);
    try {
      const { roast, error } = await getRoast();
      if (roast) {
        setRoastData(roast);
        setShowRoast(true);
      } else {
        alert(error || "Could not generate Roast.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRoast(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "voice-note.webm", {
          type: "audio/webm",
        });
        setMediaFile(audioFile);
        const url = URL.createObjectURL(audioBlob);
        setMediaPreview(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Error accessing microphone:", e);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const cancelMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId((prev) => (prev === id ? null : prev)), 1200);
    } catch (e) {
      console.error("Copy failed", e);
      alert("Could not copy message");
    }
  };

  const toggleReaction = (id: string) => {
    setReactions((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const handleCopyRoomLink = async () => {
    try {
      setCopyingRoom(true);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/rooms/${roomId}`;
      await navigator.clipboard.writeText(url);
      alert("Room link copied");
    } catch (e) {
      console.error("Copy room link failed", e);
      alert("Could not copy link");
    } finally {
      setCopyingRoom(false);
    }
  };

  const handleExportChat = () => {
    if (!messages.length) {
      alert("No messages to export");
      return;
    }
    const lines = messages.map((m) => {
      const time = new Date(m.created_at).toISOString();
      const author = m.is_ai ? "AI" : m.sender_id === currentUserId ? "You" : "User";
      return `[${time}] ${author}: ${m.content}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${roomId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!newMessage.trim() && !mediaFile) || sending) return;

    if (!online) {
      if (mediaFile) {
        alert("Offline: cannot queue media uploads. Please retry when online.");
        return;
      }
      setQueuedMessages((prev) => [...prev, newMessage.trim()]);
      setNewMessage("");
      if (typeof window !== "undefined") localStorage.removeItem(draftKey);
      return;
    }

    // Slash commands (only if no media)
    if (!mediaFile && newMessage.trim().startsWith("/")) {
      const command = newMessage.trim().toLowerCase();

      if (command === "/catchup") {
        await handleCatchUp();
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/clear") {
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/help") {
        setShowHelp(true);
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/profile") {
        window.location.href = "/profile";
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/search") {
        window.location.href = "/rooms";
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/create") {
        window.location.href = "/rooms?create=1";
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/wrapped") {
        await handleTriggerWrapped();
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/roast") {
        await handleTriggerRoast();
        setNewMessage("");
        if (typeof window !== "undefined") localStorage.removeItem(draftKey);
        return;
      }

      if (command === "/leave" || command === "/next") {
        setSending(true);
        // Mark as left/archived
        await supabase
          .from("room_members")
          .update({
            left_at: new Date().toISOString(),
            is_archived: true,
          })
          .eq("room_id", roomId)
          .eq("user_id", currentUserId);

        // Redirect
        window.location.href = "/";
        return;
      }
    }

    setSending(true);

    let mediaUrl = undefined;
    let mediaType: "image" | "audio" | undefined = undefined;

    if (mediaFile) {
      try {
        const fileExt = mediaFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${roomId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-media")
          .upload(filePath, mediaFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("chat-media")
          .getPublicUrl(filePath);

        mediaUrl = publicUrlData.publicUrl;
        mediaType = mediaFile.type.startsWith("image/") ? "image" : "audio";
      } catch (error) {
        console.error("Error uploading media:", error);
        alert("Failed to upload media");
        setSending(false);
        return;
      }
    }

    const res = await sendMessage(roomId, newMessage, mediaUrl, mediaType);

    if (res && "error" in res && res.error) {
      alert(res.error);
      setSending(false);
      return;
    }

    setNewMessage("");
    if (typeof window !== "undefined") localStorage.removeItem(draftKey);
    cancelMedia();
    setSending(false);
  }

  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const draftKey = `chat-draft-${roomId}`;
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [nearLimit, setNearLimit] = useState(false);
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [useRelativeTime, setUseRelativeTime] = useState(true);
  const [queuedMessages, setQueuedMessages] = useState<string[]>([]);
  const [filterTerm, setFilterTerm] = useState("");
  const [compactMode, setCompactMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessageCountRef = useRef(messages.length);
  const [copyingRoom, setCopyingRoom] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; preview: string } | null>(
    null
  );
  const settingsKey = `chat-settings-${roomId}`;

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    if (!useRelativeTime) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const diffMs = Date.now() - date.getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  };

  // Restore saved draft per room
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(draftKey);
    if (saved) setNewMessage(saved);
    inputRef.current?.focus();
  }, [draftKey]);

  // Persist draft as user types
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (newMessage.trim()) {
      localStorage.setItem(draftKey, newMessage);
    } else {
      localStorage.removeItem(draftKey);
    }
    setNearLimit(newMessage.length > MAX_MESSAGE_LENGTH - 50);
  }, [draftKey, newMessage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [roomId]);

  // Load view settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(settingsKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.compactMode === "boolean") setCompactMode(parsed.compactMode);
        if (typeof parsed.useRelativeTime === "boolean")
          setUseRelativeTime(parsed.useRelativeTime);
      } catch (e) {
        console.error("Failed to parse chat settings", e);
      }
    }
  }, [settingsKey]);

  // Persist view settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ compactMode, useRelativeTime });
    localStorage.setItem(settingsKey, payload);
  }, [settingsKey, compactMode, useRelativeTime]);

  useEffect(() => {
    if (!online || queuedMessages.length === 0) return;
    const flush = async () => {
      for (const msg of queuedMessages) {
        try {
          await sendMessage(roomId, msg, undefined, undefined);
        } catch (e) {
          console.error("Failed to flush queued message", e);
        }
      }
      setQueuedMessages([]);
    };
    flush();
  }, [online, queuedMessages, roomId]);

  async function handleCatchUp() {
    setLoadingSummary(true);
    const { getRoomSummary } = await import(
      "@/app/(app)/rooms/[roomId]/actions"
    );
    const res = await getRoomSummary(roomId);
    if (res.summary) {
      setSummary(res.summary);
    } else {
      alert(res.error || "Could not generate summary");
    }
    setLoadingSummary(false);
  }

  async function handleKudos(receiverId: string, receiverName: string) {
    const { giveKudosAction } = await import(
      "@/app/(app)/rooms/[roomId]/actions"
    );
    const res = await giveKudosAction(receiverId);
    if (res.success) {
      alert(`✨ Kudos given to ${receiverName}!`);
    } else {
      alert(res.error || "Failed to give kudos");
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050814] relative">
      {showCompatibility && compatibilityReport && (
        <CompatibilityCard
          report={compatibilityReport}
          roomName={roomName}
          onClose={() => setShowCompatibility(false)}
        />
      )}

      {showWrapped && wrappedStats && (
        <WrappedStory
          stats={wrappedStats}
          onClose={() => setShowWrapped(false)}
        />
      )}

      {showRoast && roastData && (
        <RoastBadge roast={roastData} onClose={() => setShowRoast(false)} />
      )}

      {/* Summary Modal */}
      {summary && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-[#0B1020] border border-[#A78BFA]/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#F9FAFB] flex items-center gap-2">
                ✨ Catch Up Summary
              </h3>
              <button
                onClick={() => setSummary(null)}
                className="text-[#9CA3AF] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-[#D1D5DB] whitespace-pre-wrap">
              {summary}
            </div>
            <button
              onClick={() => setSummary(null)}
              className="w-full mt-6 bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 text-[#A78BFA] py-2 rounded-xl transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Slash Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-[#0B1020] border border-[#A78BFA]/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#F9FAFB]">Slash commands</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {slashCommands.map((c) => (
                <div
                  key={c.cmd}
                  className="flex items-center justify-between px-3 py-2 bg-[#111827] border border-[#A78BFA]/10 rounded-xl text-sm"
                >
                  <span className="text-[#A78BFA] font-semibold">{c.cmd}</span>
                  <span className="text-[#D1D5DB]">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 border-b border-[#A78BFA]/10 flex items-center justify-between px-4 sm:px-6 bg-[#0B1020]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden text-[#9CA3AF] hover:text-white transition-colors p-2"
            >
              <Menu size={24} />
            </button>
          )}

          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isAiRoom
                ? "bg-gradient-to-br from-[#A78BFA] to-[#FB7185]"
                : "bg-[#1F2937]"
            }`}
          >
            {isAiRoom ? (
              <span className="text-white font-bold">AI</span>
            ) : (
              <span className="text-[#9CA3AF] font-medium">
                {roomName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-medium text-[#F9FAFB]">{roomName}</h2>
            <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  online ? "bg-green-500" : "bg-[#FBBF24]"
                }`}
              ></span>
              {online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseRelativeTime((v) => !v)}
            className="text-[#9CA3AF] hover:text-white transition-colors p-2 rounded-full hover:bg-[#1F2937]"
            title={useRelativeTime ? "Show exact time" : "Show relative time"}
          >
            🕒
          </button>
          <button
            onClick={handleCopyRoomLink}
            disabled={copyingRoom}
            className="text-[#9CA3AF] hover:text-white transition-colors p-2 rounded-full hover:bg-[#1F2937]"
            title="Copy room link"
          >
            <Copy size={16} className={copyingRoom ? "animate-pulse" : ""} />
          </button>
          <button
            onClick={handleExportChat}
            className="text-[#9CA3AF] hover:text-white transition-colors p-2 rounded-full hover:bg-[#1F2937]"
            title="Export chat (.txt)"
          >
            <Download size={16} />
          </button>
          <button
            onClick={handleTriggerWrapped}
            disabled={loadingWrapped}
            className="text-[#FB7185] hover:text-white transition-colors p-2 rounded-full hover:bg-[#FB7185]/10"
            title="My Wrapped"
          >
            <Gift size={20} className={loadingWrapped ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleTriggerRoast}
            disabled={loadingRoast}
            className="text-[#FF6B35] hover:text-white transition-colors p-2 rounded-full hover:bg-[#FF6B35]/10"
            title="Roast Me 🔥"
          >
            <Flame size={20} className={loadingRoast ? "animate-spin" : ""} />
          </button>

          {!isAiRoom && (
            <>
              <button
                onClick={handleCheckCompatibility}
                disabled={loadingCompatibility}
                className="text-[#A78BFA] hover:text-white transition-colors p-2 rounded-full hover:bg-[#A78BFA]/10"
                title="Check Compatibility"
              >
                <Sparkles
                  size={20}
                  className={loadingCompatibility ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={async () => {
                  const { explainMatch } = await import(
                    "@/app/actions/monetization"
                  );
                  const res = await explainMatch(roomId);
                  if (res.explanation) alert(res.explanation);
                  else alert(res.error);
                }}
                className="text-[#FBBF24] hover:text-white transition-colors p-2 rounded-full hover:bg-[#FBBF24]/10"
                title="Why did we match? (Gold Feature)"
              >
                <span className="font-bold text-xs">WHY?</span>
              </button>
            </>
          )}
          <button
            onClick={handleCatchUp}
            disabled={loadingSummary}
            className="text-xs font-medium bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 text-[#A78BFA] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {loadingSummary ? (
              <span className="animate-spin">✨</span>
            ) : (
              <span>✨ Catch Up</span>
            )}
          </button>
          <button className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
        {showScrollToBottom && (
          <button
            onClick={() =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="fixed bottom-28 right-6 bg-[#1F2937] border border-[#A78BFA]/30 text-[#F9FAFB] px-3 py-2 rounded-full shadow-lg hover:bg-[#111827] transition-colors flex items-center gap-2"
          >
            <span className="text-sm">
              Scroll to newest{unreadCount > 0 ? ` (${unreadCount})` : ""}
            </span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex items-center justify-between px-6 pt-4 text-sm text-[#9CA3AF] gap-3">
        <div className="flex items-center gap-2">
          <input
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            placeholder="Search messages"
            className="bg-[#111827] border border-[#A78BFA]/20 rounded-lg px-3 py-2 text-[#F9FAFB] placeholder-[#9CA3AF]/60 focus:outline-none focus:border-[#A78BFA]"
          />
          {filterTerm && (
            <button
              onClick={() => setFilterTerm("")}
              className="text-xs text-[#A78BFA] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="accent-[#A78BFA]"
            />
            Compact mode
          </label>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#FB7185]/20 text-[#FB7185] px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
              <button
                onClick={() => {
                  setUnreadCount(0);
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs text-[#A78BFA] hover:text-white"
              >
                Mark read
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-6 ${compactMode ? "space-y-3" : "space-y-6"}`}
      >
        {messages
          .filter((msg) => {
            if (!filterTerm.trim()) return true;
            const text = (msg.content || "").toLowerCase();
            return text.includes(filterTerm.toLowerCase());
          })
          .map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isAi = msg.is_ai;
          const isPrivate = msg.recipient_id === currentUserId;
          const profile = Array.isArray(msg.profiles)
            ? msg.profiles[0]
            : msg.profiles;
          const senderName = isAi
            ? "Amistala"
            : isMe
            ? "You"
            : profile?.display_name || "User";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                isMe ? "flex-row-reverse" : ""
              } animate-fade-in-up`}
            >
              {!isMe && (
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                    isAi
                      ? "bg-gradient-to-br from-[#A78BFA] to-[#FB7185]"
                      : "bg-[#1F2937]"
                  }`}
                >
                  {isAi ? (
                    <span className="text-white text-xs font-bold">AI</span>
                  ) : (
                    <UserIcon size={14} className="text-[#9CA3AF]" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[70%] ${
                  isMe ? "items-end" : "items-start"
                } flex flex-col`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  {!isMe && (
                    <span
                      className={`text-xs font-medium ${
                        isAi ? "text-[#A78BFA]" : "text-[#9CA3AF]"
                      }`}
                    >
                      {isAi
                        ? "Amistala"
                        : isBlindMode
                        ? "Mystery User"
                        : "User"}
                    </span>
                  )}
                  {!isMe && !isAi && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => handleKudos(msg.sender_id!, senderName)}
                        className="text-[10px] text-[#FBBF24] hover:text-[#F59E0B] transition-colors flex items-center gap-0.5"
                        title="Give Kudos"
                      >
                        ★ Kudos
                      </button>
                      <button
                        onClick={async () => {
                          const { sendGift } = await import(
                            "@/app/actions/monetization"
                          );
                          const res = await sendGift(
                            roomId,
                            "super_like",
                            msg.sender_id!
                          );
                          if (res.success)
                            alert(`❤️ Super Liked ${senderName}!`);
                          else alert(res.error);
                        }}
                        className="text-[10px] text-[#F43F5E] hover:text-[#E11D48] transition-colors flex items-center gap-0.5"
                        title="Super Like (Cost: 50)"
                      >
                        ❤️ Super Like
                      </button>
                    </div>
                  )}
                  {isPrivate && (
                    <span className="text-[10px] text-[#A78BFA] bg-[#A78BFA]/10 px-1 rounded border border-[#A78BFA]/20">
                      Private
                    </span>
                  )}
                </div>

                <div
                  className={`${
                    compactMode ? "px-3 py-2" : "px-4 py-2"
                  } rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-[#A78BFA] text-white rounded-tr-none"
                      : isAi
                      ? isPrivate
                        ? "bg-[#0B1020] text-[#A78BFA] border border-[#A78BFA]/40 rounded-tl-none italic"
                        : "bg-gradient-to-br from-[#1F2937] to-[#111827] text-[#F9FAFB] border border-[#A78BFA]/20 rounded-tl-none"
                      : "bg-[#1F2937] text-[#F9FAFB] rounded-tl-none"
                  } whitespace-pre-wrap`}
                >
                  {msg.media_url && msg.media_type === "image" && (
                    <div className="mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.media_url}
                        alt="Uploaded Image"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                  {msg.media_url && msg.media_type === "audio" && (
                    <div className="mb-2 flex items-center gap-2">
                      <audio
                        controls
                        src={msg.media_url}
                        className="h-8 w-60"
                      />
                    </div>
                  )}
                  {(() => {
                    // Simple markdown link parser for [text](url)
                    const parts = msg.content.split(/(\[[^\]]+\]\([^)]+\))/g);
                    return parts.map((part, i) => {
                      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (match) {
                        return (
                          <a
                            key={i}
                            href={match[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#A78BFA] hover:underline font-medium"
                          >
                            {match[1]}
                          </a>
                        );
                      }
                      return part;
                    });
                  })()}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#6B7280]">
                  <div className="flex items-center gap-2">
                    <span>{formatTime(msg.created_at)}</span>
                    {msg.content && msg.content.trim().length > 0 && (
                      <button
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                        className="text-[#9CA3AF] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
                        title="Copy message"
                      >
                        <Copy size={12} />
                        <span>
                          {copiedMessageId === msg.id ? "Copied" : "Copy"}
                        </span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => toggleReaction(msg.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full border transition-colors ${
                      reactions[msg.id]
                        ? "border-[#FB7185]/50 bg-[#FB7185]/10 text-[#FB7185]"
                        : "border-[#4B5563] text-[#9CA3AF] hover:text-[#FB7185] hover:border-[#FB7185]/50"
                    }`}
                    title="Like message"
                  >
                    <Heart size={12} />
                    <span>{reactions[msg.id] ? "Liked" : "Like"}</span>
                  </button>
                    <button
                      onClick={() => {
                        const preview = msg.content.slice(0, 140);
                        setReplyTo({ id: msg.id, preview });
                        setNewMessage((prev) =>
                          prev
                            ? `${prev}\n> ${preview}\n`
                            : `> ${preview}\n`
                        );
                        inputRef.current?.focus();
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#4B5563] text-[#9CA3AF] hover:text-[#A78BFA] hover:border-[#A78BFA]/50 transition-colors"
                      title="Reply with quote"
                    >
                      <Reply size={12} />
                      <span>Reply</span>
                    </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator (Simulated for AI) */}
        {isAiRoom &&
          messages.length > 0 &&
          messages[messages.length - 1].sender_id === currentUserId && (
            <div className="flex gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-gradient-to-br from-[#A78BFA] to-[#FB7185]">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="bg-[#1F2937] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#A78BFA]/10 bg-[#0B1020]/30">
        {replyTo && (
          <div className="max-w-4xl mx-auto mb-2 px-4 py-2 rounded-xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 text-sm text-[#E5E7EB] flex justify-between items-center">
            <div className="truncate">
              Replying to: <span className="font-semibold">{replyTo.preview}</span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-[#F59E0B] hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
        )}
        {queuedMessages.length > 0 && (
          <div className="max-w-4xl mx-auto mb-3 px-4 py-2 rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-xs text-[#FDE68A] flex justify-between items-center">
            <span>
              {queuedMessages.length} message{queuedMessages.length > 1 ? "s" : ""} queued while offline. They will send automatically when you reconnect.
            </span>
            <button
              className="underline hover:text-white"
              onClick={() => setQueuedMessages([])}
            >
              Clear
            </button>
          </div>
        )}
        {/* Media Preview */}
        {mediaPreview && (
          <div className="mb-2 relative inline-block">
            {mediaFile?.type.startsWith("image/") ? (
              <Image
                src={mediaPreview}
                alt="Preview"
                width={80}
                height={80}
                className="object-cover rounded-lg border border-[#A78BFA]/30"
              />
            ) : (
              <div className="h-10 px-3 bg-[#A78BFA]/20 rounded-lg flex items-center gap-2 text-[#A78BFA] text-xs">
                <Mic size={14} /> Voice Note
              </div>
            )}
            <button
              onClick={cancelMedia}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="mb-2 flex items-center gap-2 text-red-400 animate-pulse text-sm font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Recording...
          </div>
        )}

        {/* Command Suggestions */}
        {newMessage.startsWith("/") && !newMessage.includes(" ") && (
          <div className="absolute bottom-full left-4 mb-2 bg-[#1F2937] border border-[#A78BFA]/20 rounded-xl shadow-xl overflow-hidden min-w-[200px] z-10">
          {slashCommands
            .filter((c) => c.cmd.startsWith(newMessage))
            .map((c) => (
              <button
                key={c.cmd}
                onClick={() => setNewMessage(c.cmd + " ")}
                className="w-full text-left px-4 py-2 hover:bg-[#A78BFA]/10 text-[#F9FAFB] text-sm flex items-center justify-between group"
              >
                <span className="font-medium text-[#A78BFA]">{c.cmd}</span>
                <span className="text-[#9CA3AF] text-xs group-hover:text-[#D1D5DB]">
                  {c.desc}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Quick prompts */}
        <div className="max-w-4xl mx-auto mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setNewMessage(p);
                inputRef.current?.focus();
              }}
              className="text-xs px-3 py-2 rounded-full border border-[#A78BFA]/20 bg-[#0B1020] text-[#E5E7EB] hover:border-[#A78BFA]/40 hover:bg-[#111827] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        <form
          ref={formRef}
          onSubmit={handleSend}
          className="flex gap-2 max-w-4xl mx-auto items-end"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] p-3 rounded-xl transition-colors mb-[1px]"
            title="Upload Image"
          >
            <ImageIcon size={20} />
          </button>

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`${
              isRecording
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB]"
            } p-3 rounded-xl transition-colors mb-[1px]`}
            title={isRecording ? "Stop Recording" : "Record Voice Note"}
          >
            <Mic size={20} />
          </button>

          <input
            type="text"
            value={newMessage}
            ref={inputRef}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                formRef.current?.requestSubmit();
              } else if (e.key === "Escape") {
                setNewMessage("");
                if (typeof window !== "undefined") localStorage.removeItem(draftKey);
              }
            }}
            placeholder={`Message ${isAiRoom ? "Amistala" : roomName}...`}
            className="flex-1 bg-[#050814] border border-[#A78BFA]/20 rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#A78BFA] focus:ring-1 focus:ring-[#A78BFA] transition-all"
          />
          <button
            type="button"
            onClick={async () => {
              const { sendGift } = await import("@/app/actions/monetization");
              await sendGift(roomId, "coffee", currentUserId);
            }}
            className="bg-[#1F2937] hover:bg-[#374151] text-[#FBBF24] p-3 rounded-xl transition-colors flex items-center justify-center mb-[1px]"
            title="Send Coffee (Gift)"
          >
            ☕
          </button>
          <button
            type="submit"
            disabled={
              (!newMessage.trim() && !mediaFile) ||
              sending ||
              newMessage.length > MAX_MESSAGE_LENGTH ||
              !online
            }
            className="bg-[#A78BFA] hover:bg-[#A78BFA]/90 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-[1px]"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="max-w-4xl mx-auto flex justify-between mt-2 text-xs text-[#9CA3AF]">
          <span>
            {nearLimit
              ? "Approaching message limit"
              : online
              ? "Enter or Cmd/Ctrl+Enter to send"
              : "Offline — messages paused"}
          </span>
          <span className={nearLimit ? "text-[#FBBF24]" : ""}>
            {newMessage.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
