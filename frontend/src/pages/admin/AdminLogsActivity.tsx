import { useState } from 'react';
import { Activity, Search, Filter, Clock, User, ShieldAlert } from 'lucide-react';

const mockActivityLogs = [
  { id: 1, user: 'Admin User', role: 'System Admin', action: 'Updated settings', target: 'AI Configuration', time: '10 mins ago', status: 'success' },
  { id: 2, user: 'John Doe', role: 'Student', action: 'Completed practice session', target: 'Interview Prep', time: '1 hour ago', status: 'success' },
  { id: 3, user: 'System', role: 'System', action: 'Failed login attempt', target: 'IP 192.168.1.10', time: '2 hours ago', status: 'warning' },
  { id: 4, user: 'Admin User', role: 'System Admin', action: 'Exported student data', target: 'CSV Export', time: '5 hours ago', status: 'success' },
  { id: 5, user: 'Jane Smith', role: 'Student', action: 'Joined discussion room', target: 'Room A', time: '1 day ago', status: 'success' },
];

export default function AdminLogsActivity() {
  const [search, setSearch] = useState('');

  const filteredLogs = mockActivityLogs.filter(log => 
    log.user.toLowerCase().includes(search.toLowerCase()) || 
    log.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Activity Logs
          </h1>
          <p className="text-slate-500 mt-1">Audit trail of all administrative and student actions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            Filter Logs
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by user or action..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium">User</th>
                <th className="px-6 py-3.5 font-medium">Action Performed</th>
                <th className="px-6 py-3.5 font-medium">Target / Detail</th>
                <th className="px-6 py-3.5 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.role === 'System Admin' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{log.user}</div>
                        <div className="text-xs text-slate-500">{log.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      {log.status === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-500" />}
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {log.target}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {log.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
