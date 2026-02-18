import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSection from './RightSection';
import '@/styles/base.css';

const MainLayout = () => {
    return (
        <div className="layout-container">
            <header className="layout-header">
                <Sidebar />
            </header>

            <main className="layout-main">
                <section className="feed-section">
                    <Outlet />
                </section>

                <aside className="widget-section">
                    <RightSection />
                </aside>
            </main>

            <style>{`
        .layout-container {
            display: flex;
            justify-content: center;
            min-height: 100vh;
            max-width: var(--layout-max-width); /* 1265px */
            margin: 0 auto;
        }

        .layout-header {
            width: var(--sidebar-width); /* 275px */
            padding: 0 var(--space-3);
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--color-border);
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
        }

        .layout-main {
            display: flex;
            align-items: flex-start;
            flex-grow: 1;
        }

        .feed-section {
            width: var(--feed-width); /* 600px */
            min-height: 100vh;
            border-right: 1px solid var(--color-border);
            max-width: 600px;
            flex-shrink: 0;
        }

        .widget-section {
            width: var(--widget-width); /* 350px */
            margin-left: var(--space-8);
            padding-top: var(--space-3);
            padding-bottom: var(--space-16);
            display: none;
        }
        
        /* Responsive Breakpoints */
        
        /* Large Desktop (Default) - 3 Columns */
        @media (min-width: 1005px) {
            .widget-section {
                display: block;
            }
        }
        
        /* Tablet - 2 Columns (Sidebar + Feed) */
        @media (max-width: 1020px) {
            .layout-header {
                width: 88px; /* Icon only */
                align-items: center;
            }
            
            .feed-section {
                border-right: none;
                flex-grow: 1;
                max-width: 600px;
            }
        }
        
        @media (max-width: 700px) {
             .feed-section {
                width: 100%;
                max-width: none;
             }
        }
        
      `}</style>
        </div>
    );
};

export default MainLayout;
