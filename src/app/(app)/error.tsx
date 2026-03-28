"use client";

import { Button } from "@/components/ui";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#050814] p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#F9FAFB] mb-2">Something went wrong</h2>
          <p className="text-[#9CA3AF] text-sm">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <Button onClick={reset} variant="primary" size="lg">
          <RotateCcw size={16} className="mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
