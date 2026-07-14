import { useState, useEffect } from 'react';
import { Medal, Search, Filter, Download } from 'lucide-react';
import api from '../../lib/api';

interface Achievement {
  ranking_id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  badge: string;
  created_at: string;
}

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/gamification/achievements');
        setAchievements(res.data);
      } catch (err) {
        console.error('Failed to fetch achievements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const filteredAchievements = achievements.filter(a => 
    a.student_name.toLowerCase().includes(search.toLowerCase()) ||
    a.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    a.badge.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Medal className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Achievements & Badges
          </h1>
          <p className="text-slate-500 mt-1">View gamification badges awarded during discussion sessions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by student, roll number, or badge..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading achievements...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Student Info</th>
                  <th className="px-6 py-3.5 font-medium">Department</th>
                  <th className="px-6 py-3.5 font-medium">Badge Awarded</th>
                  <th className="px-6 py-3.5 font-medium">Awarded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredAchievements.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No achievements recorded yet.</td></tr>
                ) : filteredAchievements.map((ach) => (
                  <tr key={ach.ranking_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{ach.student_name}</div>
                      <div className="text-xs text-slate-500">Roll: {ach.roll_number}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {ach.department_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300">
                        <Medal className="w-3 h-3 mr-1" />
                        {ach.badge}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(ach.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
