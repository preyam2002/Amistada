import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { User, Heart, Search, Sparkles } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#050814] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-8">Your Profile</h1>

        <div className="bg-[#0B1020] border border-[#A78BFA]/10 rounded-2xl p-6 shadow-xl">
          <form action={updateProfile} className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label
                htmlFor="display_name"
                className="flex items-center gap-2 text-sm font-medium text-[#A78BFA]"
              >
                <User size={16} />
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name}
                className="w-full bg-[#1F2937] border border-[#A78BFA]/20 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#A78BFA] transition-colors"
                placeholder="How should we call you?"
              />
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label
                htmlFor="interests"
                className="flex items-center gap-2 text-sm font-medium text-[#FB7185]"
              >
                <Heart size={16} />
                Interests (comma separated)
              </label>
              <textarea
                id="interests"
                name="interests"
                defaultValue={profile.interests?.join(", ")}
                className="w-full bg-[#1F2937] border border-[#A78BFA]/20 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#FB7185] transition-colors min-h-[100px]"
                placeholder="Coding, Hiking, Sci-Fi..."
              />
              <p className="text-xs text-[#9CA3AF]">
                Amistala uses these to find you matches.
              </p>
            </div>

            {/* Looking For */}
            <div className="space-y-2">
              <label
                htmlFor="looking_for"
                className="flex items-center gap-2 text-sm font-medium text-[#34D399]"
              >
                <Search size={16} />
                Looking For (comma separated)
              </label>
              <textarea
                id="looking_for"
                name="looking_for"
                defaultValue={profile.looking_for?.join(", ")}
                className="w-full bg-[#1F2937] border border-[#A78BFA]/20 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#34D399] transition-colors min-h-[80px]"
                placeholder="Co-founder, Gym buddy, Mentor..."
              />
            </div>

            {/* Persona (Read Only / AI Generated) */}
            <div className="space-y-2 opacity-80">
              <label className="flex items-center gap-2 text-sm font-medium text-[#FBBF24]">
                <Sparkles size={16} />
                AI Persona (Auto-generated)
              </label>
              <div className="w-full bg-[#1F2937]/50 border border-[#A78BFA]/10 rounded-xl px-4 py-3 text-[#9CA3AF] italic">
                {profile.persona && profile.persona.length > 0
                  ? profile.persona.join(", ")
                  : "Chat with Amistala to generate your persona!"}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#A78BFA] to-[#FB7185] hover:opacity-90 text-white font-medium py-3 rounded-xl transition-opacity shadow-lg shadow-[#A78BFA]/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
