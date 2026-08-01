'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const NO_MESSAGES = [
  "No 😢",
  "Are you sure?",
  "Think again! 🥺",
  "Wrong button bestie!",
  "Nice try, tap Yes! 💕",
  "Error 404: No not found"
];

export default function DateNightInvite() {
  const [yesPressed, setYesPressed] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [noButtonStyle, setNoButtonStyle] = useState<{ top?: string; left?: string; position?: 'relative' | 'absolute' }>({
    position: 'relative'
  });

  const handleYesClick = () => {
    setYesPressed(true);
    // Fire celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#ffe4e6']
    });
  };

  const handleNoHoverOrTouch = () => {
    // Generate random coordinates within the container box
    const randomTop = Math.floor(Math.random() * 70) + 15; // percentages
    const randomLeft = Math.floor(Math.random() * 70) + 10;

    setNoButtonStyle({
      position: 'absolute',
      top: `${randomTop}%`,
      left: `${randomLeft}%`,
    });

    setNoCount((prev) => (prev + 1) % NO_MESSAGES.length);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm mx-auto h-[480px] bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-rose-100 text-center overflow-hidden">
      {!yesPressed ? (
        <>
          {/* Cute Graphic / Emoji */}
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner animate-bounce">
            💌
          </div>

          <h2 className="text-xl font-bold text-rose-900 mb-2">
            Special Date Night Invitation
          </h2>
          
          <p className="text-xs text-rose-600 mb-8 px-2 leading-relaxed">
            National Girlfriend Day is official, and you are cordially invited to an exclusive, all-expenses-paid date with your favorite person.
          </p>

          {/* Action Buttons Area */}
          <div className="relative w-full h-24 flex items-center justify-center gap-4">
            {/* Yes Button (Grows bigger as she tries to click No!) */}
            <motion.button
              style={{ scale: 1 + noCount * 0.1 }}
              onClick={handleYesClick}
              className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-full shadow-lg shadow-rose-500/30 text-sm z-10 active:scale-95 transition-transform"
            >
              Yes! 💖
            </motion.button>

            {/* Fleeing No Button */}
            <motion.button
              style={noButtonStyle}
              onMouseEnter={handleNoHoverOrTouch}
              onTouchStart={handleNoHoverOrTouch}
              onClick={handleNoHoverOrTouch}
              className="px-5 py-3 bg-slate-200 text-slate-700 font-medium rounded-full text-sm shadow-sm transition-all duration-150"
            >
              {NO_MESSAGES[noCount]}
            </motion.button>
          </div>
        </>
      ) : (
        /* Success Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-full"
        >
          <div className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg animate-pulse">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-rose-900 mb-2">
            It's a Date!
          </h2>
          <p className="text-xs text-rose-600 mb-6 px-4">
            Screenshot this screen and send it to me. Get ready for a surprise! ✨
          </p>
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs font-medium">
            📅 Date: August 1st <br />
            📍 Location: Secret Destination
          </div>
        </motion.div>
      )}
    </div>
  );
}