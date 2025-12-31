"use client";

import React, { useState } from "react";
import {
  Send,
  Bot,
  Sparkles,
  Terminal,
  Leaf,
  Briefcase,
  Sun,
  Moon,
  Droplets,
  Box,
  Type,
  Zap,
  Coffee,
  Paperclip,
} from "lucide-react";

// Mock Conversation Data
const mockConversation = [
  {
    id: 1,
    role: "user",
    content:
      "Hi, I'm looking for some advice on how to improve my daily routine.",
    timestamp: "10:00 AM",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "Hello! I'd be happy to help. Are you looking to focus on productivity, health, or maybe a mix of both?",
    timestamp: "10:01 AM",
  },
  {
    id: 3,
    role: "user",
    content:
      "Mostly productivity. I feel like I waste a lot of time in the mornings.",
    timestamp: "10:02 AM",
  },
  {
    id: 4,
    role: "assistant",
    content:
      "I see. A solid morning routine can be a game changer. Have you tried the 'eat the frog' method? It involves tackling your hardest task first thing in the morning.",
    timestamp: "10:03 AM",
  },
  {
    id: 5,
    role: "user",
    content: "That sounds interesting. I usually just check my emails first.",
    timestamp: "10:04 AM",
  },
  {
    id: 6,
    role: "assistant",
    content:
      "Checking emails first can often put you in a reactive mode. Try dedicating the first hour to deep work instead. Would you like a sample schedule?",
    timestamp: "10:05 AM",
  },
];

