"use client";

import { useRef, useState, useEffect } from "react";
import { Send, ImageIcon, Mic, X } from "lucide-react";
import Image from "next/image";

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
  "What's a hobby that makes you lose track of time?",
  "What's the best book or show you've enjoyed lately?",
  "What's a small daily habit you're proud of?",
];

const MAX_MESSAGE_LENGTH = 1000;

type ChatInputProps = {
  roomId: string;
  isAiRoom: boolean;
  roomName: string;
  online: boolean;
  sending: boolean;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSend: (e: React.FormEvent) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  replyTo: { id: string; preview: string } | null;
  setReplyTo: (r: { id: string; preview: string } | null) => void;
  queuedMessages: string[];
  setQueuedMessages: (q: string[]) => void;
  mediaFile: File | null;
  setMediaFile: (f: File | null) => void;
  mediaPreview: string | null;
  setMediaPreview: (p: string | null) => void;
};

export function ChatInput({
  isAiRoom,
  roomName,
  online,
  sending,
  newMessage,
  setNewMessage,
  onSend,
  onTyping,
  onStopTyping,
  replyTo,
  setReplyTo,
  queuedMessages,
  setQueuedMessages,
  mediaFile,
  setMediaFile,
  mediaPreview,
  setMediaPreview,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [nearLimit, setNearLimit] = useState(false);
  const draftKey = `chat-draft-${isAiRoom ? "ai" : roomName}`;

  useEffect(() => {
    setNearLimit(newMessage.length > MAX_MESSAGE_LENGTH - 50);
  }, [newMessage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });
        setMediaFile(audioFile);
        setMediaPreview(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      // Mic access denied - handled in parent
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const cancelMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 border-t border-[#A78BFA]/10 bg-[#0B1020]/30">
      {replyTo && (
        <div className="max-w-4xl mx-auto mb-2 px-4 py-2 rounded-xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 text-sm text-[#E5E7EB] flex justify-between items-center">
          <div className="truncate">
            Replying to: <span className="font-semibold">{replyTo.preview}</span>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-[#F59E0B] hover:text-white text-xs">
            Cancel
          </button>
        </div>
      )}

      {queuedMessages.length > 0 && (
        <div className="max-w-4xl mx-auto mb-3 px-4 py-2 rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-xs text-[#FDE68A] flex justify-between items-center">
          <span>
            {queuedMessages.length} message{queuedMessages.length > 1 ? "s" : ""} queued while offline.
          </span>
          <button className="underline hover:text-white" onClick={() => setQueuedMessages([])}>
            Clear
          </button>
        </div>
      )}

      {mediaPreview && (
        <div className="mb-2 relative inline-block">
          {mediaFile?.type.startsWith("image/") ? (
            <Image src={mediaPreview} alt="Preview" width={80} height={80} className="object-cover rounded-lg border border-[#A78BFA]/30" />
          ) : (
            <div className="h-10 px-3 bg-[#A78BFA]/20 rounded-lg flex items-center gap-2 text-[#A78BFA] text-xs">
              <Mic size={14} /> Voice Note
            </div>
          )}
          <button onClick={cancelMedia} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
            <X size={12} />
          </button>
        </div>
      )}

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
                <span className="text-[#9CA3AF] text-xs group-hover:text-[#D1D5DB]">{c.desc}</span>
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

      <form ref={formRef} onSubmit={onSend} className="flex gap-2 max-w-4xl mx-auto items-end">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />

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
          onChange={(e) => {
            setNewMessage(e.target.value);
            if (e.target.value.trim()) onTyping();
            else onStopTyping();
          }}
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
          type="submit"
          disabled={(!newMessage.trim() && !mediaFile) || sending || newMessage.length > MAX_MESSAGE_LENGTH || !online}
          className="bg-[#A78BFA] hover:bg-[#A78BFA]/90 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-[1px]"
        >
          <Send size={20} />
        </button>
      </form>

      <div className="max-w-4xl mx-auto flex justify-between mt-2 text-xs text-[#9CA3AF]">
        <span>
          {nearLimit ? "Approaching message limit" : online ? "Enter or Cmd/Ctrl+Enter to send" : "Offline — messages paused"}
        </span>
        <span className={nearLimit ? "text-[#FBBF24]" : ""}>
          {newMessage.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </div>
  );
}
