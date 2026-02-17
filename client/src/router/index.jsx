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

// Layouts
// import MainLayout from "@/layouts/MainLayout";

export default function AppRouter() {
  return (
    <Routes>
      {/* TODO: wrap routes with layout when MainLayout is implemented */}
      <Route path="/" element={<Home />} />

      {/* Catch-all / 404 */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
