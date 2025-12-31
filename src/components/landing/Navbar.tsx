"use client";

// import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Navbar() {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
  );
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(12px)"]
  );
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <motion.nav
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
        borderBottomColor: `rgba(228, 228, 231, ${borderOpacity.get()})`,
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-transparent transition-colors duration-300 dark:border-zinc-800"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-600 rounded-lg">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Amistada
        </span>
      </div>
      <div className="flex items-center gap-4">
        {/* <Link
          href="/login"
          className="text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Sign Up
        </Link> */}
      </div>
    </motion.nav>
  );
}
