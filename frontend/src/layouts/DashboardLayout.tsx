import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, LayoutDashboard, Settings, LogOut, MessageSquare, BarChart, Trophy, Sparkles, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ role }: { role: "admin" | "student" }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const adminLinks = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Sessions", path: "/admin/sessions", icon: MessageSquare },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart },
  ];

  const studentLinks = [
    { name: "Dashboard", path: "/student", icon: LayoutDashboard },
    { name: "Daily Challenge", path: "/student/challenge", icon: Flame },
    { name: "Practice Room", path: "/student/practice", icon: Sparkles },
    { name: "Discussions", path: "/student/discussions", icon: MessageSquare },
    { name: "Leaderboard", path: "/student/leaderboard", icon: Trophy },
    { name: "Settings", path: "/student/settings", icon: Settings },
  ];

  const navItems = role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 flex flex-col shadow-sm relative z-10">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <img src="/mzcet-logo.jpeg" alt="MZCET Logo" className="w-10 h-10 rounded-full object-cover shadow-sm" />
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
            MZ AI Discussion
          </h2>
        </div>
        <div className="px-6 py-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{role} Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto relative">
        <div className="p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
