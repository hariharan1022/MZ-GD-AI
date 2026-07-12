import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/components/PageWrapper";

interface DiscussionHistoryProps {
  onViewDetails: (id: number) => void;
}

export default function DiscussionHistory({ onViewDetails }: DiscussionHistoryProps) {
  const history = [
    { id: 1, topic: "The Future of Artificial Intelligence in Engineering", date: "Oct 24, 2026", score: 88, group: 4, grade: "A-" },
    { id: 2, topic: "Climate Change and Renewable Energy Solutions", date: "Oct 15, 2026", score: 75, group: 2, grade: "B+" },
    { id: 3, topic: "Impact of Social Media on Mental Health", date: "Oct 02, 2026", score: 92, group: 1, grade: "A+" },
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Past Discussions</h2>
          <p className="text-slate-500 mt-1">Review your previous AI evaluations and track your progress.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4">
        {history.map((item) => (
          <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-slate-300 hover:border-l-indigo-500 group">
            <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Group {item.group}</span>
                  <span className="text-sm text-slate-500">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.topic}</h3>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="flex items-center gap-4 border-r pr-6 border-slate-200">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 font-medium">Score</div>
                    <div className="text-xl font-bold text-slate-900">{item.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500 font-medium">Grade</div>
                    <div className={`text-xl font-bold ${
                      item.grade.includes('A') ? 'text-green-600' : 
                      item.grade.includes('B') ? 'text-amber-600' : 'text-red-600'
                    }`}>{item.grade}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(item.id)}>
                    <Eye className="w-4 h-4 mr-2" /> Details
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
