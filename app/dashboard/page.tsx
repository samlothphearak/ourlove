"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  KeyRound,
  ArrowLeft,
  Heart,
  Images,
  Flame,
  Sparkles,
  ShieldAlert,
  Layers,
  Database,
  RefreshCw,
  CheckCircle2,
  Search,
  Trash2,
  AlertTriangle,
  Download,
  Clock,
  ChevronRight,
  ChevronDown,
  PenSquare,
  Plus,
  Image,
  Camera,
  MoreHorizontal,
  MapPin,
  Tag,
  Eye,
  Mail,
  Target,
} from "lucide-react";
import {
  getDashboardData,
  deletePhotoMemory,
  getLoveNotes,
  deleteLoveNote,
  bulkDeleteCategory,
} from "@/app/actions/dashboard";
import { getStreakData } from "@/app/actions/streak";
import PhotoDeck from "@/components/PhotoDeck";
import LoveNotesSection, { type LoveNote } from "@/components/LoveNotesSection";
import OurGoals from "@/components/OurGoals";
import StreakPet from "@/components/StreakPet";

interface RecentMemory {
  id: number;
  title: string;
  date: string | null;
  location: string | null;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
}

interface DashboardStats {
  loveNotesCount: number;
  photoMemoriesCount: number;
  openLettersCount: number;
  goalsCount: number;
}

interface StreakData {
  currentStreak: number;
  petExp: number;
  petLevel: number;
  lastCheckIn?: Date | null;
}

