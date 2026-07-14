import { useState, useEffect } from 'react';
import { MessagesSquare, Search, Filter, Mic2, Users, Activity } from 'lucide-react';
import api from '../../lib/api';

interface Group {
  id: string;
  session_id: string;
  topic_id: string | null;
  group_number: number;
  room_name: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/groups');
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(r => 
    r.room_name.toLowerCase().includes(search.toLowerCase()) ||
    r.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessagesSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Live Discussion Rooms
          </h1>
          <p className="text-slate-500 mt-1">Monitor active real-time WebSocket discussion rooms.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchRooms} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by Room Name or Status..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading rooms...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Room Name</th>
                  <th className="px-6 py-3.5 font-medium">Group #</th>
                  <th className="px-6 py-3.5 font-medium">Timer (Started)</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredRooms.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No rooms active or found</td></tr>
                ) : filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Mic2 className={`w-4 h-4 ${room.status === 'DISCUSSING' ? 'text-rose-500' : 'text-slate-400'}`} />
                        {room.room_name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">ID: {room.id.substring(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      Group {room.group_number}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                      {room.started_at ? new Date(room.started_at).toLocaleTimeString() : 'Not started'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        room.status === 'DISCUSSING' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400' : 
                        room.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {room.status === 'DISCUSSING' && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-medium rounded-md transition-colors text-xs border border-indigo-200 dark:border-indigo-800/30">
                        Join as Spectator
                      </button>
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
