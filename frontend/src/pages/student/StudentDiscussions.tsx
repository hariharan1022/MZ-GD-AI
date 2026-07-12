import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Download } from "lucide-react";

export default function StudentDiscussions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discussion History</h1>
        <p className="text-muted-foreground">
          View your past AI group discussions and download detailed performance reports.
        </p>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Topic: {
                  i === 1 ? "The Future of AI in Software Engineering" :
                  i === 2 ? "Ethics in Data Collection" :
                  "Renewable Energy for Tech Infrastructure"
                }</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> July {12 - i}, 2026
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{90 - (i * 2)}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Group {i * 3}</span>
                  <span>4 Participants</span>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download AI Report PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
