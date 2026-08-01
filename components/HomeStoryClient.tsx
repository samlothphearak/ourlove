"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Images,
  Calendar,
  Sparkles,
  Lock,
  Volume2,
  VolumeX,
  ShieldAlert,
} from "lucide-react";

const PasscodeLock = dynamic(() => import("@/components/PasscodeLock"), {
  ssr: false,
});
const LoveNotes = dynamic(() => import("@/components/LoveNotes"), {
  ssr: false,
});
const PhotoDeck = dynamic(() => import("@/components/PhotoDeck"), {
  ssr: false,
});
const VirtualHug = dynamic(() => import("@/components/VirtualHug"), {
  ssr: false,
});
const OurGoals = dynamic(() => import("@/components/OurGoals"), {
  ssr: false,
});
const StreakPet = dynamic(() => import("@/components/StreakPet"), {
  ssr: false,
});

type Tab = "notes" | "photos" | "OurGoals" | "fun";

const NAV_ITEMS = [
  { id: "notes", label: "Home", icon: Heart },
  { id: "photos", label: "Memories", icon: Images },
  { id: "OurGoals", label: "Goals", icon: Calendar },
  { id: "fun", label: "Extras", icon: Sparkles },
] as const;

const ANNIVERSARY_DATE = new Date("2026-07-18T00:00:00");

export default function HomeStoryClient() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [greeting, setGreeting] = useState("Happy Girlfriend Day 💖");

  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    if (!isUnlocked) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, now.getTime() - ANNIVERSARY_DATE.getTime());

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, mins, secs });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning, my pretty girl ☀️");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon, my love 💕");
      } else if (hour >= 17 && hour < 22) {
        setGreeting("Good evening, beautiful 🌙");
      } else {
        setGreeting("Sweet dreams, my everything ✨");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50/50">
        <PasscodeLock onUnlock={() => setIsUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-rose-100/40 text-slate-800 pb-28 pt-3 max-w-sm mx-auto px-3 overflow-x-hidden">
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <header className="flex items-center justify-between py-3 px-3 bg-white/70 backdrop-blur-md rounded-2xl border border-rose-100/80 shadow-sm mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-rose-950 flex items-center gap-1.5 leading-tight">
              Our Story <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500" />
            </h1>

            <div className="flex items-center gap-1 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-800">
              <span>{timeTogether.days}d</span>
              <span>{timeTogether.hours}h</span>
              <span>{timeTogether.mins}m</span>
            </div>
          </div>

          <p className="text-[11px] text-rose-500 font-medium mt-0.5">
            {greeting}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className="w-8 h-8 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-600 active:scale-95 transition-transform"
          >
            {isPlayingMusic ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          <button
            onClick={() => setIsUnlocked(false)}
            className="w-8 h-8 rounded-full bg-rose-200/60 hover:bg-rose-200 border border-rose-300/50 flex items-center justify-center text-rose-700 active:scale-95 transition-transform"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <StreakPet />
              <VirtualHug />
              <LoveNotes />
            </motion.div>
          )}

          {activeTab === "photos" && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PhotoDeck />
            </motion.div>
          )}

          {activeTab === "OurGoals" && (
            <motion.div
              key="OurGoals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <OurGoals />
            </motion.div>
          )}

          {activeTab === "fun" && (
            <motion.div
              key="fun"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            ></motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm bg-white/80 backdrop-blur-xl border border-rose-100/90 p-1.5 rounded-full shadow-lg shadow-rose-950/10 flex items-center justify-around z-50">
        {NAV_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className="relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full transition-all z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-rose-500 rounded-full -z-10 shadow-sm shadow-rose-500/30"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />
              <span
                className={`text-[9px] mt-0.5 font-medium transition-colors ${
                  isActive ? "text-white font-semibold" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        <Link
          href="/dashboard"
          className="relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full transition-all z-10 text-slate-400 hover:text-rose-500"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Admin</span>
        </Link>
      </nav>

      <audio
        id="bg-music"
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf756.mp3?filename=lofi-study-112191.mp3"
        loop
        preload="auto"
      />
    </div>
  );
}
