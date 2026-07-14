import { User, Mail, Phone, Building, ShieldCheck, KeyRound, Smartphone } from 'lucide-react';

export default function AdminProfile() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Profile</h1>
          <p className="text-slate-500">Manage your personal information and security settings.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Banner & Avatar */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl">
              HS
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              HARIHARAN S 
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </h2>
            <p className="text-slate-500">Super Administrator</p>
          </div>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pb-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <Mail className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Email Address</p>
                  <p className="text-sm">admin@mountzion.ac.in</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <Phone className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Phone Number</p>
                  <p className="text-sm">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <Building className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Department</p>
                  <p className="text-sm">Computer Science and Engineering</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Security & Authentication</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  <KeyRound className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Password</p>
                    <p className="text-xs">Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">Change</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  <Smartphone className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-emerald-500 font-medium">Enabled</p>
                  </div>
                </div>
                <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">Manage</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