type TabType = "overview" | "memories" | "notes" | "streak" | "system";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMemories, setRecentMemories] = useState<RecentMemory[]>([]);
  const [notesList, setNotesList] = useState<LoveNote[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMemory, setPreviewMemory] = useState<RecentMemory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  //======================================================================= Fetch Dashboard Data =======================================================================
  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, streakResult] = await Promise.all([
        getDashboardData(),
        getStreakData(),
      ]);

      if (
        dashboardRes.success &&
        dashboardRes.stats &&
        dashboardRes.recentMemories
      ) {
        setStats(dashboardRes.stats);
        setRecentMemories(dashboardRes.recentMemories);
      }

      setStreakData(streakResult);
    } catch {
      showToast("Failed to reload dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      setAdminError(false);
      setAdminPassword("");
      showToast("Welcome back, Admin!", "success");
    } else {
      setAdminError(true);
    }
  };
  //======================================================================= Delete Memory Handlers =======================================================================
  const handleDeleteMemory = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this memory? This action cannot be undone.",
      )
    )
      return;

    try {
      const res = await deletePhotoMemory(id);
      if (res?.success ?? true) {
        if (previewMemory?.id === id) setPreviewMemory(null);
        await fetchData();
        showToast("Memory deleted successfully.", "success");
      } else {
        showToast("Failed to delete the memory.", "error");
      }
    } catch (err) {
      showToast("An error occurred while deleting.", "error");
    }
  };
  //======================================================================= Bulk Delete Handler =======================================================================
  const handleBulkDelete = async () => {
    if (!deleteTarget || confirmText.trim().toLowerCase() !== "delete") {
      showToast("Type 'DELETE' exactly to confirm.", "error");
      return;
    }

    try {
      const res = await bulkDeleteCategory(deleteTarget);
      if (!res.success) {
        throw new Error(res.error || "Failed to perform bulk deletion.");
      }

      showToast(
        res.message || `All records under "${deleteTarget}" have been wiped.`,
        "success",
      );
      setDeleteTarget(null);
      setConfirmText("");
      await fetchData();
      await fetchNotes();
    } catch {
      showToast("Failed to perform bulk deletion.", "error");
    }
  };
  //======================================================================= Filtered Memories =======================================================================
  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return recentMemories;

    const query = searchQuery.toLowerCase();

    return recentMemories.filter((m) => {
      const location = m.location?.toLowerCase() ?? "";
      const caption = m.caption?.toLowerCase() ?? "";

      return (
        m.title.toLowerCase().includes(query) ||
        location.includes(query) ||
        caption.includes(query)
      );
    });
  }, [recentMemories, searchQuery]);

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify({ stats, memories: recentMemories }, null, 2),
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `database_backup_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup downloaded successfully!", "success");
  };

  const fetchNotes = async () => {
    const res = await getLoveNotes();
    if (res.success && res.data) {
      setNotesList(res.data);
    }
  };

  useEffect(() => {
    if (activeTab === "notes") {
      fetchNotes();
    }
  }, [activeTab]);
  //======================================================================= Delete Love Note Handler =======================================================================
  const handleDeleteSingleNote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this love note?")) return;

    const res = await deleteLoveNote(id);
    if (res.success) {
      await fetchNotes();
      await fetchData();
      showToast("Love note deleted successfully.", "success");
    } else {
      showToast(res.error || "Failed to delete note.", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-rose-50/50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white/90 backdrop-blur-md border border-rose-100 p-6 rounded-3xl shadow-lg shadow-rose-950/5 text-center"
        >
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-rose-950 mb-1">
            Admin Access Required
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            Enter administrative passcode to manage dashboard data.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin password..."
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 placeholder-slate-400"
              />
              {adminError && (
                <p className="text-xs text-rose-500 mt-2 font-medium">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold rounded-xl shadow-md hover:opacity-95 active:scale-98 transition-all"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-rose-100">
            <Link
              href="/"
              className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Main Story
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated View
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-rose-100/40 text-slate-800 pb-16 pt-6 px-4 max-w-3xl mx-auto">
      <header className="flex items-center justify-between pb-4 border-b border-rose-200/60 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-white border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-rose-950 flex items-center gap-2">
              Power Admin Suite{" "}
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </h1>
            <p className="text-xs text-rose-600 font-medium">
              Real-time database administration & management
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs text-rose-600 font-semibold bg-white px-3 py-1.5 rounded-full border border-rose-200 shadow-sm hover:bg-rose-50 transition-colors"
        >
          Lock Admin
        </button>
      </header>

      <nav className="relative flex items-center gap-1.5 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-rose-100/60 shadow-lg shadow-rose-100/20 mb-6 overflow-x-auto">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-200/50 to-transparent"></div>

        {[
          { id: "overview", label: "Overview", icon: Layers },
          {
            id: "memories",
            label: "Memories",
            icon: Images,
            count: recentMemories.length,
          },
          {
            id: "notes",
            label: "Love Notes",
            icon: Heart,
            count: stats?.loveNotesCount ?? 0,
          },
          { id: "system", label: "Database", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap flex-1 justify-center ${
                isActive
                  ? "text-white shadow-lg scale-[0.98]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-rose-50/50"
              }`}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, #fb7185, #ec4899)"
                  : "transparent",
              }}
            >
              {isActive && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-rose-400 animate-pulse"></div>
              )}
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${isActive ? "text-white" : "text-slate-400"}`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "drop-shadow-md" : ""}`}
                />
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`absolute -top-2 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black ${
                      isActive
                        ? "bg-white text-rose-500 shadow-md"
                        : "bg-rose-50 text-rose-500 border border-rose-100"
                    }`}
                  >
                    {tab.count > 99 ? "99+" : tab.count}
                  </span>
                )}
              </div>
              <span className={isActive ? "drop-shadow-sm" : ""}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/60 shadow-inner">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-200/50">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-rose-300/30 animate-ping"></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-rose-300/20 animate-pulse"></div>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading your love story...
          </p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-rose-400" />
            Synchronizing database records
            <Sparkles className="w-3 h-3 text-rose-400" />
          </p>

          <div className="flex items-center gap-1.5 mt-4">
            <div
              className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "overview" && (
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-rose-100/40 min-h-[200px] transition-all duration-500">
              <div className="animate-fadeIn">
                <div className="space-y-5">
                  {/* Stats Grid - Centered with Lucide Icons */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Memories",
                        value: stats?.photoMemoriesCount ?? 0,
                        icon: Images,
                        gradient: "from-pink-400 to-purple-400",
                        bgGradient: "from-pink-50 to-purple-50",
                        color: "pink",
                      },
                      {
                        label: "Love Notes",
                        value: stats?.loveNotesCount ?? 0,
                        icon: Heart,
                        gradient: "from-rose-400 to-pink-400",
                        bgGradient: "from-rose-50 to-pink-50",
                        color: "rose",
                      },
                      {
                        label: "Open Letters",
                        value: stats?.openLettersCount ?? 0,
                        icon: Mail,
                        gradient: "from-purple-400 to-indigo-400",
                        bgGradient: "from-purple-50 to-indigo-50",
                        color: "purple",
                      },
                      {
                        label: "Goals",
                        value: stats?.goalsCount ?? 0,
                        icon: Target,
                        gradient: "from-orange-400 to-amber-400",
                        bgGradient: "from-orange-50 to-amber-50",
                        color: "orange",
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-rose-100/60 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden text-center"
                        >
                          {/* Gradient background on hover */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                          />

                          {/* Decorative circle */}
                          <div
                            className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                          />

                          <div className="relative z-10 flex flex-col items-center">
                            {/* Icon */}
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2`}
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </div>

                            {/* Value */}
                            <p
                              className={`text-2xl font-black text-slate-800 group-hover:text-${item.color}-600 transition-colors`}
                            >
                              {item.value}
                            </p>

                            {/* Label */}
                            <p
                              className={`text-[10px] uppercase tracking-wider font-bold text-${item.color}-400 mt-0.5`}
                            >
                              {item.label}
                            </p>

                            {/* Subtitle */}
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {item.value === 1 ? "item" : "items"} total
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "memories" && (
            <section className="bg-white/80 backdrop-blur-md rounded-2xl border border-rose-100 shadow-sm">
              <div className="p-4 border-b border-rose-100/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                    Photo Memories Manager ({filteredMemories.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteTarget("Photo Memories")}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete All
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-rose-100/60">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by title, location, or caption..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              {filteredMemories.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-slate-400">
                    No photo memories match your query.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2.5">
                  {filteredMemories.map((mem) => (
                    <div
                      key={mem.id}
                      className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {mem.imageUrl ? (
                          <img
                            src={mem.imageUrl}
                            alt={mem.title}
                            className="w-12 h-12 rounded-lg object-cover border border-rose-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center text-rose-400 shrink-0">
                            <Image className="w-6 h-6" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {mem.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {mem.date || "No Date"} •{" "}
                            {mem.location || "No Location"}
                          </p>
                          {mem.caption && (
                            <p className="text-[10px] text-rose-600 italic truncate mt-0.5">
                              "{mem.caption}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewMemory(mem)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMemory(mem.id)}
                          className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Delete Memory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "notes" && (
            <section className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-rose-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-950">
                      Love Notes Records
                    </h3>
                    <p className="text-xs text-slate-500">
                      There are currently{" "}
                      <span className="font-bold text-rose-600">
                        {stats?.loveNotesCount ?? 0}
                      </span>{" "}
                      notes stored.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteTarget("Love Notes")}
                    disabled={(stats?.loveNotesCount ?? 0) === 0}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Wipe All Notes
                  </button>
                </div>
              </div>

              {notesList.length === 0 ? (
                <div className="text-center py-8 bg-rose-50/30 rounded-2xl border border-dashed border-rose-200 space-y-1">
                  <Heart className="w-8 h-8 text-rose-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    No Love Notes Found
                  </p>
                  <p className="text-[11px] text-slate-400">
                    There are no notes stored in your database yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notesList.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start justify-between gap-4 p-3.5 bg-white rounded-xl border border-rose-100 shadow-xs hover:border-rose-200 transition-colors"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {note.title || "Untitled Note"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSingleNote(note.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                        title="Delete this note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "system" && (
            <div className="space-y-4">
              <section className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                  <Database className="w-4 h-4 text-rose-500" /> Database
                  Administration Tools
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-rose-500" /> Backup
                      Database (JSON)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Download a copy of stats and recent memories for
                      safe-keeping.
                    </p>
                    <button
                      onClick={handleExportJSON}
                      className="w-full py-2 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-rose-600 transition-colors"
                    >
                      Export Backup
                    </button>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-rose-500" /> Force
                      Revalidate
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Purge Server Action cache across all public pages
                      immediately.
                    </p>
                    <button
                      onClick={() => {
                        fetchData();
                        alert(
                          "Cache purged and dashboard revalidated successfully.",
                        );
                      }}
                      className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-slate-900 transition-colors"
                    >
                      Purge Cache
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-red-50/60 backdrop-blur-md p-5 rounded-2xl border border-red-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-red-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Bulk
                  Deletion Manager (Danger Zone)
                </h3>
                <p className="text-xs text-red-700">
                  Select a category below to delete all associated records
                  permanently.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    "Photo Memories",
                    "Love Notes",
                    "Goals",
                    "Open Letters",
                  ].map((category) => (
                    <button
                      key={category}
                      onClick={() => setDeleteTarget(category)}
                      className="flex items-center justify-between p-2.5 bg-white border border-red-200 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <span>Delete All {category}</span>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-red-200 space-y-4"
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800">
                Delete All {deleteTarget}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently erase all records under{" "}
                <span className="font-bold text-slate-700">{deleteTarget}</span>
                . This action cannot be undone.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Type <span className="text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-bold tracking-wider uppercase"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setConfirmText("");
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={confirmText.toLowerCase() !== "delete"}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-xl shadow-md disabled:opacity-40"
              >
                Wipe All
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {previewMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-rose-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <h3 className="text-sm font-bold text-rose-950">
                Memory Details
              </h3>
              <button
                onClick={() => setPreviewMemory(null)}
                className="text-slate-400 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            {previewMemory.imageUrl && (
              <img
                src={previewMemory.imageUrl}
                alt={previewMemory.title}
                className="w-full h-48 object-cover rounded-xl border border-rose-100"
              />
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {previewMemory.title}
              </h4>
              <p className="text-xs text-slate-500">
                {previewMemory.date} • {previewMemory.location}
              </p>
              {previewMemory.caption && (
                <p className="text-xs text-rose-600 font-medium italic mt-1">
                  "{previewMemory.caption}"
                </p>
              )}
            </div>
            <button
              onClick={() => handleDeleteMemory(previewMemory.id)}
              className="w-full py-2 bg-rose-100 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-200 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Memory
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
