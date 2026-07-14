import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, AlertCircle } from "lucide-react";
import { api } from "../../services/api";

export default function StudentLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [departmentName, setDepartmentName] = useState("your department");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentStudentStr = localStorage.getItem('current_student');
    if (currentStudentStr) {
      const s = JSON.parse(currentStudentStr);
      if (s.deptName) {
        setDepartmentName(s.deptName);
      }
    }

    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/student/leaderboard');
        setLeaders(response.data);
      } catch (err) {
        console.error("Failed to fetch department leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankStyles = (rank: number) => {
    if (rank === 1) return { color: "text-yellow-500", bg: "bg-yellow-50/50 dark:bg-yellow-950/10" };
    if (rank === 2) return { color: "text-slate-400", bg: "bg-slate-50/50 dark:bg-slate-900/10" };
    if (rank === 3) return { color: "text-amber-600", bg: "bg-amber-50/50 dark:bg-amber-950/10" };
    return { color: "text-slate-600 dark:text-slate-400", bg: "" };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
          <Trophy className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Department Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Top communicators in the <span className="font-semibold text-slate-900 dark:text-white">{departmentName}</span> department.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-indigo-600">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="font-medium animate-pulse text-sm">Loading Leaderboard...</p>
        </div>
      ) : leaders.length === 0 ? (
        <Card className="border-dashed p-12 text-center flex flex-col items-center justify-center text-slate-500">
          <AlertCircle className="w-10 h-10 text-slate-400 mb-3" />
          <h3 className="font-semibold text-lg">No students found</h3>
          <p className="text-sm mt-1">There are no discussion scores recorded for this department yet.</p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaders.map((student) => {
                const styles = getRankStyles(student.rank);
                return (
                  <div key={student.rank} className={`flex items-center justify-between p-4 ${styles.bg} transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center font-bold ${styles.color}`}>
                        #{student.rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                        {student.name ? student.name.charAt(0) : "S"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{student.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.roll}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-bold text-lg text-slate-800 dark:text-slate-200">
                        {student.score} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Average Score</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
