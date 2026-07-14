import { BrainCircuit, Search, Play, Square, RefreshCcw, HardDrive } from 'lucide-react';

export default function AdminModels() {
  const models = [
    { id: 'llama-3-8b', name: 'Llama 3.1 (8B)', type: 'LLM - Text Generation', status: 'Running', ram: '4.8 GB', gpu: 'NVIDIA RTX 4090', usage: '64%' },
    { id: 'whisper-large-v3', name: 'Whisper Large v3', type: 'Speech to Text', status: 'Running', ram: '2.1 GB', gpu: 'NVIDIA RTX 4090', usage: '28%' },
    { id: 'mistral-7b', name: 'Mistral 7B Instruct', type: 'LLM - Text Generation', status: 'Stopped', ram: '0 GB', gpu: '-', usage: '0%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            AI Models Hub
          </h1>
          <p className="text-slate-500 mt-1">Manage local Ollama LLMs and Whisper models.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" />
            Sync Models
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium flex items-center gap-2"><HardDrive className="w-4 h-4" /> GPU VRAM Usage</h3>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">6.9 <span className="text-lg font-normal text-slate-500">GB</span></p>
            <span className="text-xs font-medium text-slate-400 mb-1">/ 24 GB Total</span>
          </div>
          <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '28%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search local models..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium">Model Name</th>
                <th className="px-6 py-3.5 font-medium">Type</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium">VRAM Allocation</th>
                <th className="px-6 py-3.5 font-medium">Hardware</th>
                <th className="px-6 py-3.5 font-medium text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{model.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{model.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{model.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${model.status === 'Running' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400'}`}>
                      {model.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{model.ram}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{model.gpu}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {model.status === 'Running' ? (
                      <button className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-md transition-colors" title="Stop Model">
                        <Square className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md transition-colors" title="Start Model">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
