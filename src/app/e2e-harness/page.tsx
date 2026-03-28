"use client";

import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import { ToastProvider, useToast } from "@/components/Toast";
import { CompatibilityCard } from "@/components/CompatibilityCard";
import { WrappedStory } from "@/components/WrappedStory";
import { RoastBadge } from "@/components/RoastBadge";
import { SoulCard } from "@/components/SoulCard";
import { Modal, Button, Input, Badge, Card, Avatar, Textarea } from "@/components/ui";

const mockMessages = [
  {
    id: "msg-1",
    content: "Hey there! Welcome to the room.",
    sender_id: null,
    recipient_id: null,
    is_ai: true,
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "msg-2",
    content: "Thanks! Excited to be here.",
    sender_id: "test-user-1",
    recipient_id: null,
    is_ai: false,
    created_at: new Date(Date.now() - 240000).toISOString(),
    profiles: { display_name: "Test User", avatar_color: "" },
  },
  {
    id: "msg-3",
    content: "What are your hobbies?",
    sender_id: null,
    recipient_id: null,
    is_ai: true,
    created_at: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: "msg-4",
    content: "I love coding and hiking!",
    sender_id: "test-user-1",
    recipient_id: null,
    is_ai: false,
    created_at: new Date(Date.now() - 120000).toISOString(),
    profiles: { display_name: "Test User", avatar_color: "" },
  },
  {
    id: "msg-5",
    content: "This is a private message just for you",
    sender_id: null,
    recipient_id: "test-user-1",
    is_ai: true,
    created_at: new Date(Date.now() - 60000).toISOString(),
  },
];

const mockMembers = [
  { id: "test-user-1", display_name: "Test User", avatar_color: "" },
  { id: "test-user-2", display_name: "Match User", avatar_color: "" },
];

const mockCompatibility = {
  score: 87,
  summary: "Cosmic Vibes",
  reason: "You both share a love for creative pursuits and deep conversations.",
  shared_interests: ["Coding", "Hiking", "Music"],
};

const mockWrapped = {
  totalMessages: 142,
  totalWords: 3847,
  topEmoji: "None",
  analysis: {
    persona: "The Architect",
    vibe: "Thoughtful and systematic with creative bursts",
    top_topics: ["Technology", "Philosophy", "Music"],
    communication_style: "Direct & Witty",
  },
};

const mockRoast = {
  roastTitle: "The Over-Thinker",
  roastDescription:
    "You spend more time crafting the perfect message than actually sending one.",
  burnLevel: "Medium" as const,
};

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div data-testid="toast-demo" className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => toast("Success message", "success")} data-testid="toast-success">
        Success Toast
      </Button>
      <Button size="sm" onClick={() => toast("Error message", "error")} data-testid="toast-error">
        Error Toast
      </Button>
      <Button size="sm" onClick={() => toast("Warning message", "warning")} data-testid="toast-warning">
        Warning Toast
      </Button>
      <Button size="sm" onClick={() => toast("Info message", "info")} data-testid="toast-info">
        Info Toast
      </Button>
    </div>
  );
}

