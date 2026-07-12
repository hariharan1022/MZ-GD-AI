import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";

export default function Login() {
  const [role, setRole] = useState<"student" | "admin">("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // TEMPORARY BYPASS FOR UI TESTING
    if (role === "admin" && identifier === "admin@mountzion.ac.in" && password === "admin123") {
      localStorage.setItem("token", "dummy_admin_token");
      navigate("/admin");
      return;
    }
    
    if (role === "student") {
      const storedStudents = JSON.parse(localStorage.getItem("mz_students") || "[]");
      const foundStudent = storedStudents.find((s: any) => s.roll === identifier);
      
      if (foundStudent) {
        const expectedPassword = foundStudent.password || "MZCET";
        if (password === expectedPassword) {
          localStorage.setItem("token", "dummy_student_token");
          // Store current logged in student info
          localStorage.setItem("current_student", JSON.stringify(foundStudent));
          navigate("/student");
          return;
        } else {
          setError("Incorrect password.");
          return;
        }
      } else if (identifier === "12345" && password === "MZCET") {
        // Fallback dummy student if no local storage exists yet
        localStorage.setItem("token", "dummy_student_token");
        navigate("/student");
        return;
      } else {
        setError("Student not found. Please ask Admin to add you.");
        return;
      }
    }

    try {
      const endpoint = role === "admin" ? "/auth/admin/login" : "/auth/student/login";
      const payload = role === "admin" 
        ? { email: identifier, password } 
        : { roll_number: identifier, password };
        
      const response = await api.post(endpoint, payload);
      localStorage.setItem("token", response.data.access_token);
      
      if (role === "admin") navigate("/admin");
      else navigate("/student");

    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Ensure backend is running and database is connected.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex flex-col items-center justify-center space-y-4 mb-6">
            <img src="/mzcet-logo.jpeg" alt="MZCET Logo" className="w-20 h-20 rounded-full shadow-md object-cover" />
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">MZ AI Discussion</h1>
              <p className="text-muted-foreground mt-1">Autonomous Group Discussion Platform</p>
            </div>
          </div>
          <CardDescription>
            Enter your credentials to access the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex bg-muted p-1 rounded-lg mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "student" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setRole("student"); setIdentifier(""); }}
            >
              Student
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "admin" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setRole("admin"); setIdentifier(""); }}
            >
              Admin
            </button>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">{role === "admin" ? "Email Address" : "Roll Number"}</Label>
              <Input 
                id="identifier" 
                type={role === "admin" ? "email" : "text"} 
                placeholder={role === "admin" ? "admin@mountzion.ac.in" : "Enter Roll Number"} 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
            <Button type="submit" className="w-full h-11 text-base">Sign In</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Mount Zion College of Engineering and Technology
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
