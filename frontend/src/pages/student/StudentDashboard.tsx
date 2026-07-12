import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Calendar, Clock, Star, Flame, Trophy, Target, Award } from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("current_student");
    if (data) {
      setStudent(JSON.parse(data));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-indigo-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {student?.name || "Student"}! 👋
          </h1>
          <p className="text-indigo-100 max-w-lg">
            You're currently an <span className="font-semibold text-white">Intermediate</span> speaker. Complete today's speaking challenge to reach the next level!
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
          <Trophy className="w-64 h-64 -mt-10 -mr-10" />
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level 12</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">1,250 / 2,000 XP to next level</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 Days</div>
            <p className="text-xs text-orange-600 font-medium mt-1">You're on fire! Keep it up.</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communication Score</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84 / 100</div>
            <p className="text-xs text-green-500 mt-1">+2 points this week</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="flex items-center gap-2 mt-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center" title="Best Leader">👑</div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center" title="Vocab Master">📚</div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-dashed">+3</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Group Discussions</CardTitle>
            <CardDescription>Your scheduled AI moderated sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg mr-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">Future of AI in Healthcare</h4>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" /> Today at 4:00 PM
                  </p>
                </div>
                <button className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
                  Join Room
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>AI generated insights from your last session.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm">Grammar Accuracy</span>
                <span className="text-sm font-medium text-green-600">Excellent (92%)</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm">Vocabulary Usage</span>
                <span className="text-sm font-medium text-amber-600">Good (78%)</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm">Confidence & Fluency</span>
                <span className="text-sm font-medium text-indigo-600">Improving (85%)</span>
              </div>
              <p className="text-xs text-muted-foreground italic mt-2">
                "Try to reduce the use of filler words like 'umm' and 'like'."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
