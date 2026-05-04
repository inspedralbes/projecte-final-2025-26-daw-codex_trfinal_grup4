import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext";
import Sidebar from "./Sidebar";
import RightSection from "./RightSection";
import SymbolSea from "@/components/ui/SymbolSea";
import CenterPromptModal from "@/components/center/CenterPromptModal";
import TeacherVerificationModal from "@/components/auth/TeacherVerificationModal";
import socketService from "@/services/socketService";
import api from "@/services/api";
import "./MainLayout.css";

export default function MainLayout() {
  const { user, centerCheck, dismissCenterPrompt, refreshUser } = useAuth();
  const { unreadCount, unreadMessagesCount } = useSocket();
  const navigate = useNavigate();
  const [adminNotification, setAdminNotification] = useState(null);
  const [showCenterPrompt, setShowCenterPrompt] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherModalLoading, setTeacherModalLoading] = useState(false);

  // Show center prompt modal after login if needed
  useEffect(() => {
    if (
      centerCheck?.needs_center_prompt &&
      !centerCheck?.is_generic_email &&
      !centerCheck?.has_center
    ) {
      // Small delay so the main layout renders first
      const timer = setTimeout(() => setShowCenterPrompt(true), 800);
      return () => clearTimeout(timer);
    }
  }, [centerCheck]);

  const handleDismissCenterPrompt = async () => {
    setShowCenterPrompt(false);
    await dismissCenterPrompt();
  };

  const handleCreateCenter = () => {
    setShowCenterPrompt(false);
    setShowTeacherModal(true);
  };

  const handleTeacherConfirm = async (centerRequestData) => {
    setTeacherModalLoading(true);
    try {
      const formData = new FormData();
      formData.append("center_name", centerRequestData.center_name);
      formData.append("domain", centerRequestData.domain);
      formData.append("full_name", centerRequestData.full_name);
      formData.append("justificante", centerRequestData.justificante);
      if (centerRequestData.city) {
        formData.append("city", centerRequestData.city);
      }

      await api.upload("/center-requests", formData);
      setShowTeacherModal(false);
      await dismissCenterPrompt();
      await refreshUser();
    } catch (error) {
      console.error("Center request error:", error);
    } finally {
      setTeacherModalLoading(false);
    }
  };

  const userDomain = user?.email ? user.email.split("@")[1] : "";

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
      {/* ── Symbol Sea Background ── */}
      <SymbolSea />
      
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
            <img
              src="/logo-transparent.png"
              alt="XC Logo"
              style={{ width: "24px", height: "24px", objectFit: "contain" }}
            />
          </span>
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
            {unreadCount > 0 && (
              <span className="mobile-header__badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
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
      
      {/* ── Brutalist Decorative Elements ── */}
      <div className="bg-watermark">CODEX_CORE_v2.0.46</div>
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

      {/* Center Prompt Modal – shown post-login for non-generic emails without a center */}
      {showCenterPrompt && (
        <CenterPromptModal
          domain={userDomain}
          onCreateCenter={handleCreateCenter}
          onDismiss={handleDismissCenterPrompt}
        />
      )}

      {/* Teacher Verification Modal – center creation form */}
      {showTeacherModal && (
        <TeacherVerificationModal
          email={user?.email}
          loading={teacherModalLoading}
          onConfirm={handleTeacherConfirm}
          onCancel={() => setShowTeacherModal(false)}
        />
      )}
    </div>
  );
}
