'use client';
import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Place your audio file in public/song.mp3 */}
      <audio ref={audioRef} src="/song.mp3" loop />
      <button
        onClick={toggleAudio}
        className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-rose-200 text-rose-600 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
      >
        {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
      </button>
    </div>
  );
}