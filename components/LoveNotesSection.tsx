"use client";

import { useState } from "react";
import { Heart, Mail, Sparkles, X, Plus, Loader2 } from "lucide-react";

export interface LoveNote {
  id: number;
  title: string;
  content: string;
  reason?: string | null;
  createdAt: string | Date;
}

// Inline Create Modal for Love Notes
function CreateLoveNoteModal({
  onNoteCreated,
}: {
  onNoteCreated: (newNote: LoveNote) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/love-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          reason: reason.trim() || null,
        }),
      });

      if (res.ok) {
        const createdNote = await res.json();
        onNoteCreated(createdNote);
        setIsOpen(false);
        setTitle("");
        setContent("");
        setReason("");
      }
    } catch (err) {
      console.error("Failed to create love note:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>New Note</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl">
                <Heart className="w-5 h-5 fill-pink-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Write a Love Note
                </h3>
                <p className="text-xs text-gray-500">
                  Leave a sweet message for your favorite person
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Thinking of you today 💕"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  Why This Matters (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Just wanted to remind you how amazing you are!"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-pink-200 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Post Note</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Main Love Notes Section Component
export default function LoveNotesSection({
  initialNotes,
}: {
  initialNotes: LoveNote[];
}) {
  const [notes, setNotes] = useState<LoveNote[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<LoveNote | null>(null);

  return (
    <section className="py-8">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl">
            <Heart className="w-6 h-6 fill-pink-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Love Notes</h2>
            <p className="text-sm text-gray-500">Sweet thoughts & messages</p>
          </div>
        </div>

        <CreateLoveNoteModal
          onNoteCreated={(newNote) => setNotes((prev) => [newNote, ...prev])}
        />
      </div>

      {/* Grid of Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => setSelectedNote(note)}
            className="group cursor-pointer p-5 bg-gradient-to-b from-white to-pink-50/30 rounded-2xl border border-pink-100 hover:border-pink-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-pink-50 text-pink-500 rounded-lg group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-pink-400">
                  Note
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
                {note.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {note.content}
              </p>
            </div>

            {note.reason && (
              <div className="pt-2 border-t border-pink-100/60 flex items-center gap-1.5 text-xs text-pink-500">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{note.reason}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Note Reader Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-pink-500 text-xs font-semibold tracking-wide uppercase mb-2">
              <Heart className="w-4 h-4 fill-pink-500" />
              <span>Special Note</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedNote.title}
            </h2>

            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-gray-700 leading-relaxed text-sm mb-4 whitespace-pre-wrap">
              {selectedNote.content}
            </div>

            {selectedNote.reason && (
              <div className="p-3 bg-pink-50 text-pink-700 text-xs rounded-xl flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Why this matters:</strong> {selectedNote.reason}
                </span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}