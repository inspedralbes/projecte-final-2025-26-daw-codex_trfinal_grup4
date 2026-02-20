/**
 * Router configuration
 *
 * Centralized route definitions for the application.
 * Import and register all page routes here.
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Home from "@/pages/Home";
import ProfilePage from "@/pages/ProfilePage";
import Explore from "@/pages/Explore";
import Notifications from "@/pages/Notifications";
import Messages from "@/pages/Messages";
import More from "@/pages/More";
import Landing from "@/pages/Landing";
import CenterHub from "@/pages/CenterHub";
import EmailVerification from "@/pages/EmailVerification";

// Layouts
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Redirect authenticated users away from landing
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

// Require verified email – redirect to verification screen if not verified
const VerifiedRoute = ({ children }) => {
  const { user, emailVerified, loading } = useAuth();
  if (loading) return null;
  if (user && !emailVerified) return <Navigate to="/verify-email" replace />;
  return children;
};

export default function AppRouter() {
  return (
    <Routes>
      {/* Public landing page (only if not logged in) */}
      <Route
        path="/welcome"
        element={
          <PublicOnlyRoute>
            <Landing />
          </PublicOnlyRoute>
        }
      />

      {/* Email verification screen (authenticated but unverified) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/verify-email" element={<EmailVerification />} />
      </Route>

      {/* Authenticated + verified routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <VerifiedRoute>
              <MainLayout />
            </VerifiedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/center" element={<CenterHub />} />
          <Route path="/more" element={<More />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
