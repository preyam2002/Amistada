"use server";

import { updateUserProfileData } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = formData.get("display_name") as string;
  const bio = formData.get("bio") as string;
  const interestsRaw = formData.get("interests") as string;
  const lookingForRaw = formData.get("looking_for") as string;

  const interests = interestsRaw
    ? interestsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const lookingFor = lookingForRaw
    ? lookingForRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  await updateUserProfileData(user.id, {
    display_name: displayName,
    bio,
    interests,
    looking_for: lookingFor,
  });

  revalidatePath("/profile");
  revalidatePath("/rooms"); // Update sidebar if name changed
}
