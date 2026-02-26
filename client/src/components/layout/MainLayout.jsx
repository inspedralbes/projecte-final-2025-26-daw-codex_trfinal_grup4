import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import RightSection from './RightSection';
import './MainLayout.css';

export default function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      {/* Mobile Header - only visible on small screens */}
      <header className="mobile-header">
        <div className="mobile-header__avatar" onClick={() => navigate('/profile')}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'dev'}`}
            alt="Avatar"
          />
        </div>
        <div className="mobile-header__logo" onClick={() => navigate('/')}>
          <span className="mobile-header__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </span>
          <span className="mobile-header__logo-text">Codex</span>
        </div>
        <div className="mobile-header__actions">
          <button className="mobile-header__action" onClick={() => navigate('/notifications')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <RightSection />
    </div>
  );
}