// Theme Definitions
const themes = [
  {
    id: "modern",
    name: "Modern Clean",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-gray-50 text-gray-900 font-sans",
    chatArea: "bg-white shadow-sm border border-gray-200 rounded-2xl",
    userBubble: "bg-blue-600 text-white rounded-br-none",
    botBubble: "bg-gray-100 text-gray-800 rounded-bl-none",
    inputArea: "bg-white border-t border-gray-100",
    input: "bg-gray-50 border-gray-200 focus:ring-blue-500 rounded-full",
    button: "bg-blue-600 hover:bg-blue-700 text-white rounded-full",
    header: "border-b border-gray-100 bg-white/80 backdrop-blur-md",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: <Zap className="w-4 h-4" />,
    container: "bg-black text-green-400 font-mono",
    chatArea:
      "bg-gray-900 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] rounded-none",
    userBubble:
      "bg-green-900/50 text-green-400 border border-green-500 rounded-none",
    botBubble:
      "bg-purple-900/50 text-purple-400 border border-purple-500 rounded-none",
    inputArea: "bg-black border-t-2 border-green-500",
    input:
      "bg-gray-900 border-green-500 text-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)] rounded-none placeholder-green-700",
    button:
      "bg-green-600 hover:bg-green-500 text-black font-bold rounded-none uppercase tracking-widest",
    header: "border-b-2 border-green-500 bg-black",
  },
  {
    id: "brutalism",
    name: "Brutalism",
    icon: <Box className="w-4 h-4" />,
    container: "bg-[#f0f0f0] text-black font-bold",
    chatArea:
      "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none",
    userBubble:
      "bg-[#ff90e8] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none",
    botBubble:
      "bg-[#23a094] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none",
    inputArea: "bg-white border-t-4 border-black",
    input:
      "bg-white border-2 border-black focus:bg-yellow-100 rounded-none font-bold placeholder-gray-500",
    button:
      "bg-black hover:bg-gray-800 text-white border-2 border-transparent rounded-none",
    header: "border-b-4 border-black bg-[#ffc900]",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    icon: <Type className="w-4 h-4" />,
    container: "bg-white text-gray-600 font-serif",
    chatArea: "bg-white max-w-2xl mx-auto",
    userBubble: "bg-gray-100 text-gray-900 italic rounded-lg",
    botBubble:
      "bg-transparent text-gray-600 border-l-2 border-gray-300 pl-4 rounded-none",
    inputArea: "bg-white border-t border-gray-100",
    input:
      "bg-transparent border-b border-gray-200 focus:border-gray-800 rounded-none px-0",
    button: "text-gray-900 hover:text-black bg-transparent",
    header: "bg-white text-center tracking-widest uppercase text-xs",
  },
  {
    id: "terminal",
    name: "Retro Terminal",
    icon: <Terminal className="w-4 h-4" />,
    container: "bg-[#1a1b26] text-[#a9b1d6] font-mono",
    chatArea: "bg-[#1a1b26] border border-[#414868] rounded-md",
    userBubble: "text-[#7aa2f7] before:content-['>_'] before:mr-2",
    botBubble: "text-[#9ece6a]",
    inputArea: "bg-[#1a1b26] border-t border-[#414868]",
    input:
      "bg-[#1a1b26] text-[#c0caf5] border-none focus:ring-0 px-0 placeholder-[#565f89]",
    button: "text-[#bb9af7] hover:text-[#9d7cd8] bg-transparent",
    header: "border-b border-[#414868] bg-[#1a1b26] text-[#7dcfff]",
  },
  {
    id: "nature",
    name: "Forest",
    icon: <Leaf className="w-4 h-4" />,
    container: "bg-[#f1f8e9] text-[#33691e] font-sans",
    chatArea: "bg-white/80 border border-[#dcedc8] rounded-3xl shadow-sm",
    userBubble: "bg-[#558b2f] text-white rounded-2xl rounded-tr-sm",
    botBubble: "bg-[#dcedc8] text-[#33691e] rounded-2xl rounded-tl-sm",
    inputArea: "bg-[#f1f8e9]/50 border-t border-[#dcedc8]",
    input: "bg-white border-[#c5e1a5] focus:ring-[#558b2f] rounded-xl",
    button: "bg-[#33691e] hover:bg-[#1b5e20] text-white rounded-xl",
    header: "bg-[#558b2f] text-white rounded-t-3xl",
  },
  {
    id: "corporate",
    name: "Corporate",
    icon: <Briefcase className="w-4 h-4" />,
    container: "bg-slate-100 text-slate-800 font-sans",
    chatArea: "bg-white border border-slate-300 shadow-md rounded-lg",
    userBubble: "bg-slate-700 text-white rounded-md",
    botBubble: "bg-slate-200 text-slate-800 rounded-md",
    inputArea: "bg-slate-50 border-t border-slate-200",
    input: "bg-white border-slate-300 focus:ring-slate-600 rounded-md",
    button: "bg-slate-800 hover:bg-slate-900 text-white rounded-md",
    header: "bg-slate-800 text-white border-b border-slate-900",
  },
  {
    id: "sunset",
    name: "Sunset",
    icon: <Sun className="w-4 h-4" />,
    container:
      "bg-gradient-to-br from-orange-100 to-rose-100 text-rose-900 font-sans",
    chatArea:
      "bg-white/40 backdrop-blur-lg border border-white/50 shadow-xl rounded-3xl",
    userBubble:
      "bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-3xl",
    botBubble: "bg-white/70 text-rose-900 rounded-3xl",
    inputArea: "bg-transparent border-t border-white/30",
    input:
      "bg-white/50 border-white/50 focus:bg-white/80 rounded-full text-rose-900 placeholder-rose-400",
    button: "bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg",
    header: "bg-transparent border-b border-white/20 text-rose-800 font-bold",
  },
  {
    id: "dark",
    name: "Midnight",
    icon: <Moon className="w-4 h-4" />,
    container: "bg-gray-950 text-gray-200 font-sans",
    chatArea: "bg-gray-900 border border-gray-800 rounded-xl",
    userBubble: "bg-indigo-600 text-white rounded-2xl",
    botBubble: "bg-gray-800 text-gray-200 rounded-2xl",
    inputArea: "bg-gray-900 border-t border-gray-800",
    input:
      "bg-gray-950 border-gray-800 focus:border-indigo-500 rounded-lg text-gray-200",
    button: "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg",
    header: "bg-gray-900 border-b border-gray-800",
  },
  {
    id: "ocean",
    name: "Oceanic",
    icon: <Droplets className="w-4 h-4" />,
    container: "bg-cyan-950 text-cyan-100 font-sans",
    chatArea:
      "bg-cyan-900/50 border border-cyan-800 rounded-2xl shadow-cyan-900/20",
    userBubble: "bg-cyan-600 text-white rounded-2xl rounded-br-sm",
    botBubble: "bg-cyan-800/80 text-cyan-100 rounded-2xl rounded-bl-sm",
    inputArea: "bg-cyan-900/30 border-t border-cyan-800",
    input:
      "bg-cyan-950/50 border-cyan-700 focus:border-cyan-500 rounded-full text-cyan-100",
    button: "bg-cyan-500 hover:bg-cyan-400 text-white rounded-full",
    header: "bg-cyan-900/80 border-b border-cyan-800 backdrop-blur",
  },
  {
    id: "coffee",
    name: "Coffee Shop",
    icon: <Coffee className="w-4 h-4" />,
    container: "bg-[#d7ccc8] text-[#3e2723] font-serif",
    chatArea: "bg-[#efebe9] border-2 border-[#8d6e63] rounded-lg shadow-md",
    userBubble: "bg-[#5d4037] text-[#efebe9] rounded-lg",
    botBubble: "bg-[#d7ccc8] text-[#3e2723] border border-[#a1887f] rounded-lg",
    inputArea: "bg-[#efebe9] border-t-2 border-[#8d6e63]",
    input: "bg-[#fff3e0] border-[#8d6e63] focus:ring-[#5d4037] rounded-md",
    button: "bg-[#4e342e] hover:bg-[#3e2723] text-[#efebe9] rounded-md",
    header: "bg-[#5d4037] text-[#efebe9] border-b-4 border-[#3e2723]",
  },
  {
    id: "glass",
    name: "Glassmorphism",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-gradient-to-r from-violet-200 to-pink-200 font-sans",
    chatArea:
      "bg-white/30 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl",
    userBubble:
      "bg-white/40 backdrop-blur-md border border-white/30 text-violet-900 rounded-2xl shadow-sm",
    botBubble:
      "bg-white/20 backdrop-blur-md border border-white/10 text-violet-800 rounded-2xl",
    inputArea: "bg-white/10 backdrop-blur-md border-t border-white/20",
    input:
      "bg-white/20 border-white/30 focus:bg-white/40 rounded-2xl text-violet-900 placeholder-violet-700/50",
    button:
      "bg-white/40 hover:bg-white/60 text-violet-900 rounded-2xl shadow-sm",
    header:
      "bg-white/10 backdrop-blur-md border-b border-white/20 text-violet-900",
  },
  {
    id: "neumorphism",
    name: "Neumorphism",
    icon: <Box className="w-4 h-4" />,
    container: "bg-[#e0e5ec] text-gray-600 font-sans",
    chatArea:
      "bg-[#e0e5ec] shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)] rounded-3xl border border-white/20",
    userBubble:
      "bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] text-blue-500 rounded-2xl",
    botBubble:
      "bg-[#e0e5ec] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] text-gray-600 rounded-2xl",
    inputArea: "bg-[#e0e5ec] rounded-b-3xl",
    input:
      "bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] border-none rounded-full px-4 py-2",
    button:
      "bg-[#e0e5ec] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] text-blue-500 rounded-full p-2 active:scale-95 transition-all",
    header: "bg-[#e0e5ec] shadow-[0px_10px_20px_#bebebe] z-10 rounded-t-3xl",
  },
  {
    id: "paper",
    name: "Paper",
    icon: <Paperclip className="w-4 h-4" />,
    container: "bg-[#fffdf0] text-gray-800 font-serif",
    chatArea:
      "bg-white border border-gray-300 shadow-sm rounded-none max-w-3xl mx-auto p-8",
    userBubble:
      "border-b-2 border-blue-300 text-blue-900 pb-1 rounded-none px-0 bg-transparent",
    botBubble:
      "bg-yellow-50 border border-yellow-200 text-gray-800 p-4 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.1)]",
    inputArea: "bg-transparent border-t-2 border-gray-800 border-dashed",
    input:
      "bg-transparent border-b border-gray-400 focus:border-gray-800 rounded-none px-0",
    button:
      "text-gray-800 hover:text-black bg-transparent border border-gray-800 rounded-none px-4",
    header:
      "bg-transparent border-b-2 border-gray-800 border-double text-center",
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    icon: <Sun className="w-4 h-4" />,
    container: "bg-white text-black font-bold",
    chatArea: "bg-white border-4 border-black rounded-none",
    userBubble: "bg-black text-white border-2 border-black rounded-none",
    botBubble: "bg-white text-black border-2 border-black rounded-none",
    inputArea: "bg-white border-t-4 border-black",
    input:
      "bg-white border-2 border-black focus:ring-4 focus:ring-black rounded-none text-black font-bold",
    button:
      "bg-black hover:bg-gray-800 text-white border-2 border-transparent rounded-none uppercase",
    header: "bg-black text-white border-b-4 border-white",
  },
  {
    id: "blue-bird",
    name: "Blue Bird",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-[#15202b] text-white font-sans",
    chatArea: "bg-[#15202b] border border-[#38444d] rounded-xl",
    userBubble: "bg-[#1d9bf0] text-white rounded-2xl rounded-br-sm",
    botBubble: "bg-[#192734] text-white rounded-2xl rounded-bl-sm",
    inputArea: "bg-[#15202b] border-t border-[#38444d]",
    input:
      "bg-[#192734] border-none focus:ring-2 focus:ring-[#1d9bf0] rounded-full text-white placeholder-gray-500",
    button: "text-[#1d9bf0] hover:bg-[#192734] rounded-full p-2",
    header:
      "bg-[#15202b]/80 backdrop-blur-md border-b border-[#38444d] sticky top-0",
  },
  {
    id: "insta-vibe",
    name: "Insta Vibe",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-white text-black font-sans",
    chatArea: "bg-white border border-gray-200 rounded-xl shadow-sm",
    userBubble:
      "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-3xl",
    botBubble: "bg-gray-100 text-black rounded-3xl",
    inputArea: "bg-white border-t border-gray-100",
    input: "bg-gray-100 border-none rounded-full px-4 py-2 text-black",
    button: "text-[#fd1d1d] font-semibold",
    header: "bg-white border-b border-gray-100",
  },
  {
    id: "green-chat",
    name: "Green Chat",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-[#efe7dd] text-black font-sans",
    chatArea: "bg-[#efe7dd] shadow-lg rounded-lg", // Ideally needs a doodle background image
    userBubble: "bg-[#d9fdd3] text-black rounded-lg shadow-sm",
    botBubble: "bg-white text-black rounded-lg shadow-sm",
    inputArea: "bg-[#f0f2f5] px-4 py-2",
    input: "bg-white border-none rounded-lg px-4 py-2 text-black",
    button: "bg-[#00a884] text-white rounded-full p-2 hover:bg-[#008f6f]",
    header: "bg-[#008069] text-white shadow-sm",
  },
  {
    id: "gamer-dark",
    name: "Gamer Dark",
    icon: <Zap className="w-4 h-4" />,
    container: "bg-[#313338] text-[#dbdee1] font-sans",
    chatArea: "bg-[#313338] rounded-md",
    userBubble:
      "bg-[#313338] hover:bg-[#2b2d31] text-[#dbdee1] rounded-sm pl-0", // Discord style is less bubble-y
    botBubble:
      "bg-[#313338] hover:bg-[#2b2d31] text-[#dbdee1] rounded-sm pl-0 border-l-4 border-[#5865f2] pl-2",
    inputArea: "bg-[#313338] px-4 pb-4",
    input:
      "bg-[#383a40] border-none rounded-lg px-4 py-3 text-[#dbdee1] placeholder-[#949ba4]",
    button: "bg-[#5865f2] text-white rounded-full p-2 hover:bg-[#4752c4]",
    header: "bg-[#313338] border-b border-[#26272d] shadow-sm",
  },
  {
    id: "workplace",
    name: "Workplace",
    icon: <Briefcase className="w-4 h-4" />,
    container: "bg-white text-[#1d1c1d] font-sans",
    chatArea: "bg-white",
    userBubble:
      "bg-white hover:bg-gray-50 text-[#1d1c1d] border border-gray-200 rounded-lg p-3",
    botBubble: "bg-[#f8f8f8] hover:bg-[#f0f0f0] text-[#1d1c1d] rounded-lg p-3",
    inputArea: "bg-white border-t border-gray-200 p-4",
    input:
      "bg-white border border-gray-400 rounded-md px-3 py-2 text-[#1d1c1d]",
    button: "bg-[#007a5a] text-white rounded-md px-4 py-1 hover:bg-[#148567]",
    header: "bg-[#350d36] text-white",
  },
  {
    id: "blue-bubble",
    name: "Blue Bubble",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-white text-black font-sans",
    chatArea: "bg-white",
    userBubble: "bg-blue-500 text-white rounded-2xl px-4 py-2",
    botBubble: "bg-[#e9e9eb] text-black rounded-2xl px-4 py-2",
    inputArea: "bg-[#f5f5f5] border-t border-[#d1d1d1] px-4 py-2",
    input: "bg-white border border-[#d1d1d1] rounded-full px-4 py-1 text-black",
    button:
      "bg-blue-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center",
    header:
      "bg-[#f5f5f5]/80 backdrop-blur-md border-b border-[#d1d1d1] text-black font-semibold",
  },
  {
    id: "paper-plane",
    name: "Paper Plane",
    icon: <Paperclip className="w-4 h-4" />,
    container: "bg-[#99aabb] text-black font-sans", // Placeholder for pattern
    chatArea: "bg-[#99aabb] shadow-inner",
    userBubble: "bg-[#eeffde] text-black rounded-xl shadow-sm",
    botBubble: "bg-white text-black rounded-xl shadow-sm",
    inputArea: "bg-white p-2",
    input: "bg-white border-none text-black px-2",
    button: "text-[#3390ec] hover:bg-blue-50 rounded-full p-2",
    header: "bg-white text-black shadow-sm",
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-white text-black font-sans",
    chatArea: "bg-white",
    userBubble: "bg-[#0084ff] text-white rounded-2xl",
    botBubble: "bg-[#f0f0f0] text-black rounded-2xl",
    inputArea: "bg-white p-3",
    input: "bg-[#f0f0f0] rounded-full px-4 py-2 text-black",
    button: "text-[#0084ff]",
    header: "bg-white shadow-sm text-black font-bold",
  },
  {
    id: "claymorphism",
    name: "Claymorphism",
    icon: <Box className="w-4 h-4" />,
    container: "bg-[#f0f4f8] text-[#4a5568] font-sans",
    chatArea: "bg-[#f0f4f8]",
    userBubble:
      "bg-white text-[#4a5568] rounded-3xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] border-2 border-white",
    botBubble:
      "bg-[#e2e8f0] text-[#4a5568] rounded-3xl shadow-[inset_4px_4px_8px_#cbd5e0,inset_-4px_-4px_8px_#ffffff]",
    inputArea: "bg-[#f0f4f8] p-4",
    input:
      "bg-[#f0f4f8] rounded-3xl shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] px-6 py-3 border-none",
    button:
      "bg-[#ebf4ff] text-[#4299e1] rounded-3xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] p-3 hover:scale-95 transition-transform",
    header: "bg-[#f0f4f8] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-10",
  },
  {
    id: "aurora",
    name: "Aurora",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-[#0b1026] text-white font-sans",
    chatArea: "bg-gradient-to-b from-[#0b1026] to-[#2b1055]",
    userBubble:
      "bg-gradient-to-r from-[#00ff87] to-[#60efff] text-[#0b1026] font-medium rounded-2xl rounded-tr-none",
    botBubble:
      "bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl rounded-tl-none",
    inputArea: "bg-black/20 backdrop-blur-lg border-t border-white/10",
    input:
      "bg-white/5 border border-white/10 focus:bg-white/10 rounded-xl text-white",
    button:
      "bg-gradient-to-r from-[#00ff87] to-[#60efff] text-[#0b1026] rounded-xl shadow-[0_0_15px_rgba(96,239,255,0.5)]",
    header: "bg-white/5 backdrop-blur-md border-b border-white/10",
  },
  {
    id: "synthwave",
    name: "Synthwave",
    icon: <Zap className="w-4 h-4" />,
    container: "bg-[#2b213a] text-[#ff71ce] font-mono",
    chatArea:
      "bg-[#241b2f] border-2 border-[#01cdfe] shadow-[0_0_10px_#01cdfe,inset_0_0_20px_rgba(1,205,254,0.2)]",
    userBubble:
      "bg-[#b967ff]/20 text-[#fffb96] border border-[#b967ff] shadow-[0_0_5px_#b967ff] rounded-none skew-x-[-10deg]",
    botBubble:
      "bg-[#05ffa1]/20 text-[#05ffa1] border border-[#05ffa1] shadow-[0_0_5px_#05ffa1] rounded-none skew-x-[-10deg]",
    inputArea: "bg-[#241b2f] border-t-2 border-[#ff71ce]",
    input:
      "bg-[#2b213a] border border-[#ff71ce] text-[#ff71ce] shadow-[0_0_5px_#ff71ce] rounded-none",
    button:
      "bg-[#ff71ce] text-[#2b213a] font-bold shadow-[0_0_10px_#ff71ce] hover:bg-[#ff91d9] rounded-none",
    header:
      "bg-[#241b2f] border-b-2 border-[#b967ff] text-[#01cdfe] uppercase tracking-widest",
  },
  {
    id: "monochrome-luxury",
    name: "Monochrome Luxury",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-[#111] text-[#eee] font-serif",
    chatArea: "bg-[#111] border-x border-[#333] max-w-2xl mx-auto",
    userBubble: "bg-[#eee] text-[#111] rounded-none px-6 py-4",
    botBubble:
      "bg-[#222] text-[#eee] border border-[#333] rounded-none px-6 py-4",
    inputArea: "bg-[#111] border-t border-[#333] p-6",
    input:
      "bg-transparent border-b border-[#333] focus:border-[#eee] rounded-none px-0 py-2 text-[#eee] font-light tracking-wide",
    button: "text-[#eee] uppercase text-xs tracking-[0.2em] hover:text-white",
    header:
      "bg-[#111] border-b border-[#333] text-center uppercase tracking-[0.3em] text-xs py-6",
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    icon: <Box className="w-4 h-4" />,
    container: "bg-[#fbf5ef] text-[#2d1b2e] font-mono", // Ideally a pixel font
    chatArea: "bg-[#b45252] p-1", // Border color
    userBubble:
      "bg-[#d3a068] text-[#2d1b2e] border-4 border-[#2d1b2e] shadow-[4px_4px_0_#2d1b2e] rounded-none",
    botBubble:
      "bg-[#4b692f] text-[#fbf5ef] border-4 border-[#2d1b2e] shadow-[4px_4px_0_#2d1b2e] rounded-none",
    inputArea: "bg-[#d3a068] border-t-4 border-[#2d1b2e] p-2",
    input: "bg-[#fbf5ef] border-4 border-[#2d1b2e] text-[#2d1b2e] rounded-none",
    button:
      "bg-[#4b692f] text-[#fbf5ef] border-4 border-[#2d1b2e] shadow-[2px_2px_0_#2d1b2e] active:translate-y-[2px] active:shadow-none",
    header:
      "bg-[#2d1b2e] text-[#fbf5ef] border-b-4 border-[#2d1b2e] p-2 text-center",
  },
  {
    id: "bauhaus",
    name: "Bauhaus",
    icon: <Box className="w-4 h-4" />,
    container: "bg-[#f0f0f0] text-black font-sans",
    chatArea:
      "bg-[#f0f0f0] border-l-[20px] border-r-[20px] border-l-[#e93636] border-r-[#2a6db5]",
    userBubble: "bg-[#e93636] text-white rounded-full rounded-br-none p-6",
    botBubble: "bg-[#2a6db5] text-white rounded-none p-6",
    inputArea: "bg-[#f4d03f] p-6 border-t-4 border-black",
    input: "bg-white border-4 border-black rounded-none h-12",
    button:
      "bg-black text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#333]",
    header:
      "bg-[#f4d03f] border-b-4 border-black text-black font-black uppercase tracking-tighter text-2xl",
  },
  {
    id: "y2k",
    name: "Y2K",
    icon: <Sparkles className="w-4 h-4" />,
    container: "bg-[#e6e6fa] text-[#ff00ff] font-sans",
    chatArea:
      "bg-white border-2 border-[#ff00ff] rounded-lg shadow-[0_0_10px_#ff00ff]",
    userBubble:
      "bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white rounded-full border border-[#ff00ff]",
    botBubble:
      "bg-[#e6e6fa] text-[#ff00ff] border border-[#00ffff] rounded-full",
    inputArea: "bg-white border-t-2 border-[#ff00ff]",
    input: "bg-[#e6e6fa] border border-[#00ffff] rounded-full text-[#ff00ff]",
    button:
      "bg-[#00ffff] text-[#ff00ff] rounded-full border border-[#ff00ff] hover:bg-[#ff00ff] hover:text-[#00ffff]",
    header:
      "bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white font-bold italic",
  },
];

export default function TestPage() {
  const [currentThemeId, setCurrentThemeId] = useState("modern");
  const [input, setInput] = useState("");

  const currentTheme = themes.find((t) => t.id === currentThemeId) || themes[0];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${currentTheme.container} flex flex-col md:flex-row`}
    >
      {/* Sidebar for Theme Switching */}
      <div className="w-full md:w-64 bg-black/5 border-r border-black/5 p-4 overflow-y-auto h-48 md:h-screen shrink-0">
        <h2 className="text-lg font-bold mb-4 px-2">Select Style</h2>
        <div className="space-y-2 grid grid-cols-2 md:grid-cols-1 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setCurrentThemeId(theme.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all w-full text-left
                ${
                  currentThemeId === theme.id
                    ? "bg-black/10 font-bold shadow-sm"
                    : "hover:bg-black/5 opacity-70 hover:opacity-100"
                }`}
            >
              <span className="shrink-0">{theme.icon}</span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden p-4 md:p-8">
        <div
          className={`flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden transition-all duration-500 ${currentTheme.chatArea}`}
        >
          {/* Header */}
          <div
            className={`p-4 flex items-center justify-between shrink-0 ${currentTheme.header}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center overflow-hidden">
                <Bot className="w-6 h-6 opacity-70" />
              </div>
              <div>
                <h1 className="font-bold text-lg">AI Assistant</h1>
                <p className="text-xs opacity-70">Always here to help</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-50">
              <div className="w-3 h-3 rounded-full bg-current"></div>
              <div className="w-3 h-3 rounded-full bg-current"></div>
              <div className="w-3 h-3 rounded-full bg-current"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {mockConversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] md:max-w-[70%] gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-black/5 self-end mb-1
                    ${msg.role === "user" ? "hidden" : "flex"}`}
                  >
                    <Bot className="w-4 h-4 opacity-60" />
                  </div>

                  <div
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 shadow-sm transition-all duration-300
                      ${
                        msg.role === "user"
                          ? currentTheme.userBubble
                          : currentTheme.botBubble
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    <span className="text-[10px] opacity-40 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className={`p-4 shrink-0 ${currentTheme.inputArea}`}>
            <form
              className="flex gap-2 items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-3 outline-none transition-all duration-300 ${currentTheme.input}`}
              />
              <button
                type="submit"
                className={`p-3 transition-all duration-300 flex items-center justify-center ${currentTheme.button}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
