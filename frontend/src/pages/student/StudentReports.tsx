import { useState, useEffect } from 'react';
import { FileText, Filter, AlertCircle, Award, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from '../../services/api';

interface Report {
  id: string;
  topic: string;
  score: number;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  date: string;
}

export default function StudentReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/student/reports');
        setReports(response.data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50";
    if (score >= 80) return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50";
    if (score >= 70) return "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50";
    return "text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            AI Reports
          </h1>
          <p className="text-slate-500 mt-1">Deep dive into your communication analysis from completed discussions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-indigo-600">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="font-medium animate-pulse text-sm">Analyzing Reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Reports Available</h2>
            <p className="text-slate-500 max-w-sm mb-4">You haven't completed any group discussion sessions yet. Complete your first session to receive detailed AI feedback reports!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 p-6 flex flex-row flex-wrap justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{report.date}</span>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{report.topic}</CardTitle>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-center ${getScoreColor(report.score)}`}>
                  <div className="text-xl font-bold leading-none">{report.score}</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">Score</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50/20 dark:bg-emerald-950/5 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
                    {report.strengths || "Strengths analysis will be generated upon completion."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-rose-500" /> Weaknesses
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-rose-50/20 dark:bg-rose-950/5 p-4 rounded-xl border border-rose-100/50 dark:border-rose-900/10">
                    {report.weaknesses || "Weaknesses analysis will be generated upon completion."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> AI Suggestions
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-indigo-50/20 dark:bg-indigo-950/5 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/10">
                    {report.suggestions || "Actionable improvement tips will be generated here."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
