"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Loader2,
  Trash2,
  Heart,
} from "lucide-react";
import { getGoals, addGoal, toggleGoal } from "@/app/actions/goals";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export default function OurGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Fetch real data from the database on mount
  useEffect(() => {
    getGoals()
      .then((data) => {
        if (Array.isArray(data)) {
          setGoals(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = (id: string, currentStatus: boolean) => {
    setGoals(
      goals.map((g) => (g.id === id ? { ...g, completed: !currentStatus } : g)),
    );

    startTransition(async () => {
      await toggleGoal(id, !currentStatus);
    });
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim() || isPending) return;

    const textToSubmit = newGoalText.trim();
    setNewGoalText("");
    setIsAdding(false);

    startTransition(async () => {
      const savedGoal = await addGoal(textToSubmit);
      if (savedGoal) {
        setGoals((prev) => [savedGoal, ...prev]);
      }
    });
  };

  // Calculate progress stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const progressPercentage =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 shadow-xl border border-rose-100 space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-rose-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />{" "}
            Our Couple Goals
          </h3>
          <p className="text-[11px] text-rose-400 font-medium">
            Dreams and adventures we want to do together ✨
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 flex items-center justify-center transition-colors active:scale-95 shadow-sm"
        >
          <Plus
            className={`w-4 h-4 transition-transform ${isAdding ? "rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Cute Progress Bar Widget */}
      {!isLoading && totalGoals > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-3.5 rounded-2xl border border-rose-100/80">
          <div className="flex justify-between items-center text-[11px] font-bold text-rose-900 mb-1.5">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              {completedGoals} of {totalGoals} Completed
            </span>
            <span className="text-rose-500">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-rose-200/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {progressPercentage === 100 ? (
            <p className="text-[10px] text-rose-500 font-bold text-center mt-2">
              🎉 You did it all! Time to make a new dream list!
            </p>
          ) : (
            <p className="text-[10px] text-rose-400 text-center mt-1.5">
              Keep going, adventures await! 💕
            </p>
          )}
        </div>
      )}

      {/* Add Goal Input Form */}
      {isAdding && (
        <form onSubmit={handleAddGoal} className="flex gap-2 animate-fadeIn">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Add a new dream or date idea..."
            className="flex-1 px-3.5 py-2.5 text-xs bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-950 placeholder-rose-300"
            autoFocus
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {/* Goals List with Real Data / Loading States */}
      {isLoading ? (
        <div className="flex justify-center py-8 text-rose-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 bg-rose-50/30 rounded-2xl border border-dashed border-rose-200">
          <Heart className="w-8 h-8 text-rose-300 mx-auto mb-2 animate-bounce" />
          <p className="text-xs text-rose-500 font-bold">No goals added yet!</p>
          <p className="text-[10px] text-rose-400 mt-0.5">
            Click the plus button to add your first dream together 💕
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => handleToggle(goal.id, goal.completed)}
              className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                goal.completed
                  ? "bg-rose-50/40 border-rose-100/60 opacity-70 line-through text-rose-400"
                  : "bg-white border-rose-100 shadow-xs hover:border-rose-300 text-rose-950 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {goal.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-rose-300 shrink-0 group-hover:text-rose-500 transition-colors" />
                )}
                <span className="text-xs font-semibold truncate">
                  {goal.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
