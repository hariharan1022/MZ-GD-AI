import { Activity, Users, Database, Server, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
          <p className="text-slate-500">Welcome back. Here's what's happening with your platform today.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Create Discussion
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Students', value: '2,834', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Sessions', value: '42', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'AI Tokens Used', value: '1.2M', icon: Server, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Database Health', value: '99.9%', icon: Database, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12%
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Platform Usage</h2>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950/50">
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Chart Placeholder (Integrate Recharts here)
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[
              { title: 'New Student Registered', time: '5 mins ago', desc: 'John Doe joined CS Department' },
              { title: 'Discussion Ended', time: '12 mins ago', desc: 'Topic: Impact of AI on Jobs' },
              { title: 'Model Updated', time: '2 hours ago', desc: 'llama3.1:8b was pulled successfully' },
              { title: 'Database Backup', time: '5 hours ago', desc: 'Automated backup completed' },
            ].map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-500/10 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">{log.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{log.desc}</p>
                  <p className="text-xs text-slate-400 mt-2">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            View All Logs &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
