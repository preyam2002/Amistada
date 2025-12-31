export default async function RoomsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { error } = searchParams;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF] p-4">
      {error === "no_match" && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 max-w-md text-center">
          <p className="font-medium mb-1">No new matches found right now.</p>
          <p className="text-sm opacity-80">
            Try chatting more with Amistala to build your profile, or check back
            later!
          </p>
        </div>
      )}
      <div className="text-center">
        <h2 className="text-xl font-medium text-[#F9FAFB] mb-2">
          Welcome to Amistala
        </h2>
        <p>Select a room to start chatting or ask for an introduction.</p>
      </div>
    </div>
  );
}
