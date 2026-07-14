import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Target, Sparkles, BookOpen, Mic2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { api } from '../../services/api';

interface HistoryPoint {
  date: string;
  topic: string;
  overall: number;
  grammar: number;
  fluency: number;
  confidence: number;
}

export default function StudentAnalytics() {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/student/analytics');
        setHistory(response.data.history || []);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Compute stats averages
  const count = history.length;
  const avgOverall = count > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.overall, 0) / count) : 0;
  const avgGrammar = count > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.grammar, 0) / count) : 0;
  const avgFluency = count > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.fluency, 0) / count) : 0;
  const avgConfidence = count > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.confidence, 0) / count) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Progress Analytics
          </h1>
          <p className="text-slate-500 mt-1">Track your grammar, fluency, confidence, and overall score trend over time.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-indigo-600">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="font-medium animate-pulse text-sm">Calculating Performance metrics...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Performance Data Yet</h2>
            <p className="text-slate-500 max-w-sm mb-4">Complete practice chats or group discussions to record and plot your scores here!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Avg Score</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{avgOverall}%</span>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Grammar</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{avgGrammar}%</span>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Fluency</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{avgFluency}%</span>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Mic2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Confidence</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{avgConfidence}%</span>
              </div>
            </Card>
          </div>

          {/* Interactive Chart */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Communication Score Trends</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-6">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#1e293b', 
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px' 
                      }} 
                    />
                    <Legend iconType="circle" fontSize={12} wrapperStyle={{ paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="overall" name="Overall Avg" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="grammar" name="Grammar" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="fluency" name="Fluency" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
