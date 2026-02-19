import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSection from './RightSection';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="app-layout">
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