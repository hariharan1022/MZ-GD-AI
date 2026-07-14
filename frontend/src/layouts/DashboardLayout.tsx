import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, LayoutDashboard, Settings, LogOut, MessageSquare, BarChart, Trophy, Sparkles, Flame, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ role }: { role: "admin" | "student" }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminLinks = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Manage Students", path: "/admin/students", icon: Users },
    { name: "Discussion Sessions", path: "/admin/sessions", icon: MessageSquare },
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

  const links = role === "admin" ? adminLinks : studentLinks;

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}mzcet-logo.jpeg`} alt="MZCET Logo" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            MZ AI Discussion
          </h2>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-100"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 hover:scale-[1.02]"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "text-indigo-100" : "text-slate-400"}`} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}mzcet-logo.jpeg`} alt="MZCET Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">MZ AI</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] bg-white border-r flex-col sticky top-0 h-screen shadow-sm z-30">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full h-screen relative pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
