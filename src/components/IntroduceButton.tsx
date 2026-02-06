"use client";

import { useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
import { findAndCreateMatch } from "@/app/actions/match";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

export function IntroduceButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const handleIntroduce = () => {
    setError(null);
    startTransition(async () => {
      const result = await findAndCreateMatch(query);
      if (result && "error" in result) {
        const errorMsg = result.error === "no_match" 
          ? "No matches found yet. Chat more with Amistala to build your profile!"
          : result.error === "no_new_matches"
          ? "No new matches available right now. Check back later!"
          : result.error || "Failed to find a match. Please try again.";
        
        setError(errorMsg);
        setTimeout(() => setError(null), 5000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="text"
        placeholder="Looking for someone specific?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        startIcon={<Search size={16} />}
        className="text-sm"
      />
      <Button
        onClick={handleIntroduce}
        loading={isPending}
        variant="outline"
        size="sm"
        fullWidth
      >
        {isPending ? (
          query ? "Searching..." : "Finding match..."
        ) : (
          <>
            <Plus size={16} className="mr-2" />
            {query ? "Find Match" : "Introduce me"}
          </>
        )}
      </Button>
      {error && (
        <div className="text-xs text-red-400 text-center bg-red-500/5 p-2 rounded-lg border border-red-500/10">
          {error}
        </div>
      )}
    </div>
  );
}
