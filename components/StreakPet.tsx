"use client";

import { useState, useEffect, useTransition } from "react";
import { Flame, Heart, Sparkles, Trophy, Loader2 } from "lucide-react";
import { getStreakData, checkInStreak } from "@/app/actions/streak";

interface StreakData {
  currentStreak: number;
  lastCheckIn: Date | null;
  petExp: number;
  petLevel: number;
}

export default function StreakPet() {
  const [data, setData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    getStreakData().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  const handleCheckIn = () => {
    if (isPending) return;

    startTransition(async () => {
      const updated = await checkInStreak();
      if (updated) {
        setData(updated);
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 3000);
      }
    });
  };

  // Check if already checked in today
  const hasCheckedInToday = () => {
    if (!data?.lastCheckIn) return false;
    const last = new Date(data.lastCheckIn);
    const today = new Date();
    return (
      last.getDate() === today.getDate() && last.getMonth() === today.getMonth()
    );
  };

  // Cute dynamic pet icons based on level
  const getPetDetails = (level: number) => {
    if (level === 1)
      return {
        name: "Baby Love Egg 🥚",
        emoji: "🥚",
        desc: "Warming up with your love!",
      };
    if (level === 2)
      return {
        name: "Tiny Cupid Cat 🐱",
        emoji: "🐱",
        desc: "Meowing for attention!",
      };
    if (level === 3)
      return {
        name: "Fluffy Romance Bunny 🐰",
        emoji: "🐰",
        desc: "Hopping around happily!",
      };
    if (level === 4)
      return {
        name: "Cuddle Bear 🧸",
        emoji: "🧸",
        desc: "Giving you big warm hugs!",
      };
    return {
      name: "Eternal Dragon of Love 🐉✨",
      emoji: "🐉💖",
      desc: "Your love is legendary!",
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 shadow-xl border border-rose-100 flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
      </div>
    );
  }

  const pet = getPetDetails(data?.petLevel || 1);
  const checkedToday = hasCheckedInToday();
  const nextLevelExp = (data?.petLevel || 1) * 50;
  const currentExp = data?.petExp || 0;
  const expPercentage = Math.min(
    100,
    Math.round((currentExp / nextLevelExp) * 100),
  );

  return (
    <div className="bg-gradient-to-br from-white/95 via-rose-50/40 to-pink-50/60 backdrop-blur-md rounded-[2.5rem] p-5 shadow-xl border border-rose-100 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Flame Streak Counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-3.5 py-1.5 rounded-full shadow-md shadow-orange-500/20">
          <Flame className="w-4 h-4 fill-white animate-bounce" />
          <span className="text-xs font-extrabold tracking-wide">
            {data?.currentStreak || 0} Day Streak! 🔥
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-100/70 px-3 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5" />
          <span>Lvl {data?.petLevel || 1}</span>
        </div>
      </div>

      {/* Streak Pet Display Box */}
      <div className="bg-white/80 border border-rose-100/80 rounded-2xl p-4 text-center relative shadow-xs">
        {celebrate && (
          <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-xs rounded-2xl flex items-center justify-center z-10 animate-pulse">
            <span className="text-xs font-bold text-rose-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
              ✨ +15 Exp! Pet grew happier! 💕
            </span>
          </div>
        )}

        {/* Pet Emoji Avatar */}
        <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center text-3xl shadow-inner border border-rose-100 mb-2 transform hover:scale-110 transition-transform">
          {pet.emoji}
        </div>

        <h4 className="text-xs font-extrabold text-rose-950">{pet.name}</h4>
        <p className="text-[10px] text-rose-400 font-medium mb-3">{pet.desc}</p>

        {/* Exp Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-rose-900">
            <span>Pet Happiness (Exp)</span>
            <span>
              {currentExp} / {nextLevelExp}
            </span>
          </div>
          <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Check-In Button */}
      <div className="mt-4">
        <button
          onClick={handleCheckIn}
          disabled={checkedToday || isPending}
          className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            checkedToday
              ? "bg-rose-100 text-rose-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-rose-500/20"
          }`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : checkedToday ? (
            <>
              <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              Checked in today! Come back tomorrow ❤️
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              Check-In Today Together ✨
            </>
          )}
        </button>
      </div>
    </div>
  );
}
