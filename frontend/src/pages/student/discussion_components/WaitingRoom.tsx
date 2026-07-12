import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Wifi, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/components/PageWrapper";

interface WaitingRoomProps {
  onContinue: () => void;
  student: any;
}

export default function WaitingRoom({ onContinue, student }: WaitingRoomProps) {
  const [micStatus, setMicStatus] = useState<"checking" | "ok" | "error">("checking");
  const [speakerStatus, setSpeakerStatus] = useState<"checking" | "ok" | "error">("checking");
  const [wifiStatus, setWifiStatus] = useState<"checking" | "ok" | "error">("checking");
  const [joinedCount, setJoinedCount] = useState(1);
  const totalRequired = 60;

  useEffect(() => {
    // Simulate hardware checks
    setTimeout(() => setMicStatus("ok"), 1000);
    setTimeout(() => setSpeakerStatus("ok"), 1500);
    setTimeout(() => setWifiStatus("ok"), 2000);

    // Simulate other students joining
    const interval = setInterval(() => {
      setJoinedCount(prev => {
        if (prev >= totalRequired) {
          clearInterval(interval);
          setTimeout(onContinue, 1500); // Auto continue when full
          return totalRequired;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [onContinue]);

  const HardwareStatus = ({ label, icon: Icon, status }: any) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${status === 'ok' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <div>
        {status === "checking" && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
        {status === "ok" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={itemVariants} className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Waiting Room</h2>
        <p className="text-slate-500">Please wait while other students join the session.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md border-t-4 border-t-indigo-500">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-200">
                {student?.name?.charAt(0) || "S"}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{student?.name || "Student Name"}</h3>
                <p className="text-sm text-slate-500">Roll: {student?.rollNumber || "123456"}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600">{student?.department || "CSE"}</span>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600">Year {student?.year || "III"}</span>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600">Sec {student?.section || "A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">System Checks</h4>
              <HardwareStatus label="Microphone" icon={Mic} status={micStatus} />
              <HardwareStatus label="Speakers" icon={Volume2} status={speakerStatus} />
              <HardwareStatus label="Connection" icon={Wifi} status={wifiStatus} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-slate-900">{Math.min(joinedCount, totalRequired)} / {totalRequired}</h3>
                <p className="text-slate-500 font-medium">Students Joined</p>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(Math.min(joinedCount, totalRequired) / totalRequired) * 100}%` }}
                ></div>
              </div>

              {joinedCount >= totalRequired ? (
                <p className="text-sm text-green-600 font-medium animate-pulse pt-2">All students joined. Starting session...</p>
              ) : (
                <p className="text-sm text-slate-500 pt-2">Waiting for others...</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Discussion Rules
              </h4>
              <ul className="text-sm text-amber-800 space-y-2 list-disc pl-5">
                <li>Keep your camera on at all times (if applicable).</li>
                <li>Wait for the preparation timer to finish before speaking.</li>
                <li>Ensure you are in a quiet environment.</li>
                <li>The AI will automatically group you with your peers.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      
      {/* Dev bypass button */}
      <div className="text-center pt-8">
        <Button variant="ghost" className="text-xs text-slate-400" onClick={onContinue}>Skip Wait (Dev)</Button>
      </div>
    </div>
  );
}
