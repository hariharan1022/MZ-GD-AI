import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Mic, Clock, Activity, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminSessions() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, title: "CSE Year 3 - Section A", date: "Scheduled for Today at 4:00 PM", status: "Scheduled", color: "border-l-primary", badge: "bg-amber-100 text-amber-800", count: 60, groups: 15 },
    { id: 2, title: "IT Year 2 - Section B", date: "Yesterday at 2:00 PM", status: "Completed", color: "border-l-green-500", badge: "bg-green-100 text-green-800", count: 45, groups: 9 }
  ]);
  
  const [newSession, setNewSession] = useState({ dept: "CSE", section: "Year 3 - Section A", date: "" });

  const handleSchedule = () => {
    if (!newSession.date) {
      alert("Please select a date and time");
      return;
    }
    const s = {
      id: sessions.length + 1,
      title: `${newSession.dept} ${newSession.section}`,
      date: `Scheduled for ${new Date(newSession.date).toLocaleString()}`,
      status: "Scheduled",
      color: "border-l-primary",
      badge: "bg-amber-100 text-amber-800",
      count: Math.floor(Math.random() * 20) + 40,
      groups: 10
    };
    setSessions([s, ...sessions]);
    setIsScheduleOpen(false);
  };

  const handleAction = (action: string) => {
    alert(`${action}`);
  };

  const cancelSession = (id: number) => {
    if(window.confirm("Cancel this session?")) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussion Sessions</h1>
          <p className="text-muted-foreground">
            Schedule and monitor AI Group Discussion sessions.
          </p>
        </div>
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule New Session</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Discussion Session</DialogTitle>
              <DialogDescription>Set up a new AI-moderated discussion for a specific section.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Target Department</Label>
                <select className="flex h-10 w-full rounded-md border border-input px-3 text-sm" value={newSession.dept} onChange={e => setNewSession({...newSession, dept: e.target.value})}>
                  <option>CSE</option><option>IT</option><option>ECE</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Target Year & Section</Label>
                <select className="flex h-10 w-full rounded-md border border-input px-3 text-sm" value={newSession.section} onChange={e => setNewSession({...newSession, section: e.target.value})}>
                  <option>Year 3 - Section A</option><option>Year 3 - Section B</option><option>Year 2 - Section A</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Discussion Topic (Leave empty for AI generation)</Label>
                <Input placeholder="e.g. Future of Renewable Energy" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
              <Button onClick={handleSchedule}>Schedule Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sessions.map((session) => (
          <Card key={session.id} className={`border-l-4 ${session.color}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{session.title}</CardTitle>
                  <CardDescription>{session.date}</CardDescription>
                </div>
                <span className={`${session.badge} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                  {session.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" /> {session.count} Students Participated ({session.groups} Groups)
                </div>
                {session.status === "Scheduled" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mic className="w-4 h-4" /> 2 Min Prep, 10 Min Discussion
                  </div>
                )}
              </div>
              
              {session.status === "Scheduled" ? (
                <div className="mt-4 flex gap-2">
                  <Button className="w-full" onClick={() => handleAction("Session started early! Students will be notified.")}><Activity className="w-4 h-4 mr-2"/> Start Session Early</Button>
                  <Button variant="outline" className="w-full text-destructive border-destructive" onClick={() => cancelSession(session.id)}>Cancel</Button>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => handleAction("Opening detailed AI analytics report...")}><BarChart3 className="w-4 h-4 mr-2"/> View Reports</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
