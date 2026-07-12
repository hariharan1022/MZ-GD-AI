import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Mic, MicOff, Timer, Activity, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { itemVariants } from "@/components/PageWrapper";

interface LiveRoomProps {
  onComplete: () => void;
  student: any;
}

export default function LiveRoom({ onComplete, student }: LiveRoomProps) {
  const [internalStage, setInternalStage] = useState<"formation" | "topic" | "prep" | "live">("formation");
  const [prepTime, setPrepTime] = useState(120); // 2 minutes
  const [liveTime, setLiveTime] = useState(900); // 15 minutes
  const [activeSpeaker, setActiveSpeaker] = useState<number | null>(null);

  const topic = "The Future of Artificial Intelligence in Engineering";
  
  const groupMembers = [
    { id: 1, name: student?.name || "You", role: "Me", isSpeaking: activeSpeaker === 1 },
    { id: 2, name: "Rahul Sharma", role: "Peer", isSpeaking: activeSpeaker === 2 },
    { id: 3, name: "Priya Patel", role: "Peer", isSpeaking: activeSpeaker === 3 },
    { id: 4, name: "Arun Kumar", role: "Peer", isSpeaking: activeSpeaker === 4 },
  ];

  const transcript = [
    { speaker: "Rahul Sharma", text: "I believe AI will completely revolutionize how we design software systems." },
    { speaker: "Priya Patel", text: "That's true, but we must also consider the ethical implications." },
  ];

  // Stage Progression Simulation
  useEffect(() => {
    if (internalStage === "formation") {
      setTimeout(() => setInternalStage("topic"), 3000);
    } else if (internalStage === "topic") {
      setTimeout(() => setInternalStage("prep"), 4000);
    }
  }, [internalStage]);

  // Prep Timer
  useEffect(() => {
    if (internalStage === "prep" && prepTime > 0) {
      const timer = setInterval(() => setPrepTime(p => p - 1), 1000);
      return () => clearInterval(timer);
    } else if (internalStage === "prep" && prepTime === 0) {
      setInternalStage("live");
    }
  }, [internalStage, prepTime]);

  // Live Timer & Speaker Simulation
  useEffect(() => {
    if (internalStage === "live" && liveTime > 0) {
      const timer = setInterval(() => setLiveTime(p => p - 1), 1000);
      
      const speakerTimer = setInterval(() => {
        setActiveSpeaker(Math.floor(Math.random() * 4) + 1);
      }, 4000);

      return () => {
        clearInterval(timer);
        clearInterval(speakerTimer);
      };
    } else if (internalStage === "live" && liveTime === 0) {
      onComplete();
    }
  }, [internalStage, liveTime, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <AnimatePresence mode="wait">
        
        {/* GROUP FORMATION */}
        {internalStage === "formation" && (
          <motion.div 
            key="formation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <Users className="w-12 h-12 text-indigo-600 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">AI Group Formation</h2>
              <p className="text-slate-500">Matching you with peers from your Department & Section...</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border mt-8 max-w-sm w-full">
              <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                <span>Department: {student?.department || "CSE"}</span>
                <span>Section: {student?.section || "A"}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full w-[75%] animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TOPIC GENERATION */}
        {internalStage === "topic" && (
          <motion.div 
            key="topic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center shadow-inner">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <div className="text-center space-y-4 max-w-3xl">
              <h3 className="text-purple-600 font-semibold tracking-wider uppercase text-sm">Ollama AI has generated your topic</h3>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                "{topic}"
              </h2>
            </div>
          </motion.div>
        )}

        {/* PREPARATION & LIVE */}
        {(internalStage === "prep" || internalStage === "live") && (
          <motion.div 
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col space-y-4"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${internalStage === 'prep' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'}`}>
                    {internalStage === 'prep' ? 'Preparation Phase' : 'Live Discussion'}
                  </span>
                  {internalStage === 'live' && (
                    <span className="flex items-center text-xs text-slate-400">
                      <Activity className="w-3 h-3 mr-1 text-indigo-400 animate-pulse" /> AI Analyzing
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">"{topic}"</h2>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-4 border border-slate-700 min-w-[200px] justify-center">
                <Timer className={`w-6 h-6 ${internalStage === 'prep' ? 'text-amber-400' : 'text-red-400'}`} />
                <div className={`text-3xl font-mono font-bold tracking-wider ${internalStage === 'prep' ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatTime(internalStage === "prep" ? prepTime : liveTime)}
                </div>
              </div>
            </div>

            <div className="flex-1 grid md:grid-cols-3 gap-4 min-h-[400px]">
              {/* Video Grid (Left 2/3) */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {groupMembers.map((member) => (
                  <Card key={member.id} className={`bg-slate-100 border-2 overflow-hidden relative flex flex-col items-center justify-center ${member.isSpeaking ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-transparent'}`}>
                    {/* Fake Video Feed */}
                    <div className="w-24 h-24 rounded-full bg-slate-300 flex items-center justify-center text-3xl font-bold text-slate-500 shadow-inner mb-4">
                      {member.name.charAt(0)}
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm">
                      <span className="font-semibold text-sm truncate">{member.name} {member.role === 'Me' && '(You)'}</span>
                      <div className={`p-1.5 rounded-full ${internalStage === 'prep' ? 'bg-red-100 text-red-600' : member.isSpeaking ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
                        {internalStage === 'prep' || !member.isSpeaking ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* AI Analysis Overlay (Subtle) */}
                    {internalStage === 'live' && member.isSpeaking && (
                      <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 shadow-sm">
                        <Activity className="w-3 h-3" /> Analyzing...
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Sidebar (Right 1/3) */}
              <Card className="flex flex-col shadow-md">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-600" /> Live Transcript</h3>
                  {internalStage === 'live' && <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>}
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                  {internalStage === "prep" ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                      <MicOff className="w-8 h-8 text-slate-400" />
                      <p className="text-sm font-medium">Microphones are muted during preparation time.</p>
                      <p className="text-xs">Take notes and plan your opening statement.</p>
                    </div>
                  ) : (
                    <>
                      {transcript.map((msg, i) => (
                        <div key={i} className="space-y-1">
                          <div className="text-xs font-semibold text-slate-500">{msg.speaker}</div>
                          <div className="bg-white p-3 rounded-xl border shadow-sm text-sm text-slate-800 leading-relaxed">
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      <div className="text-xs text-indigo-600 italic animate-pulse pt-2 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Listening and transcribing...
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4 border-t bg-white">
                  <Button 
                    variant={internalStage === 'prep' ? "outline" : "destructive"} 
                    className="w-full"
                    onClick={() => {
                      if (internalStage === 'prep') setInternalStage('live');
                      else onComplete();
                    }}
                  >
                    {internalStage === 'prep' ? 'Skip Prep Time' : 'End Discussion For All'}
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
