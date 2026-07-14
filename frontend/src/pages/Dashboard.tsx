import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Target, Users, Flame, MessageCircle, Medal, Zap, BookOpen, User, ArrowUpRight } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  department: string;
  score: number;
}

interface DashboardData {
  leaderboard: LeaderboardEntry[];
  discussions: {
    prepTime: string;
    discussionTime: string;
  };
  currentLevel: string;
  systemAnalytics: {
    studentsParticipated: number;
    groups: number;
  };
  overview: {
    dailyStreak: number;
    communicationScore: number;
  };
  badgesEarned: { name: string; icon: string }[];
}

const defaultData: DashboardData = {
  leaderboard: [],
  discussions: { prepTime: '-', discussionTime: '-' },
  currentLevel: '-',
  systemAnalytics: { studentsParticipated: 0, groups: 0 },
  overview: { dailyStreak: 0, communicationScore: 0 },
  badgesEarned: []
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Determine WebSocket URL based on current host (assuming backend on 8000)
    const ws = new WebSocket('ws://localhost:8002/api/dashboard/ws');
    
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setData(payload);
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              AI Discussion Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></span>
              {connected ? 'Live Updates Active' : 'Connecting to Server...'}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-2">
            <User className="text-indigo-400 w-5 h-5" />
            <span className="font-medium text-sm">HARIHARAN S</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Left Column (Stats & Overview) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 text-orange-400 mb-2">
                  <Flame className="w-5 h-5" />
                  <h3 className="font-semibold">Daily Streak</h3>
                </div>
                <div className="text-3xl font-bold">{data.overview.dailyStreak} <span className="text-sm text-slate-500 font-normal">Days</span></div>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Comm. Score</h3>
                </div>
                <div className="text-3xl font-bold flex items-end gap-2">
                  {data.overview.communicationScore}
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 mb-1" />
                </div>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 text-blue-400 mb-2">
                  <Target className="w-5 h-5" />
                  <h3 className="font-semibold">Current Level</h3>
                </div>
                <div className="text-xl font-bold mt-1">{data.currentLevel}</div>
              </motion.div>
            </div>

            {/* Middle Row: System Analytics & Discussions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> System Analytics</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3"><Users className="w-5 h-5 text-indigo-400" /> <span className="text-slate-300">Students Participated</span></div>
                    <span className="font-bold text-xl">{data.systemAnalytics.studentsParticipated}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3"><Users className="w-5 h-5 text-purple-400" /> <span className="text-slate-300">Active Groups</span></div>
                    <span className="font-bold text-xl">{data.systemAnalytics.groups}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400" /> Discussions</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-xl flex justify-center items-center gap-3">
                    <BookOpen className="w-5 h-5 text-cyan-500" />
                    <span className="font-semibold text-cyan-100">{data.discussions.prepTime}</span>
                  </div>
                  <div className="p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-xl flex justify-center items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    <span className="font-semibold text-indigo-100">{data.discussions.discussionTime}</span>
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Badges Earned Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Medal className="w-5 h-5 text-yellow-500" /> Badges Earned</h2>
              <div className="flex flex-wrap gap-4">
                {data.badgesEarned.map((badge, idx) => (
                  <motion.div key={idx} whileHover={{ y: -2 }} className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 text-sm font-medium">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    {badge.name}
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Leaderboard) */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Dept Leaderboard</h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">Live</span>
            </div>
            <div className="flex-1 space-y-3">
              <AnimatePresence>
                {data.leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 relative overflow-hidden"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : index === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' : index === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/50' : 'bg-slate-800 text-slate-400'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 font-medium text-sm">
                      {entry.department}
                    </div>
                    <div className="font-bold text-indigo-400">
                      {entry.score}
                    </div>
                    {/* Tiny animated flash when score updates implicitly by key being same but layout changes */}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
