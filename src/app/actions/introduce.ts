"use server";

import { findAndCreateMatch } from "./match";
import { redirect } from "next/navigation";

// Legacy function that now delegates to the new match system
export async function introduceUser(query?: string) {
  const result = await findAndCreateMatch(query);
  
  if (result && "error" in result) {
    // Redirect with error to show in rooms page
    if (result.error === "no_match") {
      redirect("/rooms?error=no_match");
    } else if (result.error === "no_new_matches") {
      redirect("/rooms?error=no_new_matches");
    } else {
      redirect(`/rooms?error=${encodeURIComponent(result.error)}`);
    }
  }
  
  // If redirect didn't happen, the function already redirected
  // This is a TypeScript type assertion to satisfy the return type
  throw new Error("Redirect should have occurred");
}
