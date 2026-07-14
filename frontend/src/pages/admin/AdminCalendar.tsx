import { useState, useEffect } from 'react';
import { CalendarDays, Search, Plus, Filter, MoreVertical, CheckCircle, XCircle, X } from 'lucide-react';
import api from '../../lib/api';

interface Session {
  id: string;
  department_id: string;
  year_id: string;
  section_id: string;
  group_size: number;
  discussion_date: string;
  discussion_time: string;
  status: string;
  created_at: string;
}

interface Department { id: string; name: string; }
interface Year { id: string; year_level: number; }
interface Section { id: string; name: string; }

export default function AdminCalendar() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [formData, setFormData] = useState({
    department_id: '',
    year_id: '',
    section_id: '',
    group_size: 4,
    discussion_date: '',
    discussion_time: '',
    preparation_time_minutes: 2,
    discussion_duration_minutes: 10,
    status: 'SCHEDULED'
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchDepartments();
  }, []);

  const handleDepartmentChange = async (deptId: string) => {
    setFormData({ ...formData, department_id: deptId, year_id: '', section_id: '' });
    setSections([]);
    if (deptId) {
      try {
        const res = await api.get(`/admin/departments/${deptId}/years`);
        setYears(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setYears([]);
    }
  };

  const handleYearChange = async (yearId: string) => {
    setFormData({ ...formData, year_id: yearId, section_id: '' });
    if (yearId) {
      try {
        const res = await api.get(`/admin/years/${yearId}/sections`);
        setSections(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSections([]);
    }
  };

  const openModal = () => {
    setFormData({
      department_id: '',
      year_id: '',
      section_id: '',
      group_size: 4,
      discussion_date: '',
      discussion_time: '',
      preparation_time_minutes: 2,
      discussion_duration_minutes: 10,
      status: 'SCHEDULED'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/sessions', formData);
      closeModal();
      fetchSessions();
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/admin/sessions/${id}/status`, { status: newStatus });
      fetchSessions();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.status.toLowerCase().includes(search.toLowerCase()) ||
    s.discussion_date.includes(search)
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Discussion Sessions
          </h1>
          <p className="text-slate-500 mt-1">Schedule and manage active discussion sessions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm" onClick={openModal}>
            <Plus className="w-4 h-4" />
            Schedule Session
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by date or status..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading sessions...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Date & Time</th>
                  <th className="px-6 py-3.5 font-medium">Target Group</th>
                  <th className="px-6 py-3.5 font-medium">Group Size</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredSessions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No sessions scheduled</td></tr>
                ) : filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{new Date(session.discussion_date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{session.discussion_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 dark:text-slate-300">Dept: {session.department_id.substring(0,6)}...</div>
                      <div className="text-xs text-slate-500">Yr: {session.year_id.substring(0,4)} | Sec: {session.section_id.substring(0,4)}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {session.group_size} students
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                        session.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400' :
                        session.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {session.status === 'SCHEDULED' && (
                          <button onClick={() => updateStatus(session.id, 'IN_PROGRESS')} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md transition-colors" title="Start Session">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {session.status === 'IN_PROGRESS' && (
                          <button onClick={() => updateStatus(session.id, 'COMPLETED')} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition-colors" title="Complete Session">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS') && (
                          <button onClick={() => updateStatus(session.id, 'CANCELLED')} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors" title="Cancel Session">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Schedule Session
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select required value={formData.department_id} onChange={(e) => handleDepartmentChange(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors">
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <select required value={formData.year_id} onChange={(e) => handleYearChange(e.target.value)} disabled={!formData.department_id} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors">
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y.id} value={y.id}>Year {y.year_level}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                  <select required value={formData.section_id} onChange={(e) => setFormData({...formData, section_id: e.target.value})} disabled={!formData.year_id} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors">
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input required type="date" value={formData.discussion_date} onChange={(e) => setFormData({...formData, discussion_date: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input required type="time" value={formData.discussion_time} onChange={(e) => setFormData({...formData, discussion_time: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Group Size</label>
                  <select required value={formData.group_size} onChange={(e) => setFormData({...formData, group_size: Number(e.target.value)})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors">
                    <option value={4}>4 Students</option>
                    <option value={5}>5 Students</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prep Time (mins)</label>
                  <input required type="number" min={1} value={formData.preparation_time_minutes} onChange={(e) => setFormData({...formData, preparation_time_minutes: Number(e.target.value)})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discussion Time (mins)</label>
                  <input required type="number" min={5} value={formData.discussion_duration_minutes} onChange={(e) => setFormData({...formData, discussion_duration_minutes: Number(e.target.value)})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
