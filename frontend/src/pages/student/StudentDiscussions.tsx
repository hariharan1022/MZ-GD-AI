import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageWrapper, { itemVariants } from "@/components/PageWrapper";
import UpcomingDiscussions from "./discussion_components/UpcomingDiscussions";
import WaitingRoom from "./discussion_components/WaitingRoom";
import LiveRoom from "./discussion_components/LiveRoom";
import DiscussionResults from "./discussion_components/DiscussionResults";
import DiscussionHistory from "./discussion_components/DiscussionHistory";
import DiscussionDetails from "./discussion_components/DiscussionDetails";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

type DiscussionStage = "dashboard" | "waiting" | "live" | "results" | "details";

export default function StudentDiscussions() {
  const [stage, setStage] = useState<DiscussionStage>("dashboard");
  const [student, setStudent] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [historySessions, setHistorySessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = { department: 'Computer Science', section: 'A' }; // hardcode for now
        setStudent(studentData);
        
        const upcomingResponse = await api.get(`/discussions/upcoming?department=${studentData.department}&section=${studentData.section}`);
        setUpcomingSessions(upcomingResponse.data);

        const historyResponse = await api.get(`/discussions/history?student_id=1`);
        setHistorySessions(historyResponse.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-indigo-600">Loading Discussions...</div>;
  }

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        
        {/* DASHBOARD (Upcoming & History) */}
        {stage === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PageWrapper 
              title="Discussions" 
              description="Manage your AI-moderated group discussions."
              headerAction={
                <Button variant="outline" className="hidden sm:flex border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => setStage("live")}>
                  Demo Mode (Skip Waiting)
                </Button>
              }
            >
              <UpcomingDiscussions 
                sessions={upcomingSessions} 
                onJoin={() => setStage("waiting")} 
              />
              
              <div className="py-4"></div>
              
              <DiscussionHistory 
                sessions={historySessions}
                onViewDetails={(id) => setStage("details")} 
              />
            </PageWrapper>
          </motion.div>
        )}

        {/* WAITING ROOM */}
        {stage === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center min-h-[80vh]"
          >
            <WaitingRoom 
              student={student} 
              onContinue={() => setStage("live")} 
            />
          </motion.div>
        )}

        {/* LIVE ROOM (Formation, Topic, Prep, Live) */}
        {stage === "live" && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full"
          >
            <LiveRoom 
              student={student}
              onComplete={() => setStage("results")} 
            />
          </motion.div>
        )}

        {/* RESULTS & FEEDBACK */}
        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DiscussionResults 
              onBackToHistory={() => setStage("dashboard")}
              onPracticeAgain={() => setStage("live")}
            />
          </motion.div>
        )}

        {/* HISTORICAL DETAILS */}
        {stage === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <DiscussionDetails 
              onBack={() => setStage("dashboard")}
              onPracticeAgain={() => setStage("live")}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
