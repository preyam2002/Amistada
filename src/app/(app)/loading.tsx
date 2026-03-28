export default function AppLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#050814]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#A78BFA]/30 border-t-[#A78BFA] animate-spin" />
        <p className="text-[#9CA3AF] text-sm">Loading...</p>
      </div>
    </div>
  );
}
