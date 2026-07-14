import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarClock, Radio, History, 
  FileText, Mic2, Flame, Trophy, Medal, Award, 
  TrendingUp, Bell, User, Settings, LifeBuoy, 
  LogOut, Menu, X, Sun, Moon, Sparkles, ChevronRight, Hash, Star
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

const sidebarGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    ]
  },
  {
    title: 'Active Learning',
    items: [
      { name: 'Upcoming Discussions', icon: CalendarClock, path: '/student/upcoming' },
      { name: 'Active Discussion', icon: Radio, path: '/student/active', highlight: true },
      { name: 'Practice Room', icon: Mic2, path: '/student/practice' },
      { name: 'Daily Challenge', icon: Flame, path: '/student/challenge' },
    ]
  },
  {
    title: 'Analytics & Progress',
    items: [
      { name: 'Discussion History', icon: History, path: '/student/history' },
      { name: 'AI Reports', icon: FileText, path: '/student/reports' },
      { name: 'Progress Analytics', icon: TrendingUp, path: '/student/analytics' },
      { name: 'Leaderboard', icon: Trophy, path: '/student/leaderboard' },
      { name: 'Achievements', icon: Medal, path: '/student/achievements' },
      { name: 'Credit Points', icon: Award, path: '/student/certificates' },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'Notifications', icon: Bell, path: '/student/notifications' },
      { name: 'Profile', icon: User, path: '/student/profile' },
      { name: 'Settings', icon: Settings, path: '/student/settings' },
      { name: 'Help & Support', icon: LifeBuoy, path: '/student/help' },
    ]
  }
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('current_student');
    navigate('/login');
  };

  const currentStudentStr = localStorage.getItem('current_student');
  const student = currentStudentStr ? JSON.parse(currentStudentStr) : {
    name: 'Student',
    roll: 'N/A',
    dept: 'N/A',
    year: 'N/A',
    section: 'N/A',
    spdNo: 'N/A'
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        w-72 transform transition-transform duration-300 ease-in-out flex flex-col shadow-sm
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}
      `}>
        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <img src="/mzcet-logo.jpeg" alt="MZCET Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MZ AI Platform
              </span>
            )}
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {sidebarGroups.map((group, i) => (
            <div key={i} className="mb-6">
              {sidebarOpen && (
                <h3 className="px-5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1.5 px-3">
                {group.items.map((item, j) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <li key={j}>
                      <Link
                        to={item.path}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                          ${isActive 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/50' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                          }
                          ${!sidebarOpen ? 'justify-center px-0' : ''}
                        `}
                        title={!sidebarOpen ? item.name : undefined}
                      >
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-100' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} ${item.highlight && !isActive ? 'text-rose-500' : ''}`} />
                        {sidebarOpen && (
                          <div className="flex-1 flex justify-between items-center">
                            <span className="font-medium">{item.name}</span>
                            {item.highlight && (
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Top Header - Rich Profile Bar */}
        <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30">
          <div className="h-16 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumb / Page Title equivalent space */}
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>Learning Portal</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-900 dark:text-white capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

              {/* Condensed Header Profile */}
              <Link to="/student/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{student.name}</p>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 leading-tight flex items-center justify-end gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" /> Student
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white dark:border-slate-800">
                  {getInitials(student.name)}
                </div>
              </Link>
            </div>
          </div>
          
          {/* Sub-header with detailed student info (Desktop only) */}
          <div className="hidden lg:flex h-12 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50 px-8 items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5" title="Roll Number"><Hash className="w-3.5 h-3.5" /> {student.roll}</div>
              <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {student.dept}</div>
              <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {student.year}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                Active Student
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative w-full p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

// Ensure icons used in subheader are imported
import { Building2, GraduationCap } from 'lucide-react';
