import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050814] via-[#0B1020] to-[#111827] p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#FB7185]">
          404
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#F9FAFB] mb-2">Page not found</h2>
          <p className="text-[#9CA3AF]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#A78BFA] hover:bg-[#A78BFA]/90 text-white rounded-xl font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
