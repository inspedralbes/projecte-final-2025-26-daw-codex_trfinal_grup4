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

// Layouts
import MainLayout from "@/components/layout/MainLayout";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/more" element={<More />} />
      </Route>
    </Routes>
  );
}
