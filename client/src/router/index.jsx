/**
 * Router configuration
 * 
 * Centralized route definitions for the application.
 * Import and register all page routes here.
 */
import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import Home from "@/pages/Home";
import ProfilePage from "@/pages/ProfilePage";
import Explore from "@/pages/Explore";
import Notifications from "@/pages/Notifications";
import Messages from "@/pages/Messages";
import More from "@/pages/More";
import Landing from "@/pages/Landing";
import CenterHub from "@/pages/CenterHub";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/welcome" element={<Landing />} />
      
      {/* Authenticated routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/center" element={<CenterHub />} />
        <Route path="/more" element={<More />} />
      </Route>
    </Routes>
  );
}
