import { useState, useEffect } from 'react';
import { Bell, Search, Plus, Trash2, X } from 'lucide-react';
import api from '../../lib/api';

interface Notification {
  id: string;
  student_name: string | null;
  roll_number: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    student_id: '' // Optional, for global leave empty
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/gamification/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const openModal = () => {
    setFormData({ title: '', message: '', student_id: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send null if student_id is empty for global notifications
      const payload = {
        ...formData,
        student_id: formData.student_id.trim() === '' ? null : formData.student_id
      };
      await api.post('/admin/gamification/notifications', payload);
      closeModal();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to create notification', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await api.delete(`/admin/gamification/notifications/${id}`);
        fetchNotifications();
      } catch (err) {
        console.error('Failed to delete notification', err);
      }
    }
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.message.toLowerCase().includes(search.toLowerCase()) ||
    (n.student_name && n.student_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System Notifications
          </h1>
          <p className="text-slate-500 mt-1">Send announcements and manage alerts.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search notifications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading notifications...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Title & Message</th>
                  <th className="px-6 py-3.5 font-medium">Recipient</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium">Date</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredNotifications.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No notifications found</td></tr>
                ) : filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{notif.title}</div>
                      <div className="text-xs text-slate-500 max-w-md truncate">{notif.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      {notif.student_name ? (
                        <div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">{notif.student_name}</div>
                          <div className="text-xs text-slate-400">Roll: {notif.roll_number}</div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400">
                          Global Announcement
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {notif.is_read ? (
                        <span className="text-xs font-medium text-slate-400">Read</span>
                      ) : (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Unread</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(notif.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                Send Notification
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Notification Title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Type message here..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specific Student ID (Optional)</label>
                <input type="text" value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="UUID of student (Leave empty for Global)" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
