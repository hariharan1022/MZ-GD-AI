import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import DailySpeakingChallenge from "./pages/student/DailySpeakingChallenge";
import AIPracticeRoom from "./pages/student/AIPracticeRoom";
import StudentSettings from "./pages/student/StudentSettings";
import StudentLeaderboard from "./pages/student/StudentLeaderboard";

// New Student Modules
import StudentUpcoming from "./pages/student/StudentUpcoming";
import StudentActive from "./pages/student/StudentActive";
import StudentHistory from "./pages/student/StudentHistory";
import StudentReports from "./pages/student/StudentReports";
import StudentAnalytics from "./pages/student/StudentAnalytics";
import StudentAchievements from "./pages/student/StudentAchievements";
import StudentCertificates from "./pages/student/StudentCertificates";
import AIGroupDiscussion from "./pages/student/AIGroupDiscussion";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentProfile from "./pages/student/StudentProfile";
import StudentHelp from "./pages/student/StudentHelp";
import StudentLayout from "./layouts/StudentLayout";

// Admin Layout & Primary Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";

// Admin Modules
import AdminStudents from "./pages/admin/AdminStudents";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminYears from "./pages/admin/AdminYears";
import AdminSections from "./pages/admin/AdminSections";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminTopics from "./pages/admin/AdminTopics";
import AdminPractice from "./pages/admin/AdminPractice";
import AdminReports from "./pages/admin/AdminReports";
import AdminLeaderboard from "./pages/admin/AdminLeaderboard";
import AdminAchievements from "./pages/admin/AdminAchievements";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminModels from "./pages/admin/AdminModels";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminData from "./pages/admin/AdminData";
import AdminLogsActivity from "./pages/admin/AdminLogsActivity";
import AdminLogsSystem from "./pages/admin/AdminLogsSystem";
import AdminHelp from "./pages/admin/AdminHelp";
import AdminGroupDiscussion from "./pages/admin/AdminGroupDiscussion";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin Routes - Redesigned Enterprise Version */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Overview */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
            
            {/* Academic */}
            <Route path="students" element={<AdminStudents />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="years" element={<AdminYears />} />
            <Route path="sections" element={<AdminSections />} />
            
            {/* Discussions */}
            <Route path="sessions" element={<AdminSessions />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="topics" element={<AdminTopics />} />
            <Route path="practice" element={<AdminPractice />} />
            <Route path="gd" element={<AdminGroupDiscussion />} />
            
            {/* Performance */}
            <Route path="reports" element={<AdminReports />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="leaderboard" element={<AdminLeaderboard />} />
            <Route path="achievements" element={<AdminAchievements />} />
            <Route path="attendance" element={<AdminAttendance />} />
            
            {/* Management */}
            <Route path="models" element={<AdminModels />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="data" element={<AdminData />} />
            
            {/* System */}
            <Route path="logs/activity" element={<AdminLogsActivity />} />
            <Route path="logs/system" element={<AdminLogsSystem />} />
            <Route path="help" element={<AdminHelp />} />
          </Route>

          {/* Student Routes - Redesigned Premium Platform */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            
            {/* Overview */}
            <Route path="dashboard" element={<StudentDashboard />} />
            
            {/* Active Learning */}
            <Route path="upcoming" element={<StudentUpcoming />} />
            <Route path="active" element={<StudentActive />} />
            <Route path="ai-discussion" element={<AIGroupDiscussion />} />
            <Route path="practice" element={<AIPracticeRoom />} />
            <Route path="challenge" element={<DailySpeakingChallenge />} />
            
            {/* Analytics & Progress */}
            <Route path="history" element={<StudentHistory />} />
            <Route path="reports" element={<StudentReports />} />
            <Route path="analytics" element={<StudentAnalytics />} />
            <Route path="leaderboard" element={<StudentLeaderboard />} />
            <Route path="achievements" element={<StudentAchievements />} />
            <Route path="certificates" element={<StudentCertificates />} />
            
            {/* Account */}
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="help" element={<StudentHelp />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
