"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dices, Sparkles } from "lucide-react";

const DATES = [
  "🍕 Homemade Pizza & Movie Night",
  "🌅 Sunset Picnic at the Park",
  "🍦 Late Night Ice Cream Run",
  "🎨 Paint & Sip Night at Home",
  "☕ Cafe Hopping in a New Neighborhood",
  "🎳 Arcade & Bowling Night",
];

export default function DateRoulette() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinWheel = () => {
    setIsSpinning(true);
    setSelectedDate(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * DATES.length);
      setSelectedDate(DATES[randomIndex]);
      count++;

      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-rose-100 shadow-sm text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Dices className="w-5 h-5 text-rose-500" />
        <h2 className="text-base font-bold text-rose-950">
          Date Night Roulette
        </h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Can't decide what to do? Let fate pick!
      </p>

      <div className="min-h-[70px] flex items-center justify-center bg-rose-50/70 rounded-2xl border border-rose-100 p-3 mb-4">
        {selectedDate ? (
          <motion.p
            key={selectedDate}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-bold text-rose-900"
          >
            {selectedDate}
          </motion.p>
        ) : (
          <span className="text-xs text-slate-400">
            Tap spin to choose an idea!
          </span>
        )}
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-transform flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />{" "}
        {isSpinning ? "Spinning..." : "Spin the Wheel"}
      </button>
    </div>
  );
}
