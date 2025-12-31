"use client";

import { signup, signInWithGoogle } from "../actions";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050814] p-4">
      <div className="w-full max-w-md bg-[#0B1020] rounded-2xl p-8 border border-[#A78BFA]/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#A78BFA] to-[#FB7185] mb-2">
            Join Amistala
          </h1>
          <p className="text-[#9CA3AF]">Create your cozy space</p>
        </div>

        <form
          action={async (formData) => {
            setLoading(true);
            const res = await signup(formData);
            if (res?.error) {
              alert(res.error);
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-1">
              Display Name
            </label>
            <input
              name="displayName"
              type="text"
              required
              className="w-full bg-[#050814] border border-[#A78BFA]/20 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#A78BFA] transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#050814] border border-[#A78BFA]/20 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#A78BFA] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-[#050814] border border-[#A78BFA]/20 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#A78BFA] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#A78BFA] to-[#FB7185] hover:opacity-90 rounded-xl font-medium text-white shadow-lg shadow-[#A78BFA]/20 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <form
          action={async () => {
            await signInWithGoogle();
          }}
        >
          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 bg-[#1F2937] hover:bg-[#374151] rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-1.19-.58z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#9CA3AF]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#A78BFA] hover:text-[#FB7185] transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
