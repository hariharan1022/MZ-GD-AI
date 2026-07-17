import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, Layers, 
  MessageSquare, MessagesSquare, Library, BrainCircuit, Mic2,
  FileText, BarChart3, Trophy, Medal, Bell, CalendarDays, 
  UserCheck, Database, Settings, User, Activity, TerminalSquare, 
  LifeBuoy, LogOut, Search, Menu, X, Sun, Moon, ListOrdered
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

const sidebarGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ]
  },
  {
    title: 'Academic',
    items: [
      { name: 'Students', icon: Users, path: '/admin/students' },
      { name: 'Departments', icon: Building2, path: '/admin/departments' },
      { name: 'Years', icon: GraduationCap, path: '/admin/years' },
      { name: 'Sections', icon: Layers, path: '/admin/sections' },
    ]
  },
  {
    title: 'Discussions',
    items: [
      { name: 'Sessions', icon: MessageSquare, path: '/admin/sessions' },
      { name: 'Rooms', icon: MessagesSquare, path: '/admin/rooms' },
      { name: 'Topics Library', icon: Library, path: '/admin/topics' },
      { name: 'Practice Rooms', icon: Mic2, path: '/admin/practice' },
      { name: 'GD Management', icon: ListOrdered, path: '/admin/gd' },
    ]
  },
  {
    title: 'Performance',
    items: [
      { name: 'Reports', icon: FileText, path: '/admin/reports' },
      { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
      { name: 'Leaderboard', icon: Trophy, path: '/admin/leaderboard' },
      { name: 'Achievements', icon: Medal, path: '/admin/achievements' },
      { name: 'Attendance', icon: UserCheck, path: '/admin/attendance' },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'AI Models', icon: BrainCircuit, path: '/admin/models' },
      { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
      { name: 'Calendar', icon: CalendarDays, path: '/admin/calendar' },
      { name: 'Data Operations', icon: Database, path: '/admin/data' },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', icon: Settings, path: '/admin/settings' },
      { name: 'Profile', icon: User, path: '/admin/profile' },
      { name: 'Activity Logs', icon: Activity, path: '/admin/logs/activity' },
      { name: 'System Logs', icon: TerminalSquare, path: '/admin/logs/system' },
      { name: 'Help & Support', icon: LifeBuoy, path: '/admin/help' },
    ]
  }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        w-64 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <img src={`${import.meta.env.BASE_URL}mzcet-logo.jpeg`} alt="MZCET Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MZ AI Admin
              </span>
            )}
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {sidebarGroups.map((group, i) => (
            <div key={i} className="mb-6">
              {sidebarOpen && (
                <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item, j) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <li key={j} className="px-2">
                      <Link
                        to={item.path}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                          ${isActive 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }
                          ${!sidebarOpen ? 'justify-center px-0' : ''}
                        `}
                        title={!sidebarOpen ? item.name : undefined}
                      >
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                        {sidebarOpen && <span>{item.name}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <Link to="/admin/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                HS
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Admin User</p>
                <p className="text-xs text-slate-500 leading-tight">Super Admin</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
