"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import {
  Settings,
  User,
  Shield,
  BarChart3,
  Trash2,
  Download,
  Mail,
  Calendar,
} from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { useToast } from "@/components/Toast";
import { deleteAccount, exportUserData } from "./actions";

type SettingsClientProps = {
  email: string;
  displayName: string;
  createdAt: string;
  stats: {
    messages: number;
    rooms: number;
    reputation: number;
  };
};

export default function SettingsClient({
  email,
  displayName,
  createdAt,
  stats,
}: SettingsClientProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await exportUserData();
      if (error) {
        toast(error, "error");
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amistada-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Data exported successfully!", "success");
    } catch {
      toast("Failed to export data", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await deleteAccount();
      if (error) {
        toast(error, "error");
        setDeleting(false);
        return;
      }
      toast("Account deleted. Goodbye!", "info");
    } catch {
      toast("Failed to delete account", "error");
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#050814] p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Settings size={28} className="text-[#A78BFA]" />
          <h1 className="text-3xl font-bold text-[#F9FAFB]">Settings</h1>
        </div>

        {/* Account Info */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-[#F9FAFB] flex items-center gap-2 mb-6">
            <User size={20} className="text-[#A78BFA]" />
            Account
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#A78BFA]/10">
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <User size={16} />
                <span className="text-sm">Display Name</span>
              </div>
              <span className="text-[#F9FAFB] text-sm font-medium">{displayName}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#A78BFA]/10">
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <Mail size={16} />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-[#F9FAFB] text-sm font-medium">{email}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <Calendar size={16} />
                <span className="text-sm">Member Since</span>
              </div>
              <span className="text-[#F9FAFB] text-sm font-medium">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-[#F9FAFB] flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-[#FB7185]" />
            Your Stats
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#1F2937]/50 rounded-xl border border-[#A78BFA]/10">
              <div className="text-2xl font-bold text-[#A78BFA]">{stats.messages}</div>
              <div className="text-xs text-[#9CA3AF] mt-1">Messages</div>
            </div>
            <div className="text-center p-4 bg-[#1F2937]/50 rounded-xl border border-[#FB7185]/10">
              <div className="text-2xl font-bold text-[#FB7185]">{stats.rooms}</div>
              <div className="text-xs text-[#9CA3AF] mt-1">Rooms</div>
            </div>
            <div className="text-center p-4 bg-[#1F2937]/50 rounded-xl border border-[#FBBF24]/10">
              <div className="text-2xl font-bold text-[#FBBF24]">{stats.reputation}</div>
              <div className="text-xs text-[#9CA3AF] mt-1">Reputation</div>
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-[#F9FAFB] flex items-center gap-2 mb-6">
            <Shield size={20} className="text-[#34D399]" />
            Data & Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#F9FAFB]">Export Your Data</p>
                <p className="text-xs text-[#9CA3AF]">Download all your messages, profile, and activity</p>
              </div>
              <Button
                onClick={handleExport}
                loading={exporting}
                variant="secondary"
                size="sm"
              >
                <Download size={14} className="mr-1" />
                Export
              </Button>
            </div>

            <div className="pt-4 border-t border-[#A78BFA]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-400">Delete Account</p>
                  <p className="text-xs text-[#9CA3AF]">Permanently delete your account and all data</p>
                </div>
                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      loading={deleting}
                      variant="ghost"
                      size="sm"
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      Confirm Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Sign Out */}
        <form action={logout}>
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            fullWidth
          >
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
