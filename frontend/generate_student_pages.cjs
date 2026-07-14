const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'StudentUpcoming', icon: 'CalendarClock', title: 'Upcoming Discussions', desc: 'View and join scheduled AI group discussions.' },
  { name: 'StudentActive', icon: 'Radio', title: 'Active Discussion', desc: 'Join your ongoing live discussion session.' },
  { name: 'StudentHistory', icon: 'History', title: 'Discussion History', desc: 'Review your past performance and sessions.' },
  { name: 'StudentReports', icon: 'FileText', title: 'AI Reports', desc: 'Deep dive into your communication analysis.' },
  { name: 'StudentAnalytics', icon: 'TrendingUp', title: 'Progress Analytics', desc: 'Track your growth and skill improvement over time.' },
  { name: 'StudentAchievements', icon: 'Medal', title: 'Achievements & Badges', desc: 'View your earned badges and unlockable rewards.' },
  { name: 'StudentCertificates', icon: 'Award', title: 'Certificates', desc: 'Download your official completion certificates.' },
  { name: 'StudentNotifications', icon: 'Bell', title: 'Notifications Hub', desc: 'Stay updated on your upcoming activities.' },
  { name: 'StudentProfile', icon: 'User', title: 'My Profile', desc: 'Manage your personal information and preferences.' },
  { name: 'StudentHelp', icon: 'LifeBuoy', title: 'Help & Support', desc: 'Get assistance with the platform.' }
];

const template = (p) => `import { ${p.icon}, Search, Filter } from 'lucide-react';

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
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <${p.icon} className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No data available yet</h2>
          <p className="text-slate-500 max-w-sm">This module is currently being connected to the AI backend services. Check back soon for live data!</p>
        </div>
      </div>
    </div>
  );
}
`;

const dir = path.join(__dirname, 'src', 'pages', 'student');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

pages.forEach(p => {
  fs.writeFileSync(path.join(dir, p.name + '.tsx'), template(p));
  console.log('Created ' + p.name + '.tsx');
});
