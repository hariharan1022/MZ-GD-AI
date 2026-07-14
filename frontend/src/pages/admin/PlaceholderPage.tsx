import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title} Module</h1>
      <p className="text-slate-500 max-w-md">
        This section is part of the Enterprise architecture. 
        It is ready to be wired up to the backend databases and AI models in the next phases.
      </p>
    </div>
  );
}
