"use client";

import { useState, useEffect } from "react";
import { Heart, Mail, Sparkles, X, Plus, Loader2 } from "lucide-react";
import { getLoveNotes, createLoveNote } from "@/app/actions/loveNotes";

export interface LoveNote {
  id: number | string;
  title: string;
  content: string;
  reason?: string | null;
  createdAt: string;
}

export default function LoveNotes() {
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [fetchingNotes, setFetchingNotes] = useState(true);
  const [selectedNote, setSelectedNote] = useState<LoveNote | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");

  // 1. Fetch notes when component mounts
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setFetchingNotes(true);
    const res = await getLoveNotes();

    if (res.success && res.data) {
      const formattedNotes: LoveNote[] = res.data.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        reason: note.reason,
        createdAt: new Date(note.createdAt).toISOString(),
      }));
      setNotes(formattedNotes);
    }
    setFetchingNotes(false);
  };

  // 2. Submit handler for new note creation
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);

    try {
      const res = await createLoveNote({
        title: title.trim(),
        content: content.trim(),
        reason: reason.trim() || null,
      });

      if (res.success && res.data) {
        const newNote: LoveNote = {
          id: res.data.id,
          title: res.data.title,
          content: res.data.content,
          reason: res.data.reason,
          createdAt: new Date(res.data.createdAt).toISOString(),
        };

        // Add to UI state immediately & close modal
        setNotes((prev) => [newNote, ...prev]);
        setIsModalOpen(false);
        setTitle("");
        setContent("");
        setReason("");
      } else {
        alert(res.error || "Failed to create note.");
      }
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header with Add Button */}
      <div className="flex items-center justify-between bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-rose-100/80 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
            <Heart className="w-4 h-4 fill-pink-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Love Notes</h2>
            <p className="text-[10px] text-slate-500">Reasons why I love you</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-xs rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Loading Skeleton View */}
      {fetchingNotes && (
        <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 bg-white/50 rounded-2xl border border-rose-100/50">
          <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
          <span>Loading love notes...</span>
        </div>
      )}

      {/* Empty State View */}
      {!fetchingNotes && notes.length === 0 && (
        <div className="p-8 text-center text-xs text-slate-400 bg-white/50 rounded-2xl border border-dashed border-rose-200">
          No love notes found yet. Click <strong>New Note</strong> to write your
          first message! 💕
        </div>
      )}

      {/* Notes Grid */}
      {!fetchingNotes && (
        <div className="grid grid-cols-1 gap-2.5">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="group cursor-pointer p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-100/70 hover:border-pink-300 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-pink-50 text-pink-500 rounded-lg group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] uppercase font-semibold tracking-wider text-pink-400">
                    Note
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                  {note.content}
                </p>
              </div>

              {note.reason && (
                <div className="pt-2 border-t border-rose-50 flex items-center gap-1.5 text-[11px] text-pink-500 font-medium">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">{note.reason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Love Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-pink-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                <Heart className="w-4 h-4 fill-pink-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Write a Love Note
                </h3>
                <p className="text-[11px] text-slate-500">
                  Leave a sweet message
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Thinking of you 💕"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-xs outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-500" />
                  Why This Matters (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Just wanted to remind you!"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-xs outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs rounded-xl shadow-sm transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

      {/* Note Reader Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-pink-100">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-pink-500 text-[10px] font-bold tracking-wider uppercase mb-1.5">
              <Heart className="w-3.5 h-3.5 fill-pink-500" />
              <span>Special Note</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-3">
              {selectedNote.title}
            </h2>

            <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-slate-700 leading-relaxed text-xs mb-3 whitespace-pre-wrap">
              {selectedNote.content}
            </div>

            {selectedNote.reason && (
              <div className="p-2.5 bg-pink-50 text-pink-700 text-[11px] rounded-xl flex items-start gap-2 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Why:</strong> {selectedNote.reason}
                </span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
