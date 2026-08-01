'use client';

export default function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Soft Glow Spotlights */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-300/40 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl" />

      {/* Subtle Floating Ambient Hearts */}
      <div className="absolute top-[15%] left-[10%] text-rose-300/50 text-2xl animate-float-slow">
        💖
      </div>
      <div className="absolute top-[40%] right-[12%] text-rose-300/40 text-3xl animate-float-delayed">
        ✨
      </div>
      <div className="absolute bottom-[25%] left-[8%] text-rose-300/40 text-2xl animate-float-fast">
        💕
      </div>
      <div className="absolute top-[70%] right-[20%] text-rose-300/30 text-xl animate-float-slow">
        🌸
      </div>
    </div>
  );
}