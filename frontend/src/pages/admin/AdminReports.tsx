import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, MoreVertical, Eye } from 'lucide-react';
import api from '../../lib/api';

interface Report {
  score_id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  overall_score: number;
  created_at: string;
  strengths: string | null;
  weaknesses: string | null;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/reports');
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => 
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    r.department_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System Reports
          </h1>
          <p className="text-slate-500 mt-1">Review student performance records and AI-generated feedback.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by student, roll number, or dept..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading reports...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Student Name</th>
                  <th className="px-6 py-3.5 font-medium">Roll No</th>
                  <th className="px-6 py-3.5 font-medium">Department</th>
                  <th className="px-6 py-3.5 font-medium">Score</th>
                  <th className="px-6 py-3.5 font-medium">Date</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredReports.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No reports found</td></tr>
                ) : filteredReports.map((report) => (
                  <tr key={report.score_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {report.student_name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {report.roll_number}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        {report.department_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${report.overall_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : report.overall_score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {report.overall_score} / 100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                        title="View Full Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedReport.student_name}'s Report</h2>
                <p className="text-sm text-slate-500">{selectedReport.department_name} | Roll: {selectedReport.roll_number}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{selectedReport.overall_score}</div>
                <div className="text-xs text-slate-500">Overall Score</div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2 text-emerald-600 dark:text-emerald-400">Key Strengths</h3>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-lg text-sm text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap">
                  {selectedReport.strengths || 'No strengths recorded.'}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2 text-rose-600 dark:text-rose-400">Areas for Improvement</h3>
                <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-lg text-sm text-rose-800 dark:text-rose-200 whitespace-pre-wrap">
                  {selectedReport.weaknesses || 'No weaknesses recorded.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
