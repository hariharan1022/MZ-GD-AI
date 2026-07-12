import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Upload, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminStudents() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Dynamic state for students so the UI updates
  const [students, setStudents] = useState<any[]>(() => {
    const saved = localStorage.getItem("mz_students");
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, roll: "2026CSE101", name: "Student 1", dept: "CSE", year: "Year 3", section: "Section A" },
      { id: 2, roll: "2026CSE102", name: "Student 2", dept: "CSE", year: "Year 3", section: "Section A" }
    ];
  });

  // Sync to local storage whenever students change
  useEffect(() => {
    localStorage.setItem("mz_students", JSON.stringify(students));
  }, [students]);

  // Form state for adding new student
  const [newStudent, setNewStudent] = useState({
    firstName: "", lastName: "", roll: "", email: "", dept: "CSE", year: "Year 3"
  });

  const handleAddStudent = () => {
    if (!newStudent.firstName || !newStudent.roll) {
      alert("Please enter at least First Name and Roll Number");
      return;
    }
    
    if (students.find(s => s.roll === newStudent.roll)) {
      alert("A student with this Roll Number already exists!");
      return;
    }
    
    const s = {
      id: Date.now(),
      roll: newStudent.roll,
      name: `${newStudent.firstName} ${newStudent.lastName}`.trim(),
      dept: newStudent.dept,
      year: newStudent.year,
      section: "Section A" // default for simulation
    };
    
    setStudents([...students, s]);
    setIsAddOpen(false);
    setNewStudent({ firstName: "", lastName: "", roll: "", email: "", dept: "CSE", year: "Year 3" });
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Manage students, import lists, and monitor activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2"><Upload className="w-4 h-4" /> Import Excel</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Students</DialogTitle>
                <DialogDescription>Upload an Excel (.xlsx) or CSV file containing student data.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>File Upload</Label>
                  <Input type="file" accept=".xlsx,.csv" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                <Button onClick={() => { alert("Importing..."); setIsImportOpen(false); }}>Upload & Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Manually register a single student to the platform.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>First Name</Label>
                    <Input placeholder="John" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Roll Number</Label>
                  <Input placeholder="2026CSE123" value={newStudent.roll} onChange={e => setNewStudent({...newStudent, roll: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input placeholder="john@mountzion.ac.in" type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={newStudent.dept} onChange={e => setNewStudent({...newStudent, dept: e.target.value})}>
                      <option>CSE</option>
                      <option>IT</option>
                      <option>ECE</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Year</Label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={newStudent.year} onChange={e => setNewStudent({...newStudent, year: e.target.value})}>
                      <option>Year 1</option>
                      <option>Year 2</option>
                      <option>Year 3</option>
                      <option>Year 4</option>
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddStudent}>Save Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>View and manage all registered students.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students by roll number or name..." className="pl-8" />
            </div>
            <Button variant="secondary" onClick={() => alert("Filter applied!")}>Filter</Button>
          </div>
          
          <div className="border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Roll Number</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Section</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{student.roll}</td>
                    <td className="px-4 py-3 font-medium">{student.name}</td>
                    <td className="px-4 py-3">{student.dept}</td>
                    <td className="px-4 py-3">{student.year}</td>
                    <td className="px-4 py-3">{student.section}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Student ({student.roll})</DialogTitle>
                            <DialogDescription>Modify student details.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2"><Label>Name</Label><Input defaultValue={student.name} /></div>
                            <div className="grid gap-2"><Label>Department</Label><Input defaultValue={student.dept} /></div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => alert("Saved!")}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(student.id)}><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted-foreground">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
