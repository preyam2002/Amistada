"use client";

import {
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  Zap,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    name: "AI-Powered Matching",
    description:
      "Vector embeddings analyze your interests, personality, and communication style to find genuinely compatible conversation partners.",
    icon: Sparkles,
  },
  {
    name: "Smart Introductions",
    description:
      "Our AI crafts personalized introductions between matches, highlighting shared interests and conversation starters.",
    icon: Globe,
  },
  {
    name: "Personality Archetypes",
    description:
      "Discover your persona — Poet, Architect, Explorer, Sage, and more — through natural conversation with our AI onboarding.",
    icon: Shield,
  },
  {
    name: "Group Rooms",
    description:
      "Chat in AI-moderated introduction rooms or create topic-based spaces for communities with shared passions.",
    icon: Users,
  },
  {
    name: "AI Wingman",
    description:
      "Conversations going quiet? Our AI wingman steps in with thoughtful prompts to keep the connection flowing.",
    icon: Zap,
  },
  {
    name: "Wrapped & Roasts",
    description:
      "Get your personalized chat Wrapped with stats and insights, or let the AI roast your conversation style.",
    icon: MessageSquare,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-semibold leading-7 text-blue-600"
          >
            Everything you need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
          >
            Better conversations, better connections.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400"
          >
            We&apos;ve built a platform that puts meaningful interaction first.
            Here&apos;s how we help you connect.
          </motion.p>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              variants={item}
              className="flex flex-col items-start group"
            >
              <div className="flex items-center justify-center w-10 h-10 mb-4 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <feature.icon
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-semibold leading-8 text-zinc-900 dark:text-white">
                {feature.name}
              </h3>
              <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
