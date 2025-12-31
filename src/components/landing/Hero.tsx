"use client";

import Link from "next/link";
// import { ArrowRight } from "lucide-react";
import { Scene } from "./Scene";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-16 text-center overflow-hidden">
      <Scene />

      <div className="max-w-4xl mx-auto space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50/80 backdrop-blur-sm rounded-full dark:bg-blue-900/30 dark:text-blue-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          New: AI-Powered Introductions
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-7xl"
        >
          Connect with people who <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
            truly understand you.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-300 sm:text-xl backdrop-blur-sm bg-white/30 dark:bg-black/30 p-4 rounded-xl"
        >
          Amistada uses advanced AI to match you with like-minded individuals
          for meaningful conversations. No more small talk, just real
          connections.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          {/* <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/30"
          >
            Start Chatting Now
            <ArrowRight className="w-5 h-5" />
          </Link> */}
          <Link
            href="/about"
            className="px-8 py-4 text-base font-semibold text-zinc-900 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-full hover:bg-zinc-50 dark:bg-zinc-900/80 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all"
          >
            Learn how it works
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
