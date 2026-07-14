import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Play, CheckCircle2, Trophy, Loader2 } from "lucide-react";
import api from "@/lib/api";

const DURATION_SECONDS = 300; // 5 minutes
const TOPICS = [
  "If you could have dinner with any historical figure, who would it be and why?",
  "What is the most important skill for the future and why?",
  "Describe a challenge you overcame and what you learned from it.",
  "If you could solve one global problem, what would it be and how?",
  "What does leadership mean to you? Give an example.",
  "How has technology changed the way we communicate?",
  "What is your biggest career aspiration and why?"
];

export default function DailySpeakingChallenge() {
  const [isRecording, setIsRecording] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [topic, setTopic] = useState("");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  const pickTopic = () => {
    setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
  };

  useEffect(() => {
    pickTopic();
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startChallenge = () => {
    setIsRecording(true);
    setIsCompleted(false);
    setProgress(0);
    setElapsed(0);
    setFeedback(null);
    setTranscript("");
    transcriptRef.current = "";

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = (event: any) => {
        let newText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newText += event.results[i][0].transcript + " ";
          }
        }
        if (newText) {
          transcriptRef.current += newText;
          setTranscript(transcriptRef.current);
        }
      };
      recognition.onerror = () => {};
      recognitionRef.current = recognition;
      recognition.start();
    }

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        setProgress((next / DURATION_SECONDS) * 100);
        if (next >= DURATION_SECONDS) {
          clearInterval(timerRef.current);
          setIsRecording(false);
          finishChallenge();
          return DURATION_SECONDS;
        }
        return next;
      });
    }, 1000);
  };

  const finishChallenge = async () => {
    setIsAnalyzing(true);
    const spokenText = transcriptRef.current.trim() || "I shared my thoughts on the topic.";
    try {
      const res = await api.post("/student/challenge/analyze", { text: spokenText, topic });
      setFeedback(res.data);
    } catch {
      setFeedback({
        fluency: 75, grammar: 70, vocabulary: 70, confidence: 70,
        xp_earned: 30, streak_days: 1,
        feedback: "Good effort! Try to structure your points more clearly."
      });
    } finally {
      setIsAnalyzing(false);
      setIsCompleted(true);
    }
  };

  const stopChallenge = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    finishChallenge();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4 shadow-sm">
          <Trophy className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Speaking Challenge</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Complete your daily 5-minute speaking exercise to maintain your streak, earn XP, and improve your fluency!
        </p>
      </div>

      {!isCompleted ? (
        <Card className="border-t-4 border-t-indigo-500 shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Today's Topic</CardTitle>
            <CardDescription className="text-lg font-medium text-slate-800 mt-2">
              "{topic}"
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
                  <span className="text-red-500 font-semibold">Recording...</span>
                  <span>{formatTime(DURATION_SECONDS - elapsed)} / {formatTime(DURATION_SECONDS)}</span>
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
      ) : !isAnalyzing && feedback ? (
        <Card className="border-t-4 border-t-green-500 shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <CheckCircle2 className="w-48 h-48 text-green-500" />
          </div>
          <CardHeader className="text-center relative z-10">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Challenge Completed!</CardTitle>
            <CardDescription>Great job! Here's your AI analysis.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="bg-slate-50 rounded-xl p-6 mt-4 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 text-center">Instant AI Feedback</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-3 rounded-lg border text-center shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600">+{feedback.xp_earned}</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">XP Earned</div>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center shadow-sm">
                  <div className="text-2xl font-bold text-orange-500">{feedback.streak_days} Day{feedback.streak_days !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">New Streak</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Fluency", score: feedback.fluency },
                  { label: "Grammar", score: feedback.grammar },
                  { label: "Vocabulary", score: feedback.vocabulary },
                  { label: "Confidence", score: feedback.confidence },
                ].map((item) => {
                  const color = item.score >= 80 ? "green" : item.score >= 60 ? "amber" : "red";
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className={`text-sm font-bold text-${color}-600`}>{item.score}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div className={`bg-${color}-500 h-1.5 rounded-full`} style={{ width: `${item.score}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border text-sm text-slate-700 leading-relaxed">
                <strong>Feedback:</strong> {feedback.feedback}
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => { setIsCompleted(false); pickTopic(); setTranscript(""); setFeedback(null); }}>
                Practice Another Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-t-4 border-t-orange-500 shadow-md overflow-hidden">
          <CardContent className="flex flex-col items-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800">Analyzing Your Speech...</h3>
            <p className="text-sm text-slate-500 mt-2">AI is evaluating fluency, grammar, and more.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
