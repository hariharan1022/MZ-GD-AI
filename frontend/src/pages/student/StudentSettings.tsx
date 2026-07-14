import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Camera } from "lucide-react";

export default function StudentSettings() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profile, setProfile] = useState({
    name: "",
    spdNo: "",
    email: "",
    phone: "",
    roll: "",
    department: "",
    year: "",
    section: "",
    photoUrl: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/student/profile');
        const s = response.data;
        setProfile({
          name: s.name || "",
          spdNo: s.spdNo || "",
          email: s.email || "",
          phone: s.phone || "",
          roll: s.roll || "",
          department: s.dept || "",
          year: s.year || "",
          section: s.section || "",
          photoUrl: s.photoUrl || ""
        });
        localStorage.setItem("current_student", JSON.stringify(s));
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
        const currentStudentStr = localStorage.getItem("current_student");
        if (currentStudentStr) {
          const s = JSON.parse(currentStudentStr);
          setProfile({
            name: s.name || "",
            spdNo: s.spdNo || "", 
            email: s.email || `${s.roll?.toLowerCase() || 'student'}@mountzion.ac.in`,
            phone: s.phone || "",
            roll: s.roll || "",
            department: s.dept || "",
            year: s.year || "",
            section: s.section || "Section A",
            photoUrl: s.photoUrl || ""
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        spdNo: profile.spdNo,
        phone: profile.phone,
        photoUrl: profile.photoUrl
      };
      
      const response = await api.post('/student/profile', payload);
      if (response.data.success) {
        const currentStudentStr = localStorage.getItem("current_student");
        if (currentStudentStr) {
          const s = JSON.parse(currentStudentStr);
          const updated = { ...s, ...payload };
          localStorage.setItem("current_student", JSON.stringify(updated));
        }
        alert("Profile updated successfully!");
        // Refresh page or trigger dynamic update in layout by emitting a storage event
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = () => {
    setMessage({ type: "", text: "" });
    if (!current || !newPass || !confirm) {
      setMessage({ type: "error", text: "Please fill all fields." });
      return;
    }
    if (newPass !== confirm) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    const currentStudentStr = localStorage.getItem("current_student");
    if (!currentStudentStr) return;
    const currentStudent = JSON.parse(currentStudentStr);
    const expectedPassword = currentStudent.password || "MZCET";
    if (current !== expectedPassword) {
      setMessage({ type: "error", text: "Current password is incorrect." });
      return;
    }
    const storedStudents = JSON.parse(localStorage.getItem("mz_students") || "[]");
    const updatedStudents = storedStudents.map((s: any) => {
      if (s.roll === currentStudent.roll) return { ...s, password: newPass };
      return s;
    });
    localStorage.setItem("mz_students", JSON.stringify(updatedStudents));
    currentStudent.password = newPass;
    localStorage.setItem("current_student", JSON.stringify(currentStudent));
    setMessage({ type: "success", text: "Password changed successfully!" });
    setCurrent(""); setNewPass(""); setConfirm("");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and security settings.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture & Overview */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-4">
                <label className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative cursor-pointer">
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium">
                    <Camera className="w-6 h-6 mb-1" />
                    Change Photo
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
              <h2 className="text-xl font-bold">{profile.name || "Student Name"}</h2>
              <p className="text-sm text-muted-foreground">{profile.department} • {profile.year}</p>
              <div className="mt-4 w-full flex flex-col gap-2">
                <div className="bg-slate-50 p-2 rounded text-sm flex justify-between border">
                  <span className="text-slate-500">Roll No</span>
                  <span className="font-semibold">{profile.roll}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded text-sm flex justify-between border">
                  <span className="text-slate-500">SPR No</span>
                  <span className="font-semibold">{profile.spdNo}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Details & Password */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact details and basic info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>SPR Number</Label>
                  <Input value={profile.spdNo} onChange={e => setProfile({...profile, spdNo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="+91 xxxxx xxxxx" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleUpdateProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Security Settings
              </CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message.text && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {message.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" value={current} onChange={e => setCurrent(e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="secondary" onClick={handleChangePassword}>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