export default function E2EHarnessPage() {
  const [activeSection, setActiveSection] = useState<string>("chat");
  const [showCompat, setShowCompat] = useState(false);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showRoast, setShowRoast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const sections = ["chat", "components", "modals", "toasts", "cards"];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#050814] text-[#F9FAFB]">
        {/* Section Tabs */}
        <div className="sticky top-0 z-50 bg-[#0B1020] border-b border-[#A78BFA]/20 px-4 py-2 flex gap-2 overflow-x-auto" data-testid="harness-tabs">
          {sections.map((s) => (
            <button
              key={s}
              data-testid={`tab-${s}`}
              onClick={() => setActiveSection(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === s
                  ? "bg-[#A78BFA] text-white"
                  : "bg-[#1F2937] text-[#9CA3AF] hover:text-white"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Chat Section */}
        {activeSection === "chat" && (
          <div data-testid="section-chat" className="h-[calc(100vh-52px)]">
            <ChatWindow
              roomId="test-room-1"
              initialMessages={mockMessages}
              currentUserId="test-user-1"
              roomName="Test Room"
              isAiRoom={true}
              members={mockMembers}
            />
          </div>
        )}

        {/* Components Section */}
        {activeSection === "components" && (
          <div data-testid="section-components" className="p-8 space-y-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold">UI Components</h2>

            {/* Buttons */}
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-3" data-testid="button-variants">
                <Button variant="primary" data-testid="btn-primary">Primary</Button>
                <Button variant="secondary" data-testid="btn-secondary">Secondary</Button>
                <Button variant="outline" data-testid="btn-outline">Outline</Button>
                <Button variant="ghost" data-testid="btn-ghost">Ghost</Button>
                <Button variant="destructive" data-testid="btn-destructive">Destructive</Button>
                <Button variant="primary" loading data-testid="btn-loading">Loading</Button>
                <Button variant="primary" disabled data-testid="btn-disabled">Disabled</Button>
              </div>
              <div className="flex flex-wrap gap-3 mt-4" data-testid="button-sizes">
                <Button size="xs" data-testid="btn-xs">XS</Button>
                <Button size="sm" data-testid="btn-sm">SM</Button>
                <Button size="md" data-testid="btn-md">MD</Button>
                <Button size="lg" data-testid="btn-lg">LG</Button>
                <Button size="xl" data-testid="btn-xl">XL</Button>
              </div>
            </Card>

            {/* Inputs */}
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inputs</h3>
              <div className="space-y-4" data-testid="input-variants">
                <Input placeholder="Default input" data-testid="input-default" />
                <Input placeholder="Error input" error data-testid="input-error" />
                <Input placeholder="Disabled input" disabled data-testid="input-disabled" />
                <Textarea placeholder="Textarea" rows={3} data-testid="textarea-default" />
              </div>
            </Card>

            {/* Badges */}
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-3" data-testid="badge-variants">
                <Badge variant="primary" data-testid="badge-primary">Primary</Badge>
                <Badge variant="secondary" data-testid="badge-secondary">Secondary</Badge>
                <Badge variant="success" data-testid="badge-success">Success</Badge>
                <Badge variant="warning" data-testid="badge-warning">Warning</Badge>
                <Badge variant="error" data-testid="badge-error">Error</Badge>
              </div>
            </Card>

            {/* Avatars */}
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Avatars</h3>
              <div className="flex items-center gap-4" data-testid="avatar-variants">
                <Avatar name="AI" variant="gradient" size="lg" data-testid="avatar-gradient" />
                <Avatar name="John" variant="default" size="lg" data-testid="avatar-default" />
                <Avatar name="Test" size="sm" data-testid="avatar-sm" />
                <Avatar name="XL" size="xl" data-testid="avatar-xl" />
              </div>
            </Card>
          </div>
        )}

        {/* Modals Section */}
        {activeSection === "modals" && (
          <div data-testid="section-modals" className="p-8 space-y-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold">Modals & Overlays</h2>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowCompat(true)} data-testid="open-compat">
                Compatibility Card
              </Button>
              <Button onClick={() => setShowWrapped(true)} data-testid="open-wrapped">
                Wrapped Story
              </Button>
              <Button onClick={() => setShowRoast(true)} data-testid="open-roast">
                Roast Badge
              </Button>
              <Button onClick={() => setModalOpen(true)} data-testid="open-modal">
                Generic Modal
              </Button>
            </div>

            {showCompat && (
              <CompatibilityCard
                report={mockCompatibility}
                roomName="Test Room"
                onClose={() => setShowCompat(false)}
              />
            )}
            {showWrapped && (
              <WrappedStory
                stats={mockWrapped}
                onClose={() => setShowWrapped(false)}
              />
            )}
            {showRoast && (
              <RoastBadge
                roast={mockRoast}
                onClose={() => setShowRoast(false)}
              />
            )}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} data-testid="generic-modal">
              <div className="p-8" data-testid="modal-content">
                <h3 className="text-xl font-bold mb-2">Test Modal</h3>
                <p className="text-[#9CA3AF]">This is a generic modal for testing.</p>
              </div>
            </Modal>
          </div>
        )}

        {/* Toasts Section */}
        {activeSection === "toasts" && (
          <div data-testid="section-toasts" className="p-8 space-y-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold">Toast Notifications</h2>
            <ToastDemo />
          </div>
        )}

        {/* Cards Section */}
        {activeSection === "cards" && (
          <div data-testid="section-cards" className="p-8 space-y-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold">Cards & Profiles</h2>
            <div className="flex justify-center">
              <SoulCard
                displayName="Test User"
                persona={["The Architect", "The Explorer"]}
                interests={["Coding", "Hiking", "Music", "Reading", "Travel"]}
              />
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
