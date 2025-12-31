import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import * as fs from "fs";
import * as path from "path";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase server env vars are missing");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (e) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          fs.appendFileSync(
            path.join(process.cwd(), "debug.log"),
            `Cookie set error: ${e}\n`
          );
        }
      },
    },
  });
}
