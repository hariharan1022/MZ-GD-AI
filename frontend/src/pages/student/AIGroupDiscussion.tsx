import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Radio, Loader2, Sparkles, MessageSquare, Hash, UserCheck, CheckCircle2, BookOpen, Trophy, RefreshCw } from "lucide-react";
import api from "@/lib/api";

export default function AIGroupDiscussion() {
  const [students, setStudents] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(true);

  const navigate = useNavigate();

  const fetchMeta = async () => {
    setFetchingMeta(true);
    try {
      const [sRes, tRes] = await Promise.all([
        api.get("/discussions/students"),
        api.get("/discussions/topics"),
      ]);
      setStudents(sRes.data);
      setTopics(tRes.data);
    } catch (e: any) {
      if (e.response?.status === 404 || e.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("current_student");
        navigate("/login");
      }
    } finally { setFetchingMeta(false); }
  };

  useEffect(() => { fetchMeta(); }, []);

  const handleStart = async () => {
    setLoading(true);
    setSession(null);
    try {
      const res = await api.post("/discussions/ai-start", { count: 6 });
      setSession(res.data);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to start group discussion");
    } finally { setLoading(false); }
  };

  if (fetchingMeta) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Radio className="w-7 h-7 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Group Discussion</h1>
      </div>

      {/* Student Pool */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Available Students ({students.length})
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">AI will pick 6 randomly</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {students.map((s) => (
            <div key={s.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-100 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
              <p className="text-xs text-slate-400 truncate">{s.roll_number}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleStart}
            disabled={loading || students.length < 2}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "AI is Assembling Group..." : "Start AI Group Discussion"}
          </button>
        </div>
      </div>

      {/* Results */}
      {session && (
        <>
          {/* Session Info */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Group Discussion Started!</h2>
            </div>
            <p className="text-emerald-100 text-lg mb-2">
              Topic: <strong>{session.group.topic}</strong>
            </p>
            <p className="text-emerald-100/80 text-sm mb-4">{session.group.topic_description}</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                <Users className="w-4 h-4" /> {session.members.length} Members
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                <Hash className="w-4 h-4" /> Group {session.group.group_number}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                <MessageSquare className="w-4 h-4" /> {session.session.prepTime}min Prep + {session.session.duration}min Talk
              </span>
            </div>
          </div>

          {/* Selected Members */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-indigo-500" /> AI-Selected Members
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {session.members.map((m: any, i: number) => (
                <div key={m.id} className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {m.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.roll_number}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-800/50 px-2 py-0.5 rounded-full">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-500" /> Discussion Topic
            </h2>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800/30">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{session.group.topic}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{session.group.topic_description}</p>
            </div>
          </div>

          {/* Start Another */}
          <div className="text-center pb-8">
            <button
              onClick={handleStart}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Start New AI Group Discussion
            </button>
          </div>
        </>
      )}
    </div>
  );
}