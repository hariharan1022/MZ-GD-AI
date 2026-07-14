import { useState } from 'react';
import { Database, Download, Upload, Server, RefreshCw, FileText } from 'lucide-react';
import api from '../../lib/api';

export default function AdminData() {
  const [exportingStudents, setExportingStudents] = useState(false);
  const [exportingAnalytics, setExportingAnalytics] = useState(false);

  const handleExportStudents = async () => {
    setExportingStudents(true);
    try {
      const response = await api.get('/admin/ops/export/students', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('href' as any);
      link.href = url;
      link.setAttribute('download', 'students_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setExportingStudents(false);
    }
  };

  const handleExportAnalytics = async () => {
    setExportingAnalytics(true);
    try {
      const response = await api.get('/admin/ops/export/analytics', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('href' as any);
      link.href = url;
      link.setAttribute('download', 'analytics_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setExportingAnalytics(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Data Operations
          </h1>
          <p className="text-slate-500 mt-1">Bulk import/export and database maintenance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Export Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Data Export</h2>
              <p className="text-sm text-slate-500">Download system data in CSV format.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">Students Roster</h3>
                <p className="text-xs text-slate-500 mt-1">Export all registered students and their details.</p>
              </div>
              <button 
                onClick={handleExportStudents} 
                disabled={exportingStudents}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium text-sm rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {exportingStudents ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {exportingStudents ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">AI Analytics & Scores</h3>
                <p className="text-xs text-slate-500 mt-1">Export all student performance scores and timestamps.</p>
              </div>
              <button 
                onClick={handleExportAnalytics} 
                disabled={exportingAnalytics}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium text-sm rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {exportingAnalytics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {exportingAnalytics ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Data Import Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 opacity-75">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Data Import</h2>
              <p className="text-sm text-slate-500">Bulk upload records via CSV (Coming Soon).</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <Server className="w-8 h-8 text-slate-400 mb-3" />
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Drag and drop CSV files</h3>
              <p className="text-xs text-slate-500 mb-4">Supports Students and Departments imports</p>
              <button disabled className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium text-sm rounded-lg cursor-not-allowed">
                Browse Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
