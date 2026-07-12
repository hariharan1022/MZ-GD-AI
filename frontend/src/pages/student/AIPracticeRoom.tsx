import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, StopCircle, RefreshCw, MessageSquare, Sparkles, Send } from "lucide-react";

export default function AIPracticeRoom() {
  const [topic, setTopic] = useState("");
  const [isPracticing, setIsPracticing] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Welcome to the AI Practice Room! What topic would you like to discuss today? You can type a topic below or let me pick a random Ice Breaker." }
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const startPractice = () => {
    if (!topic) {
      setTopic("The Impact of Artificial Intelligence on Society");
    }
    setIsPracticing(true);
    setMessages([
      { role: "ai", text: `Great! Let's practice discussing: "${topic || 'The Impact of Artificial Intelligence on Society'}". I will act as a friendly moderator. You have 2 minutes to present your initial thoughts.` }
    ]);
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { role: "student", text: inputText }]);
    setInputText("");
    
    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "That's an excellent point! Can you elaborate on how that specific aspect might affect future job markets?" 
      }]);
    }, 1000);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setMessages(prev => [...prev, { role: "student", text: "(Audio submission transcribed) I believe AI will automate repetitive tasks, allowing humans to focus on creative work." }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: "Very fluent! Your grammar was mostly correct, though try using stronger transition words. Do you think this transition will happen quickly or slowly?" 
        }]);
      }, 1500);
    } else {
      setIsRecording(true);
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
            A safe, 1-on-1 space to practice your communication skills with an AI Moderator.
          </p>
        </div>
        {isPracticing && (
          <Button variant="outline" onClick={() => setIsPracticing(false)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            End Practice Session
          </Button>
        )}
      </div>

      {!isPracticing ? (
        <Card className="max-w-2xl mx-auto w-full mt-12 border-t-4 border-t-indigo-500 shadow-lg">
          <CardHeader>
            <CardTitle>Setup Your Practice</CardTitle>
            <CardDescription>Enter a specific topic to practice, or leave blank for a random Ice Breaker.</CardDescription>
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
              <Button size="lg" variant="secondary" onClick={() => setTopic("Random Ice Breaker: What is your favorite book?")}>
                <RefreshCw className="w-5 h-5 mr-2" /> Random Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-primary/20">
          <CardHeader className="bg-indigo-50/50 border-b py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-indigo-900 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                Active Topic: {topic || "Random Ice Breaker"}
              </CardTitle>
              <div className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                AI Moderator Active
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
                    {msg.role === 'ai' && <div className="text-xs font-bold text-indigo-500 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Moderator</div>}
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
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
                placeholder="Type your response or click the microphone to speak..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendText()}
                disabled={isRecording}
              />
              <Button className="h-12 w-12 rounded-full shadow-sm bg-indigo-600 hover:bg-indigo-700" size="icon" onClick={handleSendText} disabled={!inputText.trim() || isRecording}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {isRecording && <p className="text-center text-xs font-medium text-red-500 mt-2 animate-pulse">Listening... Speak now.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
