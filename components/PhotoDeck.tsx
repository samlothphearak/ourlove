"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Heart,
  X,
  RotateCcw,
  Undo2,
  MapPin,
  Calendar,
  Bookmark,
  Sparkles,
  Compass,
  Loader2,
  Plus,
  Image as ImageIcon,
  Smartphone,
} from "lucide-react";
import { getPhotoMemories, createPhotoMemory } from "@/app/actions/memories";

interface PhotoCard {
  id: number;
  title: string;
  date: string | null;
  location: string | null;
  imageUrl?: string;
  imageFile?: File | null;
  caption: string | null;
  extendedMemory: string | null;
  deviceName?: string | null;
  isFavorite?: boolean;
}

interface PhotoMemoryPayload {
  id: number;
  title: string;
  date: string | null;
  location: string | null;
  imageUrl: string;
  caption: string | null;
  extendedMemory: string | null;
  deviceName?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

// Helper function to detect client device name automatically
function getDeviceName(): string {
  if (typeof window === "undefined" || !navigator) return "Web App";

  const ua = navigator.userAgent;

  // iOS Detection (iPhone / iPad)
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";

  // Android Detection
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android [^;]+; (?:Mobile; )?([^;)]+)/);
    return match ? match[1] : "Android Device";
  }

  // Desktop OS Fallbacks
  if (/Macintosh|Mac OS X/i.test(ua)) return "MacBook / Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Linux/i.test(ua)) return "Linux Device";

  return "Web Device";
}

