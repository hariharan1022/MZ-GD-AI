import { useState, useEffect } from "react";
import { Calendar, Users, Mic, Activity, BarChart3, Clock, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminSessions() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>(() => {
    const saved = localStorage.getItem("mz_sessions");
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: "CSE Year 3 - Section A", date: "Scheduled for Today at 4:00 PM", status: "Scheduled", color: "border-l-indigo-500", badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400", count: 60, groups: 15 },
      { id: 2, title: "IT Year 2 - Section B", date: "Yesterday at 2:00 PM", status: "Completed", color: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400", count: 45, groups: 9 }
    ];
  });
  
  useEffect(() => {
    localStorage.setItem("mz_sessions", JSON.stringify(sessions));
  }, [sessions]);
  
  const [newSession, setNewSession] = useState({ dept: "CSE", section: "Year 3 - Section A", date: "" });

  const handleSchedule = () => {
    if (!newSession.date) {
      alert("Please select a date and time");
      return;
    }
    const s = {
      id: sessions.length + 1,
      title: `${newSession.dept} ${newSession.section}`,
      date: `Scheduled for ${new Date(newSession.date).toLocaleString()}`,
      status: "Scheduled",
      color: "border-l-indigo-500",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
      count: Math.floor(Math.random() * 20) + 40,
      groups: 10
    };
    setSessions([s, ...sessions]);
    setIsScheduleOpen(false);
  };

  const cancelSession = (id: number) => {
    if(window.confirm("Cancel this session?")) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Discussion Sessions
          </h1>
          <p className="text-slate-500 mt-1">Schedule and monitor AI Group Discussion sessions.</p>
        </div>
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> 
              Schedule Session
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule Discussion Session</DialogTitle>
              <DialogDescription>Set up a new AI-moderated discussion for a specific section.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Department</label>
                <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" value={newSession.dept} onChange={e => setNewSession({...newSession, dept: e.target.value})}>
                  <option>CSE</option><option>IT</option><option>ECE</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Year & Section</label>
                <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" value={newSession.section} onChange={e => setNewSession({...newSession, section: e.target.value})}>
                  <option>Year 3 - Section A</option><option>Year 3 - Section B</option><option>Year 2 - Section A</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date & Time</label>
                <input type="datetime-local" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Discussion Topic</label>
                <input placeholder="Leave empty for AI random topic" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              </div>
            </div>
            <DialogFooter>
              <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900" onClick={() => setIsScheduleOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm" onClick={handleSchedule}>Schedule</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sessions.map((session) => (
          <div key={session.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm border-l-4 ${session.color} flex flex-col overflow-hidden transition-all hover:shadow-md`}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{session.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {session.date}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${session.badge}`}>
                {session.status}
              </span>
            </div>
            <div className="p-5 flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-500" />
                  </div>
                  <span><strong className="text-slate-900 dark:text-white">{session.count}</strong> Students Participated ({session.groups} Groups)</span>
                </div>
                {session.status === "Scheduled" && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-slate-500" />
                    </div>
                    <span>2 Min Prep, 10 Min Discussion</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {session.status === "Scheduled" ? (
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm" onClick={() => alert("Session started early! Students will be notified.")}>
                      <Activity className="w-4 h-4"/> Start Early
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm" onClick={() => cancelSession(session.id)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm" onClick={() => alert("Opening detailed AI analytics report...")}>
                    <BarChart3 className="w-4 h-4"/> View Full Reports
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl border-dashed">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No sessions scheduled.</p>
            <p className="text-sm text-slate-400 mt-1">Create a new session to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
