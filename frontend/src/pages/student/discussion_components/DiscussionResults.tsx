import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Target, Star, Brain, TrendingUp, Download, RotateCcw, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper, { itemVariants } from "@/components/PageWrapper";
import { Progress } from "@/components/ui/progress";

interface DiscussionResultsProps {
  onBackToHistory: () => void;
  onPracticeAgain: () => void;
}

export default function DiscussionResults({ onBackToHistory, onPracticeAgain }: DiscussionResultsProps) {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate AI generating results
    const timer = setTimeout(() => setIsProcessing(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 h-[calc(100vh-12rem)]">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="bg-white p-6 rounded-full shadow-2xl relative">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">AI is analyzing the discussion...</h2>
          <p className="text-slate-500">Evaluating grammar, fluency, leadership, and critical thinking. This usually takes a few moments.</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full w-full animate-[progress_2s_ease-in-out_infinite] origin-left"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper 
      title="Discussion Results" 
      description="The Future of Artificial Intelligence in Engineering"
      headerAction={
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex" onClick={onPracticeAgain}>
            <RotateCcw className="w-4 h-4 mr-2" /> Practice Solo
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={onBackToHistory}>
            Back to Dashboard
          </Button>
        </div>
      }
    >
      {/* Top Banner */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-indigo-200 font-medium tracking-wider text-sm uppercase mb-1">Overall Performance</p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-2">88<span className="text-2xl text-indigo-300">/100</span></h2>
              <div className="flex items-center gap-3">
                <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-bold">Grade: A-</span>
                <span className="text-indigo-200 text-sm">Advanced Level</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
                <div className="text-xs text-indigo-200 mb-1">Group Rank</div>
                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                  1<span className="text-sm text-indigo-300 font-normal">/4</span> <Trophy className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
                <div className="text-xs text-indigo-200 mb-1">XP Earned</div>
                <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                  +150 <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600"/> Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>Grammar</span>
                <span className="text-green-600">92%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full w-[92%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>Fluency</span>
                <span className="text-amber-600">78%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full w-[78%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>Vocabulary</span>
                <span className="text-blue-600">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full w-[85%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>Leadership</span>
                <span className="text-purple-600">95%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full w-[95%]"></div></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback Section */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600"/> Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="bg-white p-1 rounded-full shadow-sm mt-0.5"><Star className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-green-900">Excellent Leadership</p>
                  <p className="text-xs text-green-700 mt-1">You initiated the discussion and invited quieter members to speak.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="bg-white p-1 rounded-full shadow-sm mt-0.5"><Brain className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-green-900">Critical Thinking</p>
                  <p className="text-xs text-green-700 mt-1">Provided strong, logical arguments backing up AI's role in system design.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-600"/> Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="bg-white p-1 rounded-full shadow-sm mt-0.5"><div className="w-4 h-4 text-amber-600 font-bold text-center leading-tight">!</div></div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Reduce Filler Words</p>
                  <p className="text-xs text-amber-800 mt-1">You used "like" and "um" 12 times. Try pausing silently instead of using fillers.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="bg-white p-1 rounded-full shadow-sm mt-0.5"><div className="w-4 h-4 text-amber-600 font-bold text-center leading-tight">!</div></div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Speaking Speed</p>
                  <p className="text-xs text-amber-800 mt-1">Your speaking rate was slightly fast (160 wpm). Slow down for better clarity.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Group Results */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600"/> Group Results & Badges</CardTitle>
            <CardDescription>How your group performed collectively.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border rounded-xl p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl mb-2 shadow-sm border border-amber-200">👑</div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Best Leader</div>
                <div className="text-sm font-bold text-slate-900 mt-1">You</div>
              </div>
              <div className="bg-slate-50 border rounded-xl p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2 shadow-sm border border-blue-200">👂</div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Best Listener</div>
                <div className="text-sm font-bold text-slate-900 mt-1">Priya Patel</div>
              </div>
              <div className="bg-slate-50 border rounded-xl p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl mb-2 shadow-sm border border-purple-200">📚</div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Vocab Master</div>
                <div className="text-sm font-bold text-slate-900 mt-1">Rahul Sharma</div>
              </div>
              <div className="bg-slate-50 border rounded-xl p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-2 shadow-sm border border-green-200">🌟</div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Team Score</div>
                <div className="text-sm font-bold text-green-600 mt-1">82/100</div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline" className="w-full sm:w-auto"><Download className="w-4 h-4 mr-2" /> Download Full PDF Report</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}
