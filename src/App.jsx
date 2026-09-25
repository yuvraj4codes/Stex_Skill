import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages - Auth (Phase 2)
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Pages - Public
import HomePage from "./pages/HomePage";

// Pages - Placeholder (upcoming phases)
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <Routes>
      {/* Auth pages - no layout shell */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Pages with shared AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/onboarding" element={
          <ProtectedRoute><PlaceholderPage title="Student Onboarding Wizard" description="Set up your profile, skills you can teach, skills you want to learn, and availability." phase="Phase 3 (Onboarding & Profiles)" /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <PlaceholderPage title="Student Profile" description="View detailed student skill matrix, college information, and active projects." phase="Phase 3 (Student Profiles)" />
        } />
        <Route path="/discover" element={
          <ProtectedRoute><PlaceholderPage title="Discover Peers & Skills" description="Search for students by skill, course, semester, or reciprocal learning goals." phase="Phase 4 (Skill Catalog & Discovery)" /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><PlaceholderPage title="Student Dashboard" description="Overview of recommended reciprocal matches, active connections, and project updates." phase="Phase 5 (Matching & Dashboard)" /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><PlaceholderPage title="Direct 1-on-1 Messages" description="Coordinate peer learning sessions and share links with connected students." phase="Phase 6 (Supabase Realtime Chat)" /></ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute><PlaceholderPage title="Project Collaboration Finder" description="Discover student project ideas and apply to join project teams." phase="Phase 7 (Project Collaboration)" /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><PlaceholderPage title="Account Settings" description="Manage account preferences, notifications, and security options." phase="Phase 8 (Safety & Settings)" /></ProtectedRoute>
        } />
        <Route path="*" element={
          <PlaceholderPage title="Page Not Found (404)" description="The requested page does not exist." phase="404 Error" />
        } />
      </Route>
    </Routes>
  );
}
