import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RotateCcw, FileText, BarChart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper, { itemVariants } from "@/components/PageWrapper";

interface DiscussionDetailsProps {
  onBack: () => void;
  onPracticeAgain: () => void;
}

export default function DiscussionDetails({ onBack, onPracticeAgain }: DiscussionDetailsProps) {
  const transcript = [
    { speaker: "You", text: "I believe AI will completely revolutionize how we design software systems.", score: "Excellent" },
    { speaker: "Priya Patel", text: "That's true, but we must also consider the ethical implications." },
    { speaker: "You", text: "Agreed. Ethical frameworks need to be built into the CI/CD pipeline.", score: "Good Point" },
  ];

  return (
    <PageWrapper 
      title="Discussion Details" 
      description="The Future of Artificial Intelligence in Engineering"
      headerAction={
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
        </Button>
      }
    >
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-slate-900 text-white shadow-lg border-slate-800">
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-indigo-300 uppercase tracking-wider mb-2">Overall Score</div>
              <div className="text-5xl font-bold mb-2">88<span className="text-2xl text-slate-400">/100</span></div>
              <div className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-1 rounded-full text-sm font-bold">
                Grade: A-
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><BarChart className="w-4 h-4 text-indigo-600"/> Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium"><span>Grammar</span><span className="text-slate-600">92%</span></div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-indigo-600 h-1.5 rounded-full w-[92%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium"><span>Vocabulary</span><span className="text-slate-600">85%</span></div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-indigo-600 h-1.5 rounded-full w-[85%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium"><span>Fluency</span><span className="text-slate-600">78%</span></div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-indigo-600 h-1.5 rounded-full w-[78%]"></div></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md bg-indigo-50 border-indigo-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-indigo-900 mb-2">AI Summary</h3>
              <p className="text-sm text-indigo-800 leading-relaxed">
                You demonstrated strong leadership by initiating the core topic. Your vocabulary was highly relevant to the engineering field. However, your speaking rate fluctuated, affecting overall fluency.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transcript & Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-md flex flex-col h-full">
            <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600"/> Discussion Transcript</CardTitle>
                <CardDescription>Full log with AI annotations on your responses.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:flex text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="p-6 space-y-6 bg-slate-50/50 min-h-[400px]">
                {transcript.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.speaker === 'You' ? 'items-end' : 'items-start'}`}>
                    <div className="text-xs font-semibold text-slate-500 mb-1">{msg.speaker}</div>
                    <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${msg.speaker === 'You' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border rounded-tl-sm'}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      {msg.score && (
                        <div className="mt-2 text-xs bg-black/20 backdrop-blur inline-flex items-center gap-1 px-2 py-1 rounded text-indigo-100">
                          <CheckCircle2 className="w-3 h-3" /> AI Note: {msg.score}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardContent className="border-t p-4 bg-white flex flex-col sm:flex-row gap-3">
              <Button className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={onPracticeAgain}>
                <RotateCcw className="w-4 h-4 mr-2" /> Practice This Topic Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
