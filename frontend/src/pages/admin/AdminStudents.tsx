import { useState, useEffect } from "react";
import { Search, Plus, Upload, Edit, Trash2, Users, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/services/api";

export default function AdminStudents() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const [students, setStudents] = useState<any[]>([]);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/admin/students");
      const formattedStudents = response.data.map((s: any) => ({
        id: s.id,
        roll: s.roll_number,
        name: s.name,
        dept: s.department_name || "CSE",
        year: s.year_level ? `Year ${s.year_level}` : "Year 1",
        section: s.section_name || "Section A"
      }));
      setStudents(formattedStudents);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const [newStudent, setNewStudent] = useState({
    firstName: "", lastName: "", roll: "", email: "", dept: "CSE", year: "Year 3"
  });

  const handleAddStudent = async () => {
    if (!newStudent.firstName || !newStudent.roll) {
      alert("Please enter at least First Name and Roll Number");
      return;
    }
    
    try {
      const s = {
        roll: newStudent.roll,
        name: `${newStudent.firstName} ${newStudent.lastName}`.trim(),
        dept: newStudent.dept,
        year: newStudent.year,
        section: "Section A"
      };
      await api.post("/admin/students/bulk", [s]);
      await fetchStudents();
      setIsAddOpen(false);
      setNewStudent({ firstName: "", lastName: "", roll: "", email: "", dept: "CSE", year: "Year 3" });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add student");
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/admin/students/${id}`);
        await fetchStudents();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to delete student");
      }
    }
  };

  const handleClearAll = () => {
    alert("Clear All disabled for safety in production backend. Use database operations for bulk delete.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Student Management
          </h1>
          <p className="text-slate-500 mt-1">Manage all registered students, upload batch lists, and update details.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-lg text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>

          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                <Upload className="w-4 h-4 text-slate-500" />
                Import Excel
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Bulk Import Students</DialogTitle>
                <DialogDescription>Upload a .csv or .xlsx file to register multiple students at once.</DialogDescription>
              </DialogHeader>
              <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Drag and drop file here, or click to browse</p>
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  className="hidden" 
                  id="file-upload" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append("file", file);
                    
                    try {
                      const response = await api.post("/admin/students/import-excel", formData, {
                        headers: {
                          "Content-Type": "multipart/form-data"
                        }
                      });
                      
                      const data = response.data;
                      const counts = data.counts;
                      let msg = `Excel Import Summary:\n`;
                      msg += `- Inserted: ${counts.inserted}\n`;
                      msg += `- Updated: ${counts.updated}\n`;
                      msg += `- Skipped: ${counts.skipped}\n`;
                      msg += `- Failed: ${counts.failed}\n`;
                      
                      if (data.errors && data.errors.length > 0) {
                        msg += `\nErrors:\n` + data.errors.slice(0, 10).join('\n');
                        if (data.errors.length > 10) {
                          msg += `\n...and ${data.errors.length - 10} more errors.`;
                        }
                      }
                      
                      alert(msg);
                      await fetchStudents();
                      setIsImportOpen(false);
                    } catch (err: any) {
                      console.error(err);
                      alert(err.response?.data?.detail || "Failed to import students to the backend.");
                    }
                  }}
                />
                <label htmlFor="file-upload" className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-100 transition-colors">
                  Select File
                </label>
              </div>
              <DialogFooter>
                <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900" onClick={() => setIsImportOpen(false)}>Cancel</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-500" />
            Export
          </button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Manually register a single student to the platform.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="John" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="Doe" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Roll Number</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="2026CSE123" value={newStudent.roll} onChange={e => setNewStudent({...newStudent, roll: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" placeholder="john@mountzion.ac.in" type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" value={newStudent.dept} onChange={e => setNewStudent({...newStudent, dept: e.target.value})}>
                      <option>CSE</option>
                      <option>IT</option>
                      <option>ECE</option>
                      <option>MECH</option>
                      <option>CIVIL</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" value={newStudent.year} onChange={e => setNewStudent({...newStudent, year: e.target.value})}>
                      <option>Year 1</option>
                      <option>Year 2</option>
                      <option>Year 3</option>
                      <option>Year 4</option>
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm" onClick={handleAddStudent}>Save Student</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search students by roll number or name..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option>All Departments</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
            </select>
            <select className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option>All Years</option>
              <option>Year 1</option>
              <option>Year 2</option>
              <option>Year 3</option>
              <option>Year 4</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Roll Number</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Name</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Department</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Year</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Section</th>
                <th className="px-6 py-3.5 font-medium text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{student.roll}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {student.dept}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.year}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.section}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Student ({student.roll})</DialogTitle>
                            <DialogDescription>Modify student details.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                              <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" defaultValue={student.name} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                              <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" defaultValue={student.dept} />
                            </div>
                          </div>
                          <DialogFooter>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors" onClick={() => alert("Saved!")}>Save Changes</button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <button 
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                      <p>No students found.</p>
                      <p className="text-sm mt-1">Add a new student or import a list to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 text-sm">
          <p className="text-slate-500">Showing <span className="font-medium text-slate-900 dark:text-white">1</span> to <span className="font-medium text-slate-900 dark:text-white">{students.length}</span> of <span className="font-medium text-slate-900 dark:text-white">{students.length}</span> results</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
