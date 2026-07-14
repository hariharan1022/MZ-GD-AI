import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Clock, Activity } from "lucide-react";
import { api } from "@/services/api";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    students: 0,
    departments: 0,
    activeSessions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/admin/analytics/overview");
        setStats({
          students: res.data.students || 0,
          departments: res.data.departments || 0,
          activeSessions: res.data.activeSessions || 0
        });
        setRecentActivity(res.data.recentActivity || []);
      } catch (err) {
        console.error("Failed to fetch admin overview statistics:", err);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the AI Group Discussion Admin Portal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Engineering Branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discussions</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Sessions currently live</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204h</div>
            <p className="text-xs text-muted-foreground">AI processed discussion time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => {
                const dateStr = activity.timestamp 
                  ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : "Just now";
                const dotColors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"];
                const color = dotColors[idx % dotColors.length];
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.details} • {dateStr}</p>
                    </div>
                  </div>
                );
              })}
              {recentActivity.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-600">No recent administrative activities.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI System Status</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Topic Generator (Ollama)</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transcriber (Whisper)</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Speaker Diarization (pyannote)</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database (Supabase)</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
