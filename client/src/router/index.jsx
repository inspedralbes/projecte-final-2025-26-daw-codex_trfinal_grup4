/**
 * Router configuration
 *
 * Centralized route definitions for the application.
 * Import and register all page routes here.
 */
import React, { Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Pages (Lazy Loaded for SEO & Performance)
const Home = React.lazy(() => import("@/pages/Home"));
const ProfilePage = React.lazy(() => import("@/pages/ProfilePage"));
const PostDetail = React.lazy(() => import("@/pages/PostDetail"));
const Explore = React.lazy(() => import("@/pages/Explore"));
const Notifications = React.lazy(() => import("@/pages/Notifications"));
const Messages = React.lazy(() => import("@/pages/Messages"));
const More = React.lazy(() => import("@/pages/More"));
const Landing = React.lazy(() => import("@/pages/Landing"));
const GoogleCallback = React.lazy(() => import("@/pages/GoogleCallback"));
const CenterHub = React.lazy(() => import("@/pages/CenterHub"));
const EmailVerification = React.lazy(() => import("@/pages/EmailVerification"));
const ForgotPassword = React.lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("@/pages/ResetPassword"));

// Admin Pages (Lazy Loaded)
const AdminLayout = React.lazy(() => import("@/pages/admin/AdminLayout"));
const AdminOverview = React.lazy(() => import("@/pages/admin/AdminOverview"));
const AdminUsers = React.lazy(() => import("@/pages/admin/AdminUsers"));
const AdminModeration = React.lazy(() => import("@/pages/admin/AdminModeration"));
const AdminCenters = React.lazy(() => import("@/pages/admin/AdminCenters"));
const AdminRequests = React.lazy(() => import("@/pages/admin/AdminRequests"));

// Layouts (Static import because they wrap everything immediately)
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Loading Fallback
const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
    <style>{"@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"}</style>
  </div>
);

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
  return children ? children : <Outlet />;
};

// Admin Guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children ? children : <Outlet />;
};

export default function AppRouter() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<PageLoader />}>
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

        {/* Google OAuth callback */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* Password reset flow (public) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Email verification screen (authenticated but unverified) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/verify-email" element={<EmailVerification />} />
        </Route>

        {/* MAIN APP LAYOUT (Contains both Public and Protected Routes) */}
        <Route element={<MainLayout />}>
          
          {/* 1. PUBLIC ROUTES (Indexable by Google) */}
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/explore" element={<Explore />} />

          {/* 2. PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<VerifiedRoute />}>
              <Route
                path="/"
                element={user?.role === "admin" ? <Navigate to="/admin" replace /> : <Home />}
              />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/center" element={<CenterHub />} />
              <Route path="/more" element={<More />} />

              {/* Admin Section */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="moderation" element={<AdminModeration />} />
                  <Route path="centers" element={<AdminCenters />} />
                  <Route path="requests" element={<AdminRequests />} />
                </Route>
              </Route>
            </Route>
          </Route>

        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
