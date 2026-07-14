import fs from 'fs';
import path from 'path';

const pages = [
  { name: 'AdminDepartments', icon: 'Building2', title: 'Department Management', desc: 'Manage college departments and HOD assignments.' },
  { name: 'AdminYears', icon: 'GraduationCap', title: 'Academic Years', desc: 'Configure academic years and curriculum rules.' },
  { name: 'AdminSections', icon: 'Layers', title: 'Sections Management', desc: 'Manage class sections and student distribution.' },
  { name: 'AdminRooms', icon: 'MessagesSquare', title: 'Live Discussion Rooms', desc: 'Monitor active real-time WebSocket discussion rooms.' },
  { name: 'AdminTopics', icon: 'Library', title: 'Topics Library', desc: 'Curate AI discussion topics and prompt templates.' },
  { name: 'AdminPractice', icon: 'Mic2', title: 'Practice Rooms', desc: 'Configure solo AI interview practice settings.' },
  { name: 'AdminReports', icon: 'FileText', title: 'System Reports', desc: 'Generate and export PDF/Excel reports.' },
  { name: 'AdminLeaderboard', icon: 'Trophy', title: 'Global Leaderboard', desc: 'View top performing students across the college.' },
  { name: 'AdminAchievements', icon: 'Medal', title: 'Achievements & Badges', desc: 'Configure gamification badges and XP thresholds.' },
  { name: 'AdminAttendance', icon: 'UserCheck', title: 'Attendance Tracking', desc: 'Monitor student participation and session attendance.' },
  { name: 'AdminModels', icon: 'BrainCircuit', title: 'AI Models Hub', desc: 'Manage local Ollama LLMs and whisper models.' },
  { name: 'AdminNotifications', icon: 'Bell', title: 'Notifications', desc: 'Send announcements and manage system alerts.' },
  { name: 'AdminCalendar', icon: 'CalendarDays', title: 'Academic Calendar', desc: 'Schedule global events and discussion weeks.' },
  { name: 'AdminData', icon: 'Database', title: 'Data Operations', desc: 'Bulk import/export and database maintenance.' },
  { name: 'AdminLogsActivity', icon: 'Activity', title: 'Activity Logs', desc: 'Audit trail of all administrative and student actions.' },
  { name: 'AdminLogsSystem', icon: 'TerminalSquare', title: 'System Logs', desc: 'Server health, API errors, and WebSocket diagnostics.' },
  { name: 'AdminHelp', icon: 'LifeBuoy', title: 'Help & Support', desc: 'Platform documentation and technical support.' }
];

const template = (p) => `import { useState } from 'react';
import { ${p.icon}, Search, Plus, Filter, MoreVertical } from 'lucide-react';

export default function ${p.name}() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <${p.icon} className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ${p.title}
          </h1>
          <p className="text-slate-500 mt-1">${p.desc}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search records..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium">ID / Name</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium">Last Updated</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">Sample Record {i}</div>
                    <div className="text-xs text-slate-500">System generated</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">Just now</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
`;

pages.forEach(p => {
  const file = path.join(process.cwd(), 'src/pages/admin', `${p.name}.tsx`);
  fs.writeFileSync(file, template(p));
  console.log(`Generated ${p.name}.tsx`);
});
