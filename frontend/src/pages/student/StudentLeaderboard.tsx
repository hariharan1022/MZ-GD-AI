import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";

export default function StudentLeaderboard() {
  const leaders = [
    { rank: 1, name: "Arjun K", score: 96, roll: "2026CSE042", color: "text-yellow-500", bg: "bg-yellow-50" },
    { rank: 2, name: "Priya M", score: 92, roll: "2026CSE104", color: "text-slate-400", bg: "bg-slate-50" },
    { rank: 3, name: "Rahul S", score: 89, roll: "2026CSE011", color: "text-amber-600", bg: "bg-amber-50" },
    { rank: 4, name: "Sneha R", score: 87, roll: "2026CSE088", color: "text-slate-600", bg: "" },
    { rank: 5, name: "Vikram V", score: 85, roll: "2026CSE150", color: "text-slate-600", bg: "" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <Trophy className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Department Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Top communicators in the Computer Science & Engineering department.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {leaders.map((student) => (
              <div key={student.rank} className={`flex items-center justify-between p-4 ${student.bg} transition-colors hover:bg-slate-50`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center font-bold ${student.color}`}>
                    #{student.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.roll}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-bold text-lg text-slate-800">
                    {student.score} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-500">Average Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
