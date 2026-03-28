import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { User, Heart, Search, Sparkles, Save, FileText } from "lucide-react";
import { Card } from "@/components/ui";
import { Input } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

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
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050814]">
        <div className="text-center text-[#9CA3AF]">
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#050814] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-8">Your Profile</h1>

        <Card variant="elevated" className="p-8">
          <form action={updateProfile} className="space-y-8">
            {/* Display Name */}
            <div className="space-y-3">
              <label
                htmlFor="display_name"
                className="flex items-center gap-2 text-sm font-medium text-[#A78BFA]"
              >
                <User size={16} />
                Display Name
              </label>
              <Input
                type="text"
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name}
                placeholder="How should we call you?"
                startIcon={<User size={18} />}
              />
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label
                htmlFor="interests"
                className="flex items-center gap-2 text-sm font-medium text-[#FB7185]"
              >
                <Heart size={16} />
                Interests (comma separated)
              </label>
              <Textarea
                id="interests"
                name="interests"
                defaultValue={profile.interests?.join(", ")}
                placeholder="Coding, Hiking, Sci-Fi..."
                rows={3}
              />
              <p className="text-xs text-[#9CA3AF]">
                Amistala uses these to find you matches.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-3">
              <label
                htmlFor="bio"
                className="flex items-center gap-2 text-sm font-medium text-[#60A5FA]"
              >
                <FileText size={16} />
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio || ""}
                placeholder="Tell people a bit about yourself..."
                rows={3}
              />
            </div>

            {/* Looking For */}
            <div className="space-y-3">
              <label
                htmlFor="looking_for"
                className="flex items-center gap-2 text-sm font-medium text-[#34D399]"
              >
                <Search size={16} />
                Looking For (comma separated)
              </label>
              <Textarea
                id="looking_for"
                name="looking_for"
                defaultValue={profile.looking_for?.join(", ")}
                placeholder="Co-founder, Gym buddy, Mentor..."
                rows={2}
              />
            </div>

            {/* Persona (Read Only / AI Generated) */}
            <div className="space-y-3 opacity-90">
              <label className="flex items-center gap-2 text-sm font-medium text-[#FBBF24]">
                <Sparkles size={16} />
                AI Persona (Auto-generated)
              </label>
              <div className="p-4 bg-[#1F2937]/50 border border-[#A78BFA]/10 rounded-xl">
                {profile.persona && profile.persona.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.persona.map((persona: string) => (
                      <Badge key={persona} variant="primary">
                        {persona}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#9CA3AF] italic">
                    Chat with Amistala to generate your persona!
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
              >
                <Save size={18} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
