"use client";

import { useEffect, useState } from "react";
import { Heart, Sparkles, Send } from "lucide-react";
import {
  getVirtualLoveStats,
  sendVirtualLove,
} from "@/app/actions/virtualHug";

export default function VirtualHug() {
  const [hugsCount, setHugsCount] = useState(0);
  const [kissesCount, setKissesCount] = useState(0);
  const [animatingType, setAnimatingType] = useState<string | null>(null);

  useEffect(() => {
    getVirtualLoveStats().then((res) => {
      if (res.success && res.data) {
        setHugsCount(res.data.hugCount);
        setKissesCount(res.data.kissCount);
      }
    });
  }, []);

  const handleSend = async (type: "hug" | "kiss") => {
    const result = await sendVirtualLove(type);
    if (result.success && result.data) {
      setHugsCount(result.data.hugCount);
      setKissesCount(result.data.kissCount);
      setAnimatingType(type);
      setTimeout(() => setAnimatingType(null), 600);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 shadow-xl border border-rose-100 text-center relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />

      <h3 className="text-sm font-extrabold text-rose-950 flex items-center justify-center gap-1.5 mb-1">
        <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500" /> Virtual
        Love Meter
      </h3>
      <p className="text-[11px] text-rose-400 font-medium mb-4">
        Tap to send a quick hug or kiss when you miss each other! 💕
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Hugs Card */}
        <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 flex flex-col items-center justify-center relative">
          <span className="text-xl mb-1">🤗</span>
          <span className="text-xs font-bold text-rose-900">Virtual Hugs</span>
          <span className="text-lg font-extrabold text-rose-600 my-1">
            {hugsCount}
          </span>
          <button
            onClick={() => handleSend("hug")}
            className={`w-full py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 ${
              animatingType === "hug" ? "scale-105 bg-pink-500" : ""
            }`}
          >
            <Send className="w-3 h-3" /> Send Hug
          </button>
        </div>

        {/* Kisses Card */}
        <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-3.5 flex flex-col items-center justify-center relative">
          <span className="text-xl mb-1">💋</span>
          <span className="text-xs font-bold text-pink-900">
            Virtual Kisses
          </span>
          <span className="text-lg font-extrabold text-pink-600 my-1">
            {kissesCount}
          </span>
          <button
            onClick={() => handleSend("kiss")}
            className={`w-full py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 ${
              animatingType === "kiss" ? "scale-105 bg-rose-500" : ""
            }`}
          >
            <Heart className="w-3 h-3 fill-white" /> Send Kiss
          </button>
        </div>
      </div>
    </div>
  );
}
