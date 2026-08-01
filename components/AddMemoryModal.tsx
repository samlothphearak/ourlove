// components/AddMemoryModal.tsx
"use client";

import React, { useState } from "react";
import { ImagePlus, Sparkles, X } from "lucide-react";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryAdded: (newMemory: any) => void;
}

export default function AddMemoryModal({
  isOpen,
  onClose,
  onMemoryAdded,
}: AddMemoryModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    caption: "",
    extendedMemory: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please attach a photo!");

    setIsUploading(true);

    try {
      // Create a temporary object URL so it displays instantly in client state
      // (Replace this fetch logic when connecting to your backend/Cloudinary endpoint)
      const previewUrl = URL.createObjectURL(file);

      const newCard = {
        id: Date.now(),
        title: formData.title,
        date: formData.date,
        location: formData.location,
        imageUrl: previewUrl,
        caption: formData.caption,
        extendedMemory: formData.extendedMemory,
      };

      onMemoryAdded(newCard);
      onClose();
    } catch (error) {
      console.error("Error adding memory:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-rose-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-rose-950 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" /> Add New Memory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* File Picker */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-rose-200 rounded-2xl p-4 bg-rose-50/50">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer text-center text-xs text-rose-600 font-semibold flex flex-col items-center"
            >
              <ImagePlus className="w-7 h-7 mb-1 text-rose-400" />
              {file ? file.name : "Upload Memory Photo"}
            </label>
          </div>

          <input
            type="text"
            placeholder="Memory Title (e.g. Sunset Walk 🌅)"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Location"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <textarea
            placeholder="Short Caption..."
            rows={2}
            required
            value={formData.caption}
            onChange={(e) =>
              setFormData({ ...formData, caption: e.target.value })
            }
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />

          <textarea
            placeholder="Detailed Story (card flip view)..."
            rows={3}
            value={formData.extendedMemory}
            onChange={(e) =>
              setFormData({ ...formData, extendedMemory: e.target.value })
            }
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs rounded-full shadow-md active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {isUploading ? "Saving..." : "Add to Deck"}
          </button>
        </form>
      </div>
    </div>
  );
}
