import { useState, useEffect, useRef } from 'react';
import { User, Mail, Hash, BookOpen, Calendar, Shield, Save, Edit3, Camera, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function StudentProfile() {
  const [student, setStudent] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/student/profile');
        setStudent(response.data);
        localStorage.setItem("current_student", JSON.stringify(response.data));
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
        const stored = localStorage.getItem("current_student");
        if (stored) {
          setStudent(JSON.parse(stored));
        }
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/student/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStudent((prev: any) => ({ ...prev, photoUrl: res.data.photoUrl }));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  if (!student) {
    return (
      <div className="h-full flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4 text-indigo-600">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-medium animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const photoBase = student.photoUrl ? `http://localhost:8003${student.photoUrl}` : null;
  const email = student.email || `${student.name.replace(/\s+/g, '').toLowerCase()}@mountzion.ac.in`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            My Profile
          </h1>
          <p className="text-slate-500 mt-1">View and manage your personal student details.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <div className="relative mt-8 mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-xl relative z-10">
                <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
                  {photoBase ? (
                    <img src={photoBase} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name.substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity m-1.5">
                {uploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{student.name}</h2>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">{student.roll}</p>
            
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4 text-sm text-slate-500">
              <div className="flex flex-col items-center">
                <span className="font-bold text-slate-900 dark:text-white">12</span>
                <span className="text-xs">Sessions</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-slate-900 dark:text-white">A+</span>
                <span className="text-xs">Avg Grade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
              <p className="text-sm text-slate-500">Contact admin if any of this information is incorrect.</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <div className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {student.name}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Hash className="w-3.5 h-3.5" /> Roll Number
                </label>
                <div className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {student.roll}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Hash className="w-3.5 h-3.5" /> SPR Number
                </label>
                <div className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {student.spdNo}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <div className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 truncate">
                  {email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5" /> Department
                </label>
                <div className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {student.dept}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Academic Year
                </label>
                <div className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {student.year}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5" /> Section
                </label>
                <div className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {student.section}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
