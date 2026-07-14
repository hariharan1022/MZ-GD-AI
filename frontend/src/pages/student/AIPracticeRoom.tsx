import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, StopCircle, RefreshCw, MessageSquare, Sparkles, Send, Loader2, AlertCircle, CheckCircle2, BookOpen } from "lucide-react";
import api from "@/lib/api";

export default function AIPracticeRoom() {
  const [topic, setTopic] = useState("");
  const [isPracticing, setIsPracticing] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Welcome to the AI Practice Room! What topic would you like to discuss today? You can type a topic below or let me pick a random Ice Breaker." }
  ]);
  const [grammarNotes, setGrammarNotes] = useState<{ issues: string[]; corrected: string } | null>(null);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGrammar, setShowGrammar] = useState(true);

  const TOPICS = [
    "What is your favorite book and why?",
    "Describe a memorable vacation or trip you've taken.",
    "What is the most important skill for the future?",
    "If you could meet any historical figure, who would it be?",
    "What is your biggest career aspiration?",
    "How has technology changed the way we communicate?",
    "What is the best piece of advice you've ever received?",
    "Describe a challenge you overcame and what you learned.",
    "What is your favorite way to learn new things?",
    "If you could solve one global problem, what would it be?",
    "What does leadership mean to you?",
    "What is the most interesting place you have visited?",
    "How do you stay motivated when facing difficulties?",
    "What is a habit that has positively impacted your life?",
    "Describe a person who has inspired you the most.",
  ];

  const pickRandomTopic = () => setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  const startPractice = async () => {
    const finalTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
    if (!topic) setTopic(finalTopic);
    setIsPracticing(true);
    setIsLoading(true);
    setMessages([{ role: "ai", text: "Starting practice session..." }]);
    setGrammarNotes(null);

    try {
      const res = await api.post("/student/practice/start", { topic: finalTopic });
      setMessages([{ role: "ai", text: res.data.response }]);
    } catch {
      setMessages([{ role: "ai", text: `Great! Let's practice discussing: "${finalTopic}". Share your initial thoughts!` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = inputText.trim();
    setInputText("");
    setGrammarNotes(null);
    const newMessages = [...messages, { role: "student" as const, text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await api.post("/student/practice/chat", {
        topic,
        message: userMsg,
        history: newMessages.map(m => ({ role: m.role, text: m.text }))
      });
      setMessages(prev => [...prev, { role: "ai", text: res.data.response }]);
      setGrammarNotes({ issues: res.data.grammar_issues || [], corrected: res.data.corrected_version || "" });
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Interesting point! Could you tell me more about your perspective on this?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }
      if (transcript.trim()) {
        setInputText(prev => (prev ? prev + " " : "") + transcript.trim());
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-500" /> AI Practice Room
          </h1>
          <p className="text-muted-foreground mt-1">
            Practice speaking with AI coaching — get grammar corrections and feedback in real time.
          </p>
        </div>
        {isPracticing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowGrammar(!showGrammar)} className="text-xs">
              <BookOpen className="w-4 h-4 mr-1" /> {showGrammar ? "Hide" : "Show"} Grammar
            </Button>
            <Button variant="outline" onClick={() => setIsPracticing(false)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              End Session
            </Button>
          </div>
        )}
      </div>

      {!isPracticing ? (
        <Card className="max-w-2xl mx-auto w-full mt-12 border-t-4 border-t-indigo-500 shadow-lg">
          <CardHeader>
            <CardTitle>Setup Your Practice</CardTitle>
            <CardDescription>Enter a specific topic to practice, or click Random Topic for a suggestion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="e.g. Climate Change, Machine Learning, Campus Life..." 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="text-lg py-6"
            />
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="flex-1" onClick={startPractice}>
                <MessageSquare className="w-5 h-5 mr-2" /> Start Practice
              </Button>
              <Button size="lg" variant="secondary" onClick={pickRandomTopic}>
                <RefreshCw className="w-5 h-5 mr-2" /> Random Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-primary/20">
            <CardHeader className="bg-indigo-50/50 border-b py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium text-indigo-900 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  Active Topic: {topic || "No topic set"}
                </CardTitle>
                <div className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                  AI Coach Active
                </div>
              </div>
            </CardHeader>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4 max-w-4xl mx-auto w-full">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'ai' 
                        ? 'bg-white border text-slate-800 rounded-tl-sm' 
                        : 'bg-indigo-600 text-white rounded-tr-sm'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="text-xs font-bold text-indigo-500 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3"/> AI Coach
                        </div>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border text-slate-800 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t">
              <div className="max-w-4xl mx-auto flex gap-2">
                <Button 
                  variant={isRecording ? "destructive" : "secondary"} 
                  size="icon" 
                  className={`h-12 w-12 rounded-full shadow-sm transition-all ${isRecording ? 'animate-pulse ring-4 ring-red-100' : ''}`}
                  onClick={toggleRecording}
                >
                  {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                <Input 
                  className="flex-1 h-12 rounded-full border-slate-300 shadow-sm px-6" 
                  placeholder="Type or speak your response..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isRecording}
                />
                <Button className="h-12 w-12 rounded-full shadow-sm bg-indigo-600 hover:bg-indigo-700" size="icon" onClick={handleSendText} disabled={!inputText.trim() || isRecording || isLoading}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              {isRecording && <p className="text-center text-xs font-medium text-red-500 mt-2 animate-pulse">Listening... Speak now.</p>}
            </div>
          </Card>

          {/* Grammar Panel */}
          {showGrammar && (
            <Card className="w-80 shrink-0 overflow-y-auto shadow-lg border-t-4 border-t-emerald-500 hidden lg:flex lg:flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" /> Grammar Coach
                </CardTitle>
                <CardDescription className="text-xs">Real-time grammar corrections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!grammarNotes && !isLoading && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p>Send a message to get grammar feedback</p>
                  </div>
                )}
                {isLoading && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Analyzing...</p>
                  </div>
                )}
                {grammarNotes && (
                  <>
                    {grammarNotes.issues.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Grammar Issues
                        </h4>
                        <ul className="space-y-1.5">
                          {grammarNotes.issues.map((issue, i) => (
                            <li key={i} className="text-xs text-slate-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {grammarNotes.corrected ? (
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Corrected Version
                        </h4>
                        <div className="text-xs text-slate-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 leading-relaxed">
                          "{grammarNotes.corrected}"
                        </div>
                      </div>
                    ) : grammarNotes.issues.length === 0 && (
                      <div className="text-center py-4 text-emerald-600 text-sm">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-1" />
                        <p className="font-medium">No grammar issues!</p>
                        <p className="text-xs text-slate-400 mt-1">Your sentence looks correct.</p>
                      </div>
                    )}
                  </>
                )}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tips</h4>
                  <ul className="text-xs text-slate-500 space-y-1.5">
                    <li>• Speak in full sentences</li>
                    <li>• Use past tense correctly</li>
                    <li>• Match subject with verb</li>
                    <li>• Use correct articles (a/an/the)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
