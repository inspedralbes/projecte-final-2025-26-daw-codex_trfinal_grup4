import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext";
import GlitchHover from "@/components/ui/GlitchHover";
import "./Sidebar.css";

// Navigation icons
const HomeIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ExploreIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2.5" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CenterIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const NotificationsIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MessagesIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2a2 2 0 0 1-2 2a2 2 0 0 0-2 2a2 2 0 0 1-2 2a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2a2 2 0 0 1 2 2a2 2 0 0 0 2 2a2 2 0 0 1 2 2a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2a2 2 0 0 1 2-2a2 2 0 0 0 2-2a2 2 0 0 1 2-2a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2a2 2 0 0 1-2-2a2 2 0 0 0-2-2a2 2 0 0 1-2-2a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PenIcon = () => (
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
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ModerationIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UsersIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StatsIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const RequestsIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const navItems = [
  { path: "/", label: "sidebar.home", Icon: HomeIcon },
  { path: "/center", label: "sidebar.center", Icon: CenterIcon, centerItem: true },
  { path: "/messages", label: "sidebar.messages", Icon: MessagesIcon },
  { path: "/settings", label: "sidebar.settings", Icon: SettingsIcon },
  { path: "/notifications", label: "sidebar.notifications", Icon: NotificationsIcon },
  { path: "/explore", label: "sidebar.explore", Icon: ExploreIcon },
  { path: "/profile", label: "sidebar.profile", Icon: ProfileIcon },
  { path: "/admin", label: "sidebar.admin_summary", Icon: StatsIcon, adminOnly: true, end: true },
  { path: "/admin/users", label: "sidebar.admin_users", Icon: UsersIcon, adminOnly: true },
  {
    path: "/admin/moderation",
    label: "sidebar.admin_moderation",
    Icon: ModerationIcon,
    adminOnly: true,
  },
  { path: "/admin/centers", label: "sidebar.admin_centers", Icon: CenterIcon, adminOnly: true },
  { path: "/admin/requests", label: "sidebar.admin_requests", Icon: RequestsIcon, adminOnly: true },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, centerCheck } = useAuth();
  const { unreadCount, unreadMessagesCount } = useSocket();

  const isGenericEmail = centerCheck?.is_generic_email ?? false;

  const handleLogout = async () => {
    await logout();
    navigate("/welcome");
  };

  const visibleNavItems = navItems.filter((item) => {
    if (user && user.role === "admin") {
      return item.adminOnly;
    }
    return !item.adminOnly;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar__container">
        {/* Logo */}
        <NavLink to={user?.role === "admin" ? "/admin" : "/"} className="sidebar__logo">
          <span className="sidebar__logo-icon">
            <img
              src="/logo-transparent.png"
              alt="XC Logo"
              className="sidebar__logo-img"
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
          </span>
          <span className="sidebar__logo-text">Codex</span>
        </NavLink>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {visibleNavItems.map(({ path, label, Icon, end, centerItem }) => {
            const isLocked = centerItem && isGenericEmail;
            const isActive = end
              ? location.pathname === path
              : location.pathname.startsWith(path) && (path !== "/" || location.pathname === "/");

            if (isLocked) {
              return (
                <div
                  key={path}
                  className="sidebar__nav-item sidebar__nav-item--locked"
                  title={t("sidebar.center_locked_tooltip")}
                >
                  <span className="sidebar__nav-icon">
                    <Icon active={false} />
                  </span>
                  <span className="sidebar__nav-label">
                    <GlitchHover>{t(label)}</GlitchHover>
                  </span>
                  <span className="sidebar__nav-lock">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={`sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`}
              >
                <span className="sidebar__nav-icon">
                  <Icon active={isActive} />
                  {path === "/notifications" && unreadCount > 0 && (
                    <span className="sidebar__nav-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {path === "/messages" && unreadMessagesCount > 0 && (
                    <span className="sidebar__nav-badge">
                      {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                    </span>
                  )}
                </span>
                <span className="sidebar__nav-label">
                  <GlitchHover>{t(label)}</GlitchHover>
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile or Login Button */}
        {user ? (
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || "developer"}`
                }
                alt="Avatar"
              />
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user.name}</span>
              <span className="sidebar__user-handle">@{user.username}</span>
            </div>
            <button
              className="sidebar__user-menu"
              onClick={handleLogout}
              title={t("common.logout")}
            >
              <LogoutIcon />
            </button>
          </div>
        ) : (
          <div className="sidebar__user" style={{ justifyContent: "center", padding: "1rem" }}>
            <button
              onClick={() => navigate("/welcome")}
              className="sidebar__user-name"
              style={{
                background: "var(--codex-primary)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                width: "100%",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {t("auth.login", "Iniciar Sesión")}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
