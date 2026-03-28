export default function RoomLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#050814]">
      {/* Header skeleton */}
      <div className="h-16 border-b border-[#A78BFA]/10 flex items-center px-6 bg-[#0B1020]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1F2937] animate-pulse" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-[#1F2937] rounded animate-pulse" />
            <div className="w-16 h-3 bg-[#1F2937] rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-6 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <div className="w-8 h-8 rounded-full bg-[#1F2937] animate-pulse flex-shrink-0" />
            <div className={`space-y-2 ${i % 2 === 0 ? "" : "items-end"}`}>
              <div className={`h-4 bg-[#1F2937] rounded animate-pulse ${i % 2 === 0 ? "w-48" : "w-36"}`} />
              <div className={`h-12 bg-[#1F2937] rounded-2xl animate-pulse ${i % 2 === 0 ? "w-64" : "w-52"}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="p-4 border-t border-[#A78BFA]/10">
        <div className="max-w-4xl mx-auto flex gap-2">
          <div className="flex-1 h-12 bg-[#1F2937] rounded-xl animate-pulse" />
          <div className="w-12 h-12 bg-[#1F2937] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
