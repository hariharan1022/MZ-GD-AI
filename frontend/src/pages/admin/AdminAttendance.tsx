import { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Download, Clock, Wifi, WifiOff } from 'lucide-react';
import api from '../../lib/api';

interface AttendanceRecord {
  id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  room_name: string;
  joined_at: string | null;
  is_online: boolean;
  started_at: string | null;
  group_status: string;
}

export default function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/attendance');
        setRecords(res.data);
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filteredRecords = records.filter(r => 
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    r.room_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Attendance Tracking
          </h1>
          <p className="text-slate-500 mt-1">Monitor student participation and session attendance.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by student, roll number, or room..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading attendance records...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Student Info</th>
                  <th className="px-6 py-3.5 font-medium">Room Name</th>
                  <th className="px-6 py-3.5 font-medium">Connection Status</th>
                  <th className="px-6 py-3.5 font-medium">Joined At</th>
                  <th className="px-6 py-3.5 font-medium">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No attendance records found</td></tr>
                ) : filteredRecords.map((record) => {
                  const isPresent = record.joined_at !== null;
                  const joinedLate = record.started_at && record.joined_at && new Date(record.joined_at) > new Date(record.started_at);
                  
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{record.student_name}</div>
                        <div className="text-xs text-slate-500">{record.department_name} | {record.roll_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 dark:text-white font-medium">{record.room_name}</div>
                        <div className="text-xs text-slate-500">{record.group_status}</div>
                      </td>
                      <td className="px-6 py-4">
                        {record.is_online ? (
                          <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                            <Wifi className="w-4 h-4 mr-1" /> Online
                          </span>
                        ) : (
                          <span className="flex items-center text-slate-400 text-sm font-medium">
                            <WifiOff className="w-4 h-4 mr-1" /> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {record.joined_at ? (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(record.joined_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        ) : (
                          <span className="text-slate-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!isPresent ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                            Absent
                          </span>
                        ) : joinedLate ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                            Late
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Present
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
