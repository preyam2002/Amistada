"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { introduceUser } from "@/app/actions/introduce";

export function IntroduceButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const handleIntroduce = () => {
    setError(null);
    startTransition(async () => {
      const result = (await introduceUser(query)) as any;
      if (result.error) {
        setError(result.error);
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      } else if (result && "id" in result) {
        // Wait, introduceUser redirects, so we might not need to handle result if it redirects on server.
        // But introduceUser returns { error } or redirects.
        // If it redirects, it throws NEXT_REDIRECT error which is caught by Next.js.
        // If it returns, it's an error.
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Looking for someone specific?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#A78BFA]/50 text-white placeholder:text-white/30"
      />
      <button
        onClick={handleIntroduce}
        disabled={isPending}
        className="w-full py-2 px-3 bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 text-[#A78BFA] rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium border border-[#A78BFA]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {query ? "Searching..." : "Finding match..."}
          </>
        ) : (
          <>
            <Plus size={16} />
            {query ? "Find Match" : "Introduce me"}
          </>
        )}
      </button>
      {error && <div className="text-xs text-red-400 text-center">{error}</div>}
    </div>
  );
}
