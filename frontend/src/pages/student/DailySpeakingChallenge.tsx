import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Play, CheckCircle2, Trophy } from "lucide-react";

export default function DailySpeakingChallenge() {
  const [isRecording, setIsRecording] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const startChallenge = () => {
    setIsRecording(true);
    setIsCompleted(false);
    setProgress(0);
    
    // Simulate recording progress for 2 minutes (we'll speed it up to 5 seconds for demo)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecording(false);
          setIsCompleted(true);
          return 100;
        }
        return prev + 2; // 5 seconds for 100%
      });
    }, 100);
  };

  const stopChallenge = () => {
    setIsRecording(false);
    setIsCompleted(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4 shadow-sm">
          <Trophy className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Speaking Challenge</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Complete your daily 2-minute speaking exercise to maintain your streak, earn XP, and improve your fluency!
        </p>
      </div>

      {!isCompleted ? (
        <Card className="border-t-4 border-t-indigo-500 shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Today's Topic</CardTitle>
            <CardDescription className="text-lg font-medium text-slate-800 mt-2">
              "If you could have dinner with any historical figure, who would it be and why?"
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all ${isRecording ? 'bg-red-100 animate-pulse scale-110' : 'bg-slate-100'}`}>
              {isRecording ? (
                <Mic className="w-12 h-12 text-red-500" />
              ) : (
                <Mic className="w-12 h-12 text-slate-400" />
              )}
            </div>

            {isRecording && (
              <div className="w-full max-w-md mb-8">
                <div className="flex justify-between text-sm mb-2 text-slate-500 font-medium">
                  <span>Recording...</span>
                  <span>{Math.floor(progress / 100 * 120)}s / 120s</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-indigo-600 h-3 rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {!isRecording ? (
              <Button size="lg" className="w-full max-w-sm rounded-full h-12 text-lg shadow-lg hover:-translate-y-1 transition-all" onClick={startChallenge}>
                <Play className="w-5 h-5 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button size="lg" variant="destructive" className="w-full max-w-sm rounded-full h-12 text-lg shadow-lg" onClick={stopChallenge}>
                <StopCircle className="w-5 h-5 mr-2" /> Finish Early
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-t-4 border-t-green-500 shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <CheckCircle2 className="w-48 h-48 text-green-500" />
          </div>
          <CardHeader className="text-center relative z-10">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Challenge Completed!</CardTitle>
            <CardDescription>Amazing job! The AI is analyzing your audio.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="bg-slate-50 rounded-xl p-6 mt-4 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 text-center">Instant AI Feedback</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-3 rounded-lg border text-center shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600">+50</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">XP Earned</div>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center shadow-sm">
                  <div className="text-2xl font-bold text-orange-500">8 Days</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">New Streak</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fluency</span>
                  <span className="text-sm font-bold text-green-600">Great (85%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-medium">Grammar</span>
                  <span className="text-sm font-bold text-amber-600">Good (72%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => setIsCompleted(false)}>Practice Another Topic</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
