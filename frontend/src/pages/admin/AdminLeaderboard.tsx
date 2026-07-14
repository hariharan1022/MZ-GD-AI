import { useState, useEffect } from 'react';
import { Trophy, Search, Filter, Download, Medal } from 'lucide-react';
import api from '../../lib/api';

interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  avg_score: number;
  sessions_attended: number;
  rank: number;
}

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/gamification/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(entry => 
    entry.student_name.toLowerCase().includes(search.toLowerCase()) ||
    entry.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    entry.department_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Global Leaderboard
          </h1>
          <p className="text-slate-500 mt-1">View top performing students across the college.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Leaderboard
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by student name or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading leaderboard...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium w-24 text-center">Rank</th>
                  <th className="px-6 py-3.5 font-medium">Student Name</th>
                  <th className="px-6 py-3.5 font-medium">Department</th>
                  <th className="px-6 py-3.5 font-medium text-center">Sessions</th>
                  <th className="px-6 py-3.5 font-medium text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLeaderboard.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No records found</td></tr>
                ) : filteredLeaderboard.map((entry) => (
                  <tr key={entry.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center">
                        {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {entry.rank === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                        {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                        {entry.rank > 3 && <span className="font-semibold text-slate-500">#{entry.rank}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{entry.student_name}</div>
                      <div className="text-xs text-slate-500">{entry.roll_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        {entry.department_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      {entry.sessions_attended}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${entry.avg_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : entry.avg_score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {entry.avg_score}
                      </span>
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