export default function PhotoDeck() {
  const [initialPhotos, setInitialPhotos] = useState<PhotoCard[]>([]);
  const [cards, setCards] = useState<PhotoCard[]>([]);
  const [history, setHistory] = useState<PhotoCard[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Location Search State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    imageFile: null as File | null,
    caption: "",
    extendedMemory: "",
  });

  const loadMemories = async () => {
    setIsLoading(true);
    const res = await getPhotoMemories();
    if (res.success && res.data) {
      const normalized = (res.data as PhotoMemoryPayload[]).map(
        (memory: PhotoMemoryPayload) => ({
          ...memory,
          date: memory.date ?? "",
          location: memory.location ?? "",
          caption: memory.caption ?? "",
          extendedMemory: memory.extendedMemory ?? "",
          deviceName: memory.deviceName ?? undefined,
        }),
      );

      setInitialPhotos(normalized);
      setCards(normalized);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMemories();
  }, []);

  //============================================================ Debounced Location Autocomplete Search via Nominatim API with Local Context
  useEffect(() => {
    if (!formData.location || formData.location.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = formData.location.trim();

        // 1. Target search within Cambodia (countrycodes=kh)
        // 2. Viewbox focused around Phnom Penh bounding box to prioritize local POIs
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=kh&bounded=0&viewbox=104.75,11.65,104.98,11.45&limit=6&addressdetails=1`;

        const res = await fetch(url);
        const data = await res.json();

        if (data && data.length > 0) {
          setSearchResults(data);
        } else {
          // Fallback to global search if no local result found
          const fallbackRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query,
            )}&limit=5`,
          );
          const fallbackData = await fallbackRes.json();
          setSearchResults(fallbackData || []);
        }
      } catch (err) {
        console.error("Location search failed:", err);
      } finally {
        // ✅ Fixed!
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.location]);
  //==============================================================================================================
  const handleSwipe = (direction: "left" | "right") => {
    if (cards.length === 0) return;
    setSwipeDirection(direction);
    const removedCard = cards[cards.length - 1];

    setTimeout(() => {
      setHistory((prev) => [...prev, removedCard]);
      setCards((prev) => prev.slice(0, prev.length - 1));
      setSwipeDirection(null);
    }, 200);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastCard = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCards((prev) => [...prev, lastCard]);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  };

  const resetDeck = () => {
    setCards(initialPhotos);
    setHistory([]);
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageFile) {
      alert("Please provide a title and select an image file.");
      return;
    }

    setIsSubmitting(true);

    const detectedDevice = getDeviceName();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("date", formData.date || "");
    data.append("location", formData.location || "");
    data.append("caption", formData.caption || "");
    data.append("extendedMemory", formData.extendedMemory || "");
    data.append("imageFile", formData.imageFile);
    data.append("deviceName", detectedDevice);

    const res = await createPhotoMemory(data);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setFormData({
        title: "",
        date: "",
        location: "",
        imageFile: null,
        caption: "",
        extendedMemory: "",
      });
      setShowMap(false);
      setIsModalOpen(false);
      await loadMemories();
    } else {
      alert(res.error || "Failed to save memory. Please check fields.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] w-full text-rose-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-semibold">
          Loading your special memories...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-sm mx-auto min-h-[580px] select-none touch-none py-2 px-1 relative">
      {/* Header Info & Actions */}
      <div className="w-full space-y-2 mb-2">
        <div className="flex items-center justify-between text-xs text-rose-950 font-medium px-1">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
            <Compass className="w-3 h-3 text-rose-500" />
            {cards.length}{" "}
            {cards.length === 1 ? "Memory Left" : "Memories Left"}
          </span>

          <div className="flex items-center gap-1.5">
            {favorites.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-pink-600 bg-pink-100/70 px-2 py-0.5 rounded-full font-semibold">
                <Bookmark className="w-3 h-3 fill-pink-500 text-pink-500" />{" "}
                {favorites.length} Saved
              </span>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1 rounded-full shadow-md active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Photo
            </button>
          </div>
        </div>

        {/* Story Bar Progress Indicator */}
        <div className="flex gap-1.5 w-full px-1">
          {initialPhotos.map((_, idx) => {
            const isCompleted = idx < initialPhotos.length - cards.length;
            const isActive = idx === initialPhotos.length - cards.length;
            return (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full bg-rose-200/50 overflow-hidden"
              >
                <div
                  className={`h-full bg-rose-500 transition-all duration-300 ${
                    isCompleted
                      ? "w-full"
                      : isActive
                        ? "w-full animate-pulse"
                        : "w-0"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Stack Deck Container */}
      <div className="relative w-full h-[450px] flex items-center justify-center my-auto">
        <AnimatePresence>
          {cards.length > 0 ? (
            cards.map((card, index) => {
              const isTop = index === cards.length - 1;
              const isFav = favorites.includes(card.id);
              return (
                <Card
                  key={card.id}
                  card={card}
                  isTop={isTop}
                  isFav={isFav}
                  onSwipe={handleSwipe}
                  onToggleFavorite={() => toggleFavorite(card.id)}
                  forcedDirection={isTop ? swipeDirection : null}
                />
              );
            })
          ) : (
            /* Empty Deck Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center p-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-rose-100 shadow-xl h-full w-full"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-rose-500/20 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-rose-950 mb-1">
                You've Seen Every Memory!
              </h3>
              <p className="text-xs text-rose-600/80 mb-6 leading-relaxed max-w-[220px]">
                Ready to make hundreds of brand new memories together? 💕
              </p>
              <button
                onClick={resetDeck}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4" /> Replay Memory Deck
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Action Buttons */}
      {cards.length > 0 && (
        <div className="flex items-center justify-center gap-5 mt-3">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center border border-rose-100 transition-all active:scale-90 ${
              history.length === 0
                ? "opacity-40 cursor-not-allowed text-slate-300"
                : "text-amber-500 hover:bg-amber-50"
            }`}
            title="Rewind Last Card"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleSwipe("left")}
            className="w-13 h-13 p-3.5 rounded-full bg-white text-slate-400 shadow-md flex items-center justify-center border border-rose-100 active:scale-90 transition-all hover:text-slate-600"
            title="Next Memory"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={() => handleSwipe("right")}
            className="w-14 h-14 p-3.5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center active:scale-90 transition-all hover:opacity-95"
            title="Love Memory"
          >
            <Heart className="w-7 h-7 fill-white stroke-none" />
          </button>
        </div>
      )}

      {/* ADD MEMORY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/30 backdrop-blur-md p-4 touch-auto"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border border-rose-100 text-left relative overflow-y-auto max-h-[88vh] scrollbar-none"
            >
              {/* Floating Background Glows */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-rose-100/80 mb-5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-400 flex items-center justify-center text-white shadow-md shadow-rose-400/20">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-rose-950 tracking-tight leading-none">
                      New Sweet Memory
                    </h3>
                    <p className="text-[10px] text-rose-400 font-medium mt-0.5">
                      Capture a special moment together ✨
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Container */}
              <form
                onSubmit={handleAddPhotoSubmit}
                className="space-y-4 text-xs relative z-10"
              >
                {/* Photo Upload Area / Preview */}
                <div>
                  <label className="text-[11px] font-bold text-rose-900/80 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Photo *
                  </label>

                  {formData.imageFile ? (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-dashed border-rose-200 group shadow-inner">
                      <Image
                        src={URL.createObjectURL(formData.imageFile)}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              imageFile: null,
                            }))
                          }
                          className="bg-white/90 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md hover:bg-white active:scale-95 transition-transform"
                        >
                          Change Photo 📸
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50/70 rounded-2xl cursor-pointer transition-all duration-200 group">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <div className="w-9 h-9 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-500 mb-1.5 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <p className="text-[11px] font-semibold text-rose-700">
                          Upload your favorite photo
                        </p>
                        <p className="text-[9px] text-rose-400/80 mt-0.5">
                          PNG, JPG, or WEBP
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData((prev) => ({
                              ...prev,
                              imageFile: file,
                            }));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Title Field */}
                <div>
                  <label className="text-[11px] font-bold text-rose-900/80 mb-1 flex items-center gap-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koh Kong Sunset Walk 🌊"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-100 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100 bg-rose-50/30 text-rose-950 placeholder:text-rose-300 font-medium transition-all"
                  />
                </div>

                {/* Location Search & Autocomplete */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-rose-900/80 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="text-[10px] text-rose-500 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      {showMap ? "Hide Map" : "View Map 🗺️"}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Coffee Corner Veng Sreng"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-2xl border border-rose-100 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100 bg-rose-50/30 text-rose-950 placeholder:text-rose-300 font-medium transition-all"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      </div>
                    )}
                  </div>

                  {/* Autocomplete Results Dropdown */}
                  {searchResults.length > 0 ? (
<div className="absolute left-0 right-0 z-30 mt-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-rose-100 overflow-hidden max-h-44 overflow-y-auto">
    {searchResults.map((item) => (
      <button
        key={item.place_id}
        type="button"
        onClick={() => {
          setFormData({
            ...formData,
            location: item.display_name,
          });
          setSearchResults([]); // 👈 This instantly clears and hides the dropdown list
        }}
        className="w-full text-left px-3.5 py-2 text-[11px] text-rose-950 hover:bg-rose-50 transition-colors border-b border-rose-50 last:border-none flex items-start gap-1.5"
      >
        <MapPin className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />
        <span className="truncate">{item.display_name}</span>
      </button>
    ))}
  </div>
                  ) : (
                    /* Small helper text when no match is found */
                    formData.location.trim().length >= 3 &&
                    !isSearching && (
                      <p className="mt-1 text-[10px] text-rose-400/80 font-medium px-1">
                        No exact map match found. Custom location will still be
                        saved! ✨
                      </p>
                    )
                  )}

                  {/* Embedded OpenStreetMap / Google Map Preview */}
                  {showMap && formData.location && (
                    <div className="mt-2 rounded-2xl overflow-hidden border border-rose-200 h-36 shadow-inner relative">
                      <iframe
                        title="Location Preview"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          formData.location,
                        )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-[11px] font-bold text-rose-900/80 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" /> Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-2xl border border-rose-100 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100 bg-rose-50/30 text-rose-950 font-medium transition-all cursor-pointer"
                  />
                </div>

                {/* Short Caption */}
                <div>
                  <label className="text-[11px] font-bold text-rose-900/80 mb-1 flex items-center gap-1">
                    Short Caption
                  </label>
                  <input
                    type="text"
                    placeholder="One line about this moment... 💕"
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData({ ...formData, caption: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-100 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100 bg-rose-50/30 text-rose-950 placeholder:text-rose-300 font-medium transition-all"
                  />
                </div>

                {/* Extended Memory Note */}
                <div>
                  <label className="text-[11px] font-bold text-rose-900/80 mb-1 flex items-center gap-1">
                    Heartfelt Note (Back of Card)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write a sweet message to remember forever..."
                    value={formData.extendedMemory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extendedMemory: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-100 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100 bg-rose-50/30 text-rose-950 placeholder:text-rose-300 font-medium transition-all resize-none"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-white stroke-none" /> Save
                      Our Memory
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component handling single card dragging and flipping logic
function InteractiveCard({
  card,
  isTop,
  onSwipe,
  isFavorite,
  onToggleFavorite,
}: {
  card: PhotoCard;
  isTop: boolean;
  onSwipe: (direction: "left" | "right") => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`absolute w-full h-full rounded-[2.5rem] bg-white p-4 shadow-xl border border-rose-100 cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${
        !isTop ? "pointer-events-none scale-95 opacity-60 translate-y-2" : ""
      }`}
    >
      <div
        className="w-full h-full relative"
        onClick={() => isTop && setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          /* Card Front View */
          <div className="w-full h-full flex flex-col">
            <div className="relative w-full h-64 rounded-[2rem] overflow-hidden bg-rose-50 mb-3 shadow-inner">
              <Image
                src={
                  card.imageUrl ||
                  (card.imageFile ? URL.createObjectURL(card.imageFile) : "")
                }
                alt={card.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-rose-500 shadow-md hover:scale-110 active:scale-90 transition-transform"
              >
                <Bookmark
                  className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`}
                />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between px-1">
              <div>
                <h3 className="text-base font-extrabold text-rose-950 line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-xs text-rose-400 mt-0.5 line-clamp-2 font-medium">
                  {card.caption}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold border-t border-rose-50 pt-2 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-rose-400" />
                  {card.date || "Memory Date"}
                </span>
                <span className="flex items-center gap-1 max-w-[130px] truncate">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {card.location || "Somewhere Special"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Card Back View (Heartfelt Note & Details) */
          <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-rose-50/50 to-pink-50/30 rounded-[2rem] text-rose-950">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-2">
                <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Memory Note
                </span>
                {card.deviceName && (
                  <span className="text-[10px] font-medium text-rose-400 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> {card.deviceName}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-rose-900 font-medium whitespace-pre-wrap">
                {card.extendedMemory ||
                  card.caption ||
                  "No extra notes for this photo."}
              </p>
            </div>

            <div className="text-center text-[10px] text-rose-400 font-semibold pt-2 border-t border-rose-100/60">
              Tap card to view photo 📸
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Card({
  card,
  isTop,
  isFav,
  onSwipe,
  onToggleFavorite,
  forcedDirection,
}: {
  card: PhotoCard;
  isTop: boolean;
  isFav: boolean;
  onSwipe: (dir: "left" | "right") => void;
  onToggleFavorite: () => void;
  forcedDirection: "left" | "right" | null;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-16, 16]);
  const opacity = useTransform(
    x,
    [-200, -120, 0, 120, 200],
    [0.5, 1, 1, 1, 0.5],
  );

  const likeOpacity = useTransform(x, [10, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-10, -80], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 90) {
      onSwipe("right");
    } else if (info.offset.x < -90) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
      }}
      drag={isTop && !isFlipped ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={
        forcedDirection === "right"
          ? { x: 500, rotate: 20, opacity: 0 }
          : forcedDirection === "left"
            ? { x: -500, rotate: -20, opacity: 0 }
            : { scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }
      }
      transition={{ duration: 0.2 }}
      className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white shadow-xl border border-rose-100 flex flex-col cursor-grab active:cursor-grabbing perspective-1000"
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT OF CARD */}
        <div
          className="absolute inset-0 w-full h-full flex flex-col bg-white"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative h-[68%] w-full overflow-hidden bg-slate-100">
            <Image
              src={card.imageUrl ?? "https://placehold.co/800x600/FFF1F2/EC4899?text=Love+Story"}
              alt={card.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover pointer-events-none"
              unoptimized
            />

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/30 backdrop-blur-md text-white transition-transform active:scale-90"
            >
              <Bookmark
                className={`w-4 h-4 ${isFav ? "fill-rose-400 text-rose-400" : "text-white"}`}
              />
            </button>

            {isTop && (
              <>
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-4 left-4 border-2 border-emerald-400 text-emerald-500 font-bold px-3 py-1 rounded-xl text-xs rotate-[-12deg] bg-white/80 backdrop-blur-md shadow-md pointer-events-none"
                >
                  SWEET MEMORY 💖
                </motion.div>
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-4 right-14 border-2 border-rose-400 text-rose-500 font-bold px-3 py-1 rounded-xl text-xs rotate-[12deg] bg-white/80 backdrop-blur-md shadow-md pointer-events-none"
                >
                  NEXT 🌸
                </motion.div>
              </>
            )}

            {/* Front Overlay Metadata */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3 text-rose-400" />{" "}
                {card.location || "Unknown"}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-rose-100 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                <Calendar className="w-3 h-3 text-rose-300" />{" "}
                {card.date || "Recent"}
              </span>
            </div>
          </div>

          <div
            onClick={() => setIsFlipped(true)}
            className="flex-1 p-4 flex flex-col justify-between bg-gradient-to-b from-white to-rose-50/30 cursor-pointer"
          >
            <div>
              <h2 className="text-base font-bold text-rose-950 flex items-center justify-between">
                {card.title}
                <span className="text-[10px] text-rose-400 font-normal">
                  Tap for detail 💫
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                "{card.caption}"
              </p>
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          onClick={() => setIsFlipped(false)}
          className="absolute inset-0 w-full h-full p-5 bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col justify-between cursor-pointer border-2 border-rose-200/60 rounded-3xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-3">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Special Note
              </span>
              <span className="text-[10px] text-rose-400 font-medium">
                Tap to return ↩
              </span>
            </div>

            <h3 className="text-sm font-bold text-rose-950 mb-2">
              {card.title}
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3 rounded-2xl border border-rose-100/80 shadow-sm mb-3">
              "{card.extendedMemory}"
            </p>

            {/* Metadata Section */}
            <div className="space-y-1.5 text-[11px] text-slate-500">
              {card.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    <strong>Where:</strong> {card.location}
                  </span>
                </div>
              )}
              {card.date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    <strong>When:</strong> {card.date}
                  </span>
                </div>
              )}
              {/* 📱 Posted By Device Display */}
              <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  <strong>Posted by:</strong>{" "}
                  {card.deviceName
                    ? `Device ${card.deviceName}`
                    : "Unknown Device"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-rose-100">
            <span className="text-[10px] text-rose-400 font-medium">
              Forever & Always ❤️
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
