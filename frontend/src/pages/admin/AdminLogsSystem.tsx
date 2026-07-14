import { useState, useEffect } from 'react';
import { TerminalSquare, RefreshCw, Download, Server, AlertCircle } from 'lucide-react';

const mockSystemLogs = [
  "[2026-07-13 14:02:11] INFO: FastAPI application started successfully.",
  "[2026-07-13 14:02:12] INFO: Connecting to PostgreSQL database at localhost:5432...",
  "[2026-07-13 14:02:13] INFO: Database connection established.",
  "[2026-07-13 14:05:01] INFO: [GET] /api/admin/gamification/leaderboard - 200 OK - 45ms",
  "[2026-07-13 14:12:45] WARNING: High memory usage detected (85%). Consider scaling resources.",
  "[2026-07-13 14:15:22] ERROR: Timeout querying LLM provider (Ollama). Retrying...",
  "[2026-07-13 14:15:25] INFO: LLM query successful on retry.",
  "[2026-07-13 14:20:01] INFO: [POST] /api/admin/gamification/notifications - 201 Created - 112ms",
  "[2026-07-13 14:31:18] INFO: WebSocket connection established from 192.168.1.44 (Session ID: 8821)",
  "[2026-07-13 14:45:00] INFO: Scheduled backup completed successfully.",
];

export default function AdminLogsSystem() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching logs
    const timer = setTimeout(() => {
      setLogs(mockSystemLogs);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const refreshLogs = () => {
    setLoading(true);
    setTimeout(() => {
      setLogs([...mockSystemLogs, `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] INFO: Logs refreshed by admin.`]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TerminalSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System Logs
          </h1>
          <p className="text-slate-500 mt-1">Real-time terminal view for server health and API errors.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refreshLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-slate-950 rounded-xl shadow-sm border border-slate-800 overflow-hidden font-mono text-sm">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-slate-400">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              bash ~ backend/server.log
            </div>
            <div className="p-4 h-[500px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Fetching logs...
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`
                        ${log.includes('ERROR') ? 'text-rose-400 font-medium bg-rose-500/10 -mx-4 px-4 py-0.5' : ''}
                        ${log.includes('WARNING') ? 'text-amber-400 font-medium' : ''}
                        ${!log.includes('ERROR') && !log.includes('WARNING') ? 'text-slate-300' : ''}
                      `}
                    >
                      {log}
                    </div>
                  ))}
                  <div className="text-slate-500 pt-2 animate-pulse">_</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-indigo-500" />
              Server Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">CPU Usage</span>
                  <span className="font-medium text-slate-900 dark:text-white">45%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Memory</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">85%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Disk Space</span>
                  <span className="font-medium text-slate-900 dark:text-white">22%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-5">
            <h3 className="font-semibold text-rose-800 dark:text-rose-400 flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" />
              Active Alerts
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-300">
              High memory usage detected. The LLM processes might be causing a spike. Consider restarting the inference engine if performance degrades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
