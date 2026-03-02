import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import RightSection from "./RightSection";
import socketService from "@/services/socketService";
import "./MainLayout.css";

export default function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminNotification, setAdminNotification] = useState(null);

  // Admin Real-time Logic
  useEffect(() => {
    if (user?.role === "admin") {
      socketService.joinAdminRoom();

      const handleNewRequest = (data) => {
        setAdminNotification({
          id: Date.now(),
          message: `Nueva solicitud: ${data.center_name} de @${data.user.username}`,
          type: "info",
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setAdminNotification((prev) => (prev?.id === data.id ? null : prev));
        }, 5000);
      };

      socketService.onAdminEvent(handleNewRequest);

      return () => {
        socketService.leaveAdminRoom();
        socketService.off("admin.new_request", handleNewRequest);
      };
    }
  }, [user]);

  return (
    <div className={`app-layout ${user?.role === "admin" ? "app-layout--admin" : ""}`}>
      {/* Mobile Header - only visible on small screens */}
      <header className="mobile-header">
        <div className="mobile-header__avatar" onClick={() => navigate("/profile")}>
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "dev"}`
            }
            alt="Avatar"
          />
        </div>
        <div className="mobile-header__logo" onClick={() => navigate("/")}>
          <span className="mobile-header__logo-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </span>
          <span className="mobile-header__logo-text">Codex</span>
        </div>
        <div className="mobile-header__actions">
          <button className="mobile-header__action" onClick={() => navigate("/notifications")}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </header>

      <Sidebar />
      <main className="main-content">
        <div className="main-content__container">
          <Outlet />
        </div>
      </main>
      {user?.role !== "admin" && <RightSection />}

      {/* Admin Real-time Toast */}
      {adminNotification && (
        <div
          className={`ar-toast ar-toast--${adminNotification.type}`}
          onClick={() => {
            setAdminNotification(null);
            navigate("/admin/requests");
          }}
          style={{ cursor: "pointer" }}
        >
          <span>📢</span>
          <div>
            <div style={{ fontWeight: 600 }}>Nueva Solicitud</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>{adminNotification.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
