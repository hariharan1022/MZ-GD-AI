import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, Star, Flame, Target, Award, Calendar, 
  Clock, TrendingUp, Mic2, PlayCircle, ChevronRight, 
  BookOpen, Brain, MessageSquare, AlertCircle, CheckCircle2,
  BarChart3, Zap, GraduationCap, LayoutDashboard, Medal,
  Sparkles, Radio
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { api } from '@/services/api';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/student/dashboard');
        setData(response.data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4 text-indigo-600">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-medium animate-pulse">Loading AI Learning Environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center min-h-[600px] text-rose-500">
        <AlertCircle className="w-8 h-8 mr-2" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  // Fallback defaults
  const storedStudent = JSON.parse(localStorage.getItem("current_student") || "{}");
  const student = data?.student?.first_name !== "Student" ? data?.student : { 
    first_name: storedStudent.name ? storedStudent.name.split(' ')[0] : "Student" 
  };
  const stats = data?.gamification || { xp: 0, current_level: 1, daily_streak: 0 };
  const upcoming = data?.upcoming_sessions || [];
  const recent = data?.recent_discussions || [];
  const insights = data?.insights || [];
  const areas = data?.areas_to_improve || [
    { name: "Grammar", value: 0, color: "bg-emerald-500" },
    { name: "Vocabulary", value: 0, color: "bg-indigo-500" },
    { name: "Confidence", value: 0, color: "bg-amber-500" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* 1. WELCOME SECTION & ACTIVE DISCUSSION */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* Welcome Card */}
        <motion.div variants={itemVariants} className="xl:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-8 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden flex flex-col justify-between">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Brain className="w-96 h-96" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-xs font-semibold tracking-wide uppercase mb-4">
              <SparklesIcon className="w-3.5 h-3.5" /> AI Communication Assistant
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Welcome back, {student.first_name}! 👋
            </h1>
            <p className="text-indigo-100 text-lg max-w-xl leading-relaxed">
              Ready to improve your communication skills today? You are currently ranked #{data?.dept_rank || 'N/A'} in your department. Let's push for the top 10%!
            </p>
          </div>

          <div className="relative z-10 mt-8 flex flex-wrap gap-4">
            <button onClick={() => navigate('/student/challenge')} className="px-6 py-3 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Start Daily Challenge
            </button>
            <button onClick={() => navigate('/student/practice')} className="px-6 py-3 bg-indigo-700/50 hover:bg-indigo-600/50 border border-indigo-500/50 text-white font-semibold rounded-xl transition-colors backdrop-blur-sm flex items-center gap-2">
              <Mic2 className="w-5 h-5" /> AI Practice Room
            </button>
          </div>
        </motion.div>

        {/* Active Discussion Card (Highlighted) */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-rose-500 shadow-xl shadow-rose-500/10 p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4" />
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            LIVE NOW
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
            The Impact of AI on Future Job Markets
          </h3>
          <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
            <UsersIcon className="w-4 h-4" /> Group 4 • 5/6 Joined
          </p>
          <div className="mt-auto">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-slate-700 dark:text-slate-300">Time Remaining</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">08:45</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4">
              <div className="bg-rose-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <button onClick={() => navigate('/student/active')} className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors shadow-md flex justify-center items-center gap-2">
              <RadioIcon className="w-5 h-5" /> Join Discussion
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. SUMMARY CARDS (10 Stats) */}
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Performance Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total Discussions" value={data?.total_discussions?.toString() || "0"} icon={<MessageSquare className="w-4 h-4 text-blue-500" />} trend="All time" />
          <StatCard title="Avg Score" value={data?.communication_score ? `${data.communication_score}/100` : "N/A"} icon={<Target className="w-4 h-4 text-emerald-500" />} trend="Overall avg" />
          <StatCard title="Best Score" value={data?.best_score ? `${data.best_score}/100` : "N/A"} icon={<Trophy className="w-4 h-4 text-amber-500" />} trend="Highest achieved" />
          <StatCard title="Dept Rank" value={data?.dept_rank ? `#${data.dept_rank}` : "N/A"} icon={<Medal className="w-4 h-4 text-purple-500" />} trend="In department" />
          <StatCard title="Section Rank" value={data?.section_rank ? `#${data.section_rank}` : "N/A"} icon={<Award className="w-4 h-4 text-rose-500" />} trend="In section" />
          <StatCard title="Current Level" value={`Lvl ${stats.current_level || 1}`} icon={<Star className="w-4 h-4 text-amber-500" />} trend={`${stats.xp || 0} XP`} />
          <StatCard title="Daily Streak" value={`${stats.daily_streak || 0} Days`} icon={<Flame className="w-4 h-4 text-orange-500" />} trend="Keep it up!" />
          <StatCard title="Vocabulary" value={areas[1]?.value ? `${areas[1].value}%` : "N/A"} icon={<BookOpen className="w-4 h-4 text-indigo-500" />} trend="Avg Fluency" />
          <StatCard title="Confidence" value={areas[2]?.value ? `${areas[2].value}%` : "N/A"} icon={<Mic2 className="w-4 h-4 text-sky-500" />} trend="Avg Confidence" />
          <StatCard title="Upcoming" value={upcoming.length.toString()} icon={<Calendar className="w-4 h-4 text-teal-500" />} trend="Scheduled sessions" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. MAIN CONTENT COLUMN (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Communication Insights & Weak Areas */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" /> AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.length > 0 ? insights.map((insight: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className={`p-1.5 bg-${insight.color}-100 dark:bg-${insight.color}-900/50 text-${insight.color}-600 rounded-full mt-0.5`}>
                      {insight.icon === 'TrendingUp' && <TrendingUp className="w-3 h-3" />}
                      {insight.icon === 'Star' && <Star className="w-3 h-3" />}
                      {insight.icon === 'AlertCircle' && <AlertCircle className="w-3 h-3" />}
                      {insight.icon === 'MessageSquare' && <MessageSquare className="w-3 h-3" />}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{insight.text}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">Complete more sessions to get AI insights.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-500" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {areas.map((area: any, idx: number) => (
                  <SkillProgress key={idx} name={area.name} value={area.value} color={area.color} />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Discussions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Discussions</h2>
              <Link to="/student/history" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recent.length > 0 ? recent.map((item: any, idx: number) => (
                      <TableRow key={idx} topic={item.topic} date={item.date} score={item.score} grade={item.grade} />
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          No recent discussions found. Join a session to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4. SIDEBAR COLUMN (Right 1/3) */}
        <div className="space-y-8">
          
          {/* Upcoming Discussions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming</h2>
              <Link to="/student/upcoming" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">See Calendar</Link>
            </div>
            <div className="space-y-3">
              {upcoming.length > 0 ? upcoming.map((item: any, idx: number) => (
                <UpcomingCard 
                  key={idx}
                  topic={item.topic} 
                  date={item.date} 
                  group={item.group}
                  time={item.time}
                />
              )) : (
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-center text-sm text-slate-500">
                  No upcoming sessions scheduled.
                </div>
              )}
            </div>
          </motion.div>

          {/* Achievements Showcase */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Achievements</h2>
              <Link to="/student/achievements" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Gallery</Link>
            </div>
            <Card className="shadow-sm">
              <CardContent className="p-5 grid grid-cols-3 gap-4">
                <BadgeItem icon="👑" name="Best Leader" color="bg-amber-100 text-amber-700" />
                <BadgeItem icon="📚" name="Vocab Master" color="bg-purple-100 text-purple-700" />
                <BadgeItem icon="🔥" name="7 Day Streak" color="bg-orange-100 text-orange-700" />
                <BadgeItem icon="🗣️" name="Fluent Speaker" color="bg-sky-100 text-sky-700" />
                <BadgeItem icon="🎯" name="Top Performer" color="bg-emerald-100 text-emerald-700" />
                <div className="flex flex-col items-center justify-center gap-1 opacity-50 grayscale cursor-not-allowed">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-xl">🔒</div>
                  <span className="text-[10px] font-medium text-center leading-tight">Grammar Pro</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1" title={title}>{title}</p>
          <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-md">
            {icon}
          </div>
        </div>
        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{value}</h4>
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{trend}</p>
      </CardContent>
    </Card>
  );
}

function SkillProgress({ name, value, color, hint }: { name: string, value: number, color: string, hint?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-slate-700 dark:text-slate-300">{name}</span>
        <span className="text-slate-900 dark:text-white">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
      </div>
      {hint && <p className="text-[10px] text-rose-500 font-medium mt-1">{hint}</p>}
    </div>
  );
}

function TableRow({ topic, date, score, grade }: { topic: string, date: string, score: string, grade: string }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{topic}</td>
      <td className="px-4 py-3 text-slate-500">{date}</td>
      <td className="px-4 py-3 font-semibold">{score}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {grade}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Report</button>
      </td>
    </tr>
  );
}

function UpcomingCard({ topic, date, group, time }: { topic: string, date: string, group: string, time: string }) {
  return (
    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
      <h4 className="font-bold text-slate-900 dark:text-white mb-1 pr-8">{topic}</h4>
      <div className="space-y-1 mt-3">
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> {date}
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <UsersIcon className="w-3.5 h-3.5" /> {group}
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" /> {time}
        </p>
      </div>
      <button className="absolute right-4 top-4 p-2 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100">
        <PlayCircle className="w-4 h-4" />
      </button>
    </div>
  );
}

function BadgeItem({ icon, name, color }: { icon: string, name: string, color: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" title={name}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${color}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{name}</span>
    </div>
  );
}

// Icons
function SparklesIcon(props: any) {
  return <Sparkles {...props} />;
}
function UsersIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function RadioIcon(props: any) {
  return <Radio {...props} />;
}
