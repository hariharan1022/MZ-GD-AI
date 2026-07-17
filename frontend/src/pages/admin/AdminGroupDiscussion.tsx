import { useState, useEffect } from "react";
import { Users, Building2, RefreshCw, Lock, Plus, MoveRight, Database, Clock, CheckCircle2, AlertCircle, BrainCircuit, ListOrdered, UserCheck, FlaskConical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const API = "http://localhost:8003/api";

interface Dept { id: string; name: string; code: string; }
interface Student { id: string; roll_number: string; name: string; xp: number; communication_score: number | null; }
interface Member { id: string; name: string; roll_number: string; score: number; }
interface Group { id: string; group_number: number; member_count: number; locked: number; members: Member[]; }
interface Session { id: string; department_id: string; department_name: string; group_size: number; total_students: number; total_groups: number; status: string; created_at: string; }

export default function AdminGroupDiscussion() {
  const [depts, setDepts] = useState<Dept[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [groupSize, setGroupSize] = useState(6);
  const [useAI, setUseAI] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [locking, setLocking] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveStudent, setMoveStudent] = useState<{studentId:string;studentName:string;sourceGroupId:string;sourceGroupNum:number} | null>(null);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [moving, setMoving] = useState(false);

  useEffect(() => { fetchDepts(); fetchSessions(); }, []);
  useEffect(() => { if (selectedDeptId) fetchStudents(); }, [selectedDeptId]);

  const clearMsgs = () => { setError(""); setSuccess(""); };

  const apiHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  const fetchDepts = async () => {
    try {
      const res = await fetch(`${API}/admin/gd/departments`, { headers: apiHeaders() });
      if (!res.ok) return;
      const data: Dept[] = await res.json();
      setDepts(data);
      if (data.length > 0) setSelectedDeptId(data[0].id);
    } catch {}
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`${API}/admin/gd/students?department_id=${selectedDeptId}`, { headers: apiHeaders() });
      if (!res.ok) { setError("Failed to load students"); return; }
      const data: Student[] = await res.json();
      setStudents(data);
    } catch { setError("Failed to load students"); }
    finally { setLoadingStudents(false); }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`${API}/admin/gd/sessions`, { headers: apiHeaders() });
      if (!res.ok) return;
      const data: Session[] = await res.json();
      setSessions(data);
    } catch {}
    finally { setLoadingSessions(false); }
  };

  const fetchSessionDetail = async (sessionId: string) => {
    try {
      const res = await fetch(`${API}/admin/gd/sessions/${sessionId}`, { headers: apiHeaders() });
      if (!res.ok) { setError("Failed to load session details"); return; }
      const data = await res.json();
      setSessionDetail(data);
      setSelectedSessionId(sessionId);
    } catch { setError("Failed to load session details"); }
  };

  const handleGenerate = async () => {
    clearMsgs();
    if (!selectedDeptId) { setError("Select a department first"); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API}/admin/gd/generate`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ department_id: selectedDeptId, group_size: groupSize, use_ai: useAI })
      });
      if (!res.ok) { const e = await res.json(); setError(e.detail || "Generation failed"); return; }
      const data = await res.json();
      setCurrentSessionId(data.session_id);
      setGroups(data.groups);
      setSuccess(`Generated ${data.num_groups} groups with ${data.total_students} students`);
      fetchSessions();
    } catch { setError("Generation failed"); }
    finally { setGenerating(false); }
  };

  const handleRegenerate = async () => {
    clearMsgs();
    if (!currentSessionId) { setError("No active session to regenerate"); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API}/admin/gd/groups/regenerate`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ session_id: currentSessionId })
      });
      if (!res.ok) { const e = await res.json(); setError(e.detail || "Regeneration failed"); return; }
      const data = await res.json();
      setCurrentSessionId(data.session_id);
      setGroups(data.groups);
      setSuccess(`Regenerated ${data.num_groups} groups`);
      fetchSessions();
    } catch { setError("Regeneration failed"); }
    finally { setGenerating(false); }
  };

  const handleLock = async () => {
    clearMsgs();
    if (!currentSessionId) { setError("No active session to lock"); return; }
    setLocking(true);
    try {
      const res = await fetch(`${API}/admin/gd/lock`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ session_id: currentSessionId })
      });
      if (!res.ok) { const e = await res.json(); setError(e.detail || "Lock failed"); return; }
      const data = await res.json();
      setSuccess(`Locked successfully! Topic: ${data.topic}`);
      setLockDialogOpen(false);
      fetchSessions();
      fetchSessionDetail(currentSessionId);
    } catch { setError("Lock failed"); }
    finally { setLocking(false); }
  };

  const handleMoveClick = (studentId: string, studentName: string, sourceGroupId: string, sourceGroupNum: number) => {
    setMoveStudent({ studentId, studentName, sourceGroupId, sourceGroupNum });
    setTargetGroupId("");
    setMoveDialogOpen(true);
  };

  const handleMoveConfirm = async () => {
    if (!moveStudent || !targetGroupId) return;
    clearMsgs();
    setMoving(true);
    try {
      const res = await fetch(`${API}/admin/gd/groups/${moveStudent.sourceGroupId}/move`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({ student_id: moveStudent.studentId, target_group_id: targetGroupId })
      });
      if (!res.ok) { const e = await res.json(); setError(e.detail || "Move failed"); return; }
      setSuccess(`Moved ${moveStudent.studentName} successfully`);
      setMoveDialogOpen(false);
      if (currentSessionId) fetchSessionDetail(currentSessionId);
    } catch { setError("Move failed"); }
    finally { setMoving(false); }
  };

  const statusBadge = (status: string) => {
    if (status === "DRAFT") return "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400";
    if (status === "LOCKED") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400";
    return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Group Discussion Management
          </h1>
          <p className="text-slate-500 mt-1">Generate AI-balanced groups, review, lock, and launch discussions.</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">{success}</div>}

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Department
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={selectedDeptId}
              onChange={e => { setSelectedDeptId(e.target.value); setCurrentSessionId(null); setGroups([]); }}
            >
              {depts.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Group Size
            </label>
            <input
              type="number" min={2} max={20}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={groupSize}
              onChange={e => setGroupSize(parseInt(e.target.value) || 6)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-500" />
              AI Balancing
            </label>
            <label className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer">
              <input type="checkbox" checked={useAI} onChange={e => setUseAI(e.target.checked)} className="rounded" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Use AI balanced assignment</span>
            </label>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 invisible">Action</label>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Groups"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {currentSessionId && (
            <>
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
              <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                    <Lock className="w-4 h-4" />
                    Lock Groups
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Lock Groups & Launch Discussion</DialogTitle>
                    <DialogDescription>
                      Locking will finalize groups and create a live discussion session with a randomly assigned topic. Students will be able to see their groups and join the active discussion.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>This action cannot be undone. Groups will be permanently locked.</span>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/50 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                      <strong>{groups.length}</strong> groups with <strong>{groups.reduce((s,g) => s + g.member_count, 0)}</strong> total students will be locked.
                    </div>
                  </div>
                  <DialogFooter>
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900" onClick={() => setLockDialogOpen(false)}>Cancel</button>
                    <button
                      onClick={handleLock}
                      disabled={locking}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {locking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {locking ? "Locking..." : "Confirm Lock"}
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Student Pool */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-indigo-500" />
          Student Pool
          {students.length > 0 && <span className="text-sm font-normal text-slate-500">({students.length} active students)</span>}
        </h2>
        {loadingStudents ? (
          <div className="flex items-center justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : students.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No active students in this department.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-64 overflow-y-auto custom-scrollbar">
            {students.map(s => (
              <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.roll_number}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-500">XP: {s.xp}</p>
                  <p className={s.communication_score !== null ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}>
                    {s.communication_score !== null ? `Score: ${s.communication_score}` : "No score"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Groups */}
      {groups.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <ListOrdered className="w-5 h-5 text-indigo-500" />
            Generated Groups
            <span className="text-sm font-normal text-slate-500">({groups.length} groups, {groups.reduce((s,g) => s + g.member_count, 0)} students)</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map(g => (
              <div key={g.id} className={`border rounded-xl overflow-hidden transition-all hover:shadow-md ${g.locked ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${g.locked ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${g.locked ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'}`}>
                      {g.group_number}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Group {g.group_number}</span>
                      <span className="text-xs text-slate-500 ml-2">{g.member_count} members</span>
                    </div>
                  </div>
                  {g.locked ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Draft</span>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  {g.members.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 group">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{m.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{m.name}</p>
                          <p className="text-xs text-slate-500 truncate">{m.roll_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{m.score}</span>
                        {!g.locked && (
                          <button
                            onClick={() => handleMoveClick(m.id, m.name, g.id, g.group_number)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                            title="Move to another group"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Move Student Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Move Student</DialogTitle>
            <DialogDescription>
              Move {moveStudent?.studentName} from Group {moveStudent?.sourceGroupNum} to another group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Group</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                value={targetGroupId}
                onChange={e => setTargetGroupId(e.target.value)}
              >
                <option value="">Select a group...</option>
                {groups.filter(g => g.id !== moveStudent?.sourceGroupId && !g.locked).map(g => (
                  <option key={g.id} value={g.id}>Group {g.group_number} ({g.member_count} members)</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900" onClick={() => setMoveDialogOpen(false)}>Cancel</button>
            <button
              onClick={handleMoveConfirm}
              disabled={moving || !targetGroupId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {moving ? "Moving..." : "Move Student"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-500" />
          Past Sessions
        </h2>
        {loadingSessions ? (
          <div className="flex items-center justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No sessions generated yet.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => selectedSessionId === s.id ? setSelectedSessionId(null) : fetchSessionDetail(s.id)}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{s.department_name}</p>
                      <p className="text-xs text-slate-500">{s.total_students} students · {s.total_groups} groups · {s.group_size} per group</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(s.status)}`}>{s.status}</span>
                    <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
                {selectedSessionId === s.id && sessionDetail && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="grid gap-3 mt-3 md:grid-cols-2 xl:grid-cols-3">
                      {sessionDetail.groups?.map((g: Group) => (
                        <div key={g.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-950">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">Group {g.group_number}</span>
                            <span className="text-xs text-slate-500">{g.member_count} members</span>
                          </div>
                          <div className="space-y-1">
                            {g.members.map(m => (
                              <div key={m.id} className="flex items-center justify-between text-xs">
                                <span className="text-slate-700 dark:text-slate-300">{m.name}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{m.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}