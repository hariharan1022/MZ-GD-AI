import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground">
          Analyze student performance trends and AI engagement metrics across the college.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg College Score</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5 / 100</div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +2.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Department</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CSE (84 avg)</div>
            <p className="text-xs text-muted-foreground">Highest communication score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">Of registered students spoke</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-96 flex flex-col items-center justify-center border-dashed">
          <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Department Comparison Chart</h3>
          <p className="text-sm text-slate-400">Waiting for backend data integration...</p>
        </Card>
        <Card className="h-96 flex flex-col items-center justify-center border-dashed">
          <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Monthly Progress Trends</h3>
          <p className="text-sm text-slate-400">Waiting for backend data integration...</p>
        </Card>
      </div>
    </div>
  );
}
