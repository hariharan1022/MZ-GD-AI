import { useState, useEffect } from "react";
import { Radio, Calendar, Clock, Users, DoorOpen, Loader2, CheckCircle2, LogIn, Hash, MessageSquare } from "lucide-react";
import api from "@/lib/api";

export default function StudentActive() {
  const [session, setSession] = useState<any>(null);
  const [myMembership, setMyMembership] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await api.get("/discussions/active");
      if (res.data) {
        setSession(res.data.session);
        setGroups(res.data.groups || []);
        setMyMembership(res.data.my_membership);
      } else {
        setSession(null);
        setGroups([]);
        setMyMembership(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async (groupId: string) => {
    setJoining(groupId);
    try {
      await api.post("/discussions/join", { group_id: groupId });
      await fetchActive();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Radio className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Discussion</h1>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
            <Radio className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Active Discussion</h2>
          <p className="text-slate-500 max-w-sm">There is no active discussion session right now. Wait for your admin to start one, or check your upcoming sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Radio className="w-7 h-7 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Discussion</h1>
      </div>

      {myMembership ? (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8" />
            <h2 className="text-2xl font-bold">You're In!</h2>
          </div>
          <p className="text-emerald-100 text-lg">You have joined <strong>Group {myMembership.group_number}</strong></p>
          <p className="text-emerald-100 text-sm mt-1">Room: {myMembership.room_name}</p>
          <div className="mt-6 flex gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-2 text-sm">
              <DoorOpen className="w-4 h-4" /> {myMembership.room_name}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-2 text-sm">
              <Users className="w-4 h-4" /> Group {myMembership.group_number}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Live Session</p>
              <h2 className="text-2xl font-bold mt-1">{session.title}</h2>
              <p className="text-indigo-100 mt-2">{session.department} &middot; {session.year} &middot; {session.section}</p>
              <div className="flex flex-wrap gap-4 mt-4">
                <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                  <Calendar className="w-4 h-4" /> {session.date}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                  <Clock className="w-4 h-4" /> {session.time}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                  <Users className="w-4 h-4" /> Up to {session.groupSize} per group
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                  <Clock className="w-4 h-4" /> {session.prepTime}min prep + {session.duration}min talk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!myMembership && groups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-500" /> Available Groups
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div key={g.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Group {g.group_number}</h4>
                    <p className="text-xs text-slate-400">{g.room_name}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 truncate">
                  <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  {g.topic}
                </p>
                <p className="text-xs text-slate-400 mb-4">{g.member_count} / {session.groupSize} members</p>
                <button
                  onClick={() => handleJoin(g.id)}
                  disabled={joining === g.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {joining === g.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {joining === g.id ? "Joining..." : "Join Group"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {myMembership && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Discussion Details</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p><strong className="text-slate-900 dark:text-white">Topic:</strong> {session.title}</p>
            <p><strong className="text-slate-900 dark:text-white">Department:</strong> {session.department}</p>
            <p><strong className="text-slate-900 dark:text-white">Year / Section:</strong> {session.year} - {session.section}</p>
            <p><strong className="text-slate-900 dark:text-white">Date:</strong> {session.date} at {session.time}</p>
            <p><strong className="text-slate-900 dark:text-white">Duration:</strong> {session.prepTime}min prep + {session.duration}min discussion</p>
          </div>
        </div>
      )}
    </div>
  );
}
