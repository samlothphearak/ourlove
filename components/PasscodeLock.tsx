"use client";
import { useState } from "react";

const CORRECT_PIN = "1807"; // Set your anniversary date (MMDD)

export default function PasscodeLock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        if (newPin === CORRECT_PIN) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin("");
            setError(false);
          }, 600);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="w-16 h-16 bg-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
        🔒
      </div>
      <h1 className="text-xl font-bold text-rose-900 mb-1">
        Enter Our Secret Date
      </h1>
      <p className="text-xs text-rose-500 mb-6">
        Hint: The day we first met (MMDD)
      </p>

      {/* Pin Indicators */}
      <div
        className={`flex gap-4 mb-8 ${error ? "animate-bounce text-red-500" : ""}`}
      >
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full border-2 border-rose-400 transition-all ${
              pin.length > idx ? "bg-rose-500 scale-110" : "bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-[240px]">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
          (item, index) => {
            if (item === "") return <div key={index} />;
            return (
              <button
                key={index}
                onClick={() => {
                  if (item === "⌫") setPin(pin.slice(0, -1));
                  else handleKeyPress(item);
                }}
                className="w-16 h-16 rounded-full bg-white/80 active:bg-rose-200 text-xl font-semibold shadow-sm text-slate-700 flex items-center justify-center active:scale-95 transition-transform"
              >
                {item}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}
