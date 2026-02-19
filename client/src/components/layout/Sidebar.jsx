import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

// Navigation icons
const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ExploreIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CenterIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const NotificationsIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MessagesIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const PenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

const navItems = [
  { path: '/', label: 'Feed Global', Icon: HomeIcon },
  { path: '/explore', label: 'Explorar', Icon: ExploreIcon },
  { path: '/center', label: 'Mi Centro', Icon: CenterIcon },
  { path: '/notifications', label: 'Notificaciones', Icon: NotificationsIcon },
  { path: '/messages', label: 'Mensajes', Icon: MessagesIcon },
  { path: '/profile', label: 'Perfil', Icon: ProfileIcon },
  { path: '/more', label: 'Más', Icon: MoreIcon },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__container">
        {/* Logo */}
        <NavLink to="/" className="sidebar__logo">
          <span className="sidebar__logo-icon">
            <TerminalIcon />
          </span>
          <span className="sidebar__logo-text">Codex</span>
        </NavLink>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
              >
                <span className="sidebar__nav-icon">
                  <Icon active={isActive} />
                </span>
                <span className="sidebar__nav-label">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Post Button */}
        <button className="sidebar__post-btn">
          <span className="sidebar__post-btn-icon">
            <PenIcon />
          </span>
          <span className="sidebar__post-btn-text">Publicar</span>
        </button>

        {/* User Profile */}
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=developer" 
              alt="Avatar"
            />
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">Marc Pérez</span>
            <span className="sidebar__user-handle">@marcperez</span>
          </div>
          <button className="sidebar__user-menu">
            <MoreIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}