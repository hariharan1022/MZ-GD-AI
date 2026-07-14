import { useState, useEffect } from "react";
import { Award, Star, TrendingUp, Flame, MessageSquare, Trophy, Zap, ChevronRight, Loader2 } from "lucide-react";
import api from "@/lib/api";

const LEVEL_META: Record<number, { title: string; batch: string; color: string; bg: string; icon: string }> = {
  1: { title: "Novice", batch: "Bronze", color: "text-amber-700", bg: "bg-amber-100", icon: "🌱" },
  2: { title: "Apprentice", batch: "Bronze Star", color: "text-amber-600", bg: "bg-amber-200", icon: "⭐" },
  3: { title: "Practitioner", batch: "Silver", color: "text-slate-600", bg: "bg-slate-200", icon: "🔧" },
  4: { title: "Achiever", batch: "Silver Star", color: "text-slate-700", bg: "bg-slate-300", icon: "🏆" },
  5: { title: "Advanced", batch: "Gold", color: "text-yellow-600", bg: "bg-yellow-200", icon: "🔥" },
  6: { title: "Expert", batch: "Gold Star", color: "text-yellow-700", bg: "bg-yellow-300", icon: "💎" },
  7: { title: "Master", batch: "Platinum", color: "text-cyan-600", bg: "bg-cyan-200", icon: "👑" },
  8: { title: "Grandmaster", batch: "Platinum Star", color: "text-cyan-700", bg: "bg-cyan-300", icon: "🌟" },
  9: { title: "Elite", batch: "Diamond", color: "text-blue-600", bg: "bg-blue-200", icon: "💠" },
  10: { title: "Legend", batch: "Legendary", color: "text-purple-600", bg: "bg-purple-200", icon: "🏅" },
};

export default function StudentCreditPoints() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/credits").then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-500 text-center py-12">Could not load credit data.</div>;
  }

  const lvl = LEVEL_META[data.current_level] || LEVEL_META[1];
  const nextLvl = data.next_level ? LEVEL_META[data.next_level.level] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-7 h-7 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Credit Points & Batch</h1>
      </div>

      {/* Main Level Badge Card */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Current Batch</p>
            <h2 className="text-4xl font-bold mt-1">{lvl.icon} {lvl.batch}</h2>
            <p className="text-indigo-100 text-lg mt-1">Level {data.current_level} — {lvl.title}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                <Zap className="w-4 h-4" />
                <span>{data.xp.toLocaleString()} Credit Points</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                <Flame className="w-4 h-4" />
                <span>{data.daily_streak} Day Streak</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex w-24 h-24 rounded-full bg-white/20 items-center justify-center text-5xl">
            {lvl.icon}
          </div>
        </div>

        {/* Progress to next level */}
        {nextLvl && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-indigo-100 mb-2">
              <span>Progress to {nextLvl.batch}</span>
              <span>{data.progress_in_level}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white rounded-full h-full transition-all duration-500"
                style={{ width: `${Math.min(data.progress_in_level, 100)}%` }}
              />
            </div>
            <p className="text-indigo-100 text-xs mt-1">
              {data.xp_in_level} / {data.xp_needed_for_level} XP in this level
            </p>
          </div>
        )}
      </div>

      {/* Next Level Preview + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nextLvl && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Batch</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {nextLvl.icon} {nextLvl.batch}
            </p>
            <p className="text-sm text-slate-500">Level {data.next_level.level} — {nextLvl.title}</p>
            <p className="text-xs text-slate-400 mt-1">{data.xp} / {data.next_level.min_xp} XP needed</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discussions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.total_discussions}</p>
          <p className="text-sm text-slate-500">Total completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Badges Earned</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.badges?.length || 0}</p>
          <p className="text-sm text-slate-500">Special achievements</p>
        </div>
      </div>

      {/* Badges Row */}
      {data.badges && data.badges.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Earned Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.badges.map((b: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-700">
                <Star className="w-4 h-4 fill-amber-400" /> {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* All Levels Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> All Batches & Levels
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[1,2,3,4,5,6,7,8,9,10].map((level) => {
            const m = LEVEL_META[level];
            const isUnlocked = (data.current_level || 1) >= level;
            const isCurrent = data.current_level === level;
            return (
              <div key={level} className={`flex items-center justify-between px-6 py-3.5 ${isCurrent ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isUnlocked ? m.bg : "bg-slate-100 dark:bg-slate-800"}`}>
                    <span className={isUnlocked ? m.color : "text-slate-400"}>{m.icon}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                      {m.batch}
                      {isCurrent && <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">(Current)</span>}
                    </p>
                    <p className="text-xs text-slate-400">Level {level} — {m.title}</p>
                  </div>
                </div>
                {isUnlocked && (
                  <div className="text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
