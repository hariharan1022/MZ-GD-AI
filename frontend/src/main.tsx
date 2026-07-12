import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import "./index.css";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import StudentDashboard from "./pages/student/StudentDashboard";
import DailySpeakingChallenge from "./pages/student/DailySpeakingChallenge";
import AIPracticeRoom from "./pages/student/AIPracticeRoom";
import StudentDiscussions from "./pages/student/StudentDiscussions";
import StudentSettings from "./pages/student/StudentSettings";
import StudentLeaderboard from "./pages/student/StudentLeaderboard";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<AdminOverview />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<DashboardLayout role="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="challenge" element={<DailySpeakingChallenge />} />
          <Route path="practice" element={<AIPracticeRoom />} />
          <Route path="discussions" element={<StudentDiscussions />} />
          <Route path="leaderboard" element={<StudentLeaderboard />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
