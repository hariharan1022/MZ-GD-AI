import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Award, Download, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import api from '../../lib/api';

interface AnalyticsSummary {
  avg_college_score: number;
  top_department: string;
  top_department_score: number;
  active_participants_percentage: number;
}

export default function AdminAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [summaryRes, deptRes, trendsRes] = await Promise.all([
          api.get('/admin/analytics/summary'),
          api.get('/admin/analytics/departments'),
          api.get('/admin/analytics/trends')
        ]);
        setSummary(summaryRes.data);
        setDepartmentData(deptRes.data);
        setTrendsData(trendsRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System Analytics
          </h1>
          <p className="text-slate-500 mt-1">Analyze student performance trends and AI engagement metrics across the college.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Avg College Score</h3>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? '-' : summary?.avg_college_score || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Top Department</h3>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? '-' : summary?.top_department || 'N/A'}
            </p>
            <span className="text-xs font-medium text-slate-400 mb-1">
              {!loading && `${summary?.top_department_score} avg score`}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Active Participants</h3>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? '-' : `${summary?.active_participants_percentage || 0}%`}
            </p>
            <span className="text-xs font-medium text-slate-400 mb-1">of registered</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Department Comparison Chart</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">Loading chart...</div>
          ) : departmentData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">No data available</div>
          ) : (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Monthly Progress Trends</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">Loading chart...</div>
          ) : trendsData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">No data available</div>
          ) : (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
