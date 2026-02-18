import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { mockApi } from '@/services/mockApi';
import {
    IconLogo, IconHome, IconHashtag, IconBell, IconMail, IconUser, IconMore, IconFeather
} from '@/components/ui/Icons';

const NavItem = ({ to, icon: Icon, label, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
        {({ isActive }) => (
            <>
                <div className="nav-icon-wrapper">
                    <Icon className="nav-icon" active={isActive} />
                </div>
                <span className="nav-label">{label}</span>
            </>
        )}
    </NavLink>
);

const Sidebar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        mockApi.getCurrentUser().then(setUser);
    }, []);

    return (
        <nav className="sidebar-nav">
            <div className="logo-container">
                <NavLink to="/" className="logo-link">
                    <IconLogo className="logo-icon" />
                </NavLink>
            </div>

            <div className="nav-list">
                <NavItem to="/" icon={IconHome} label="Inici" end />
                <NavItem to="/explore" icon={IconHashtag} label="Explorar" />
                <NavItem to="/notifications" icon={IconBell} label="Notificacions" />
                <NavItem to="/messages" icon={IconMail} label="Missatges" />
                <NavItem to="/profile" icon={IconUser} label="Perfil" />
                <NavItem to="/more" icon={IconMore} label="Més opcions" />
            </div>

            <button className="tweet-button">
                <span className="tweet-label">Publicar</span>
                <IconFeather className="tweet-icon" />
            </button>

            {user && (
                <div className="user-pill">
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                    <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-handle">@{user.handle}</div>
                    </div>
                    <div className="user-more">
                        <IconMore className="small-icon" />
                    </div>
                </div>
            )}

            <style>{`
        .sidebar-nav {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-bottom: var(--space-4);
            padding-right: var(--space-4); /* Add some spacing from the feed */
        }
        
        .logo-container {
            padding: 8px 0;
            margin-bottom: 8px;
            padding-left: 12px;
        }
        
        .logo-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: var(--radius-md); /* Square-ish */
            transition: all var(--transition-fast);
        }
        
        .logo-link:hover {
            background-color: var(--color-surface-hover);
            color: var(--color-primary);
        }
        
        .logo-icon {
            width: 28px;
            height: 28px;
            color: currentColor;
        }
        
        .nav-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .nav-item {
            display: inline-flex;
            align-items: center;
            padding: 12px 16px;
            border-radius: var(--radius-md); /* Tech look */
            color: var(--color-text-secondary); /* Muted by default */
            text-decoration: none;
            transition: all var(--transition-fast);
            width: 100%;
            margin-bottom: 2px;
        }
        
        .nav-item:hover {
            background-color: var(--color-surface-hover);
            color: var(--color-text);
            text-decoration: none;
        }
        
        .nav-item.active {
            background-color: rgba(14, 165, 233, 0.15); /* Primary Alpha */
            color: var(--color-primary);
            font-weight: var(--font-weight-medium);
        }
        
        .nav-icon {
            width: 24px;
            height: 24px;
        }
        
        .nav-label {
            margin-left: 16px;
            font-size: 19px;
            line-height: 24px;
        }
        
        .tweet-button {
            background-color: var(--color-primary);
            color: #fff;
            border: none;
            border-radius: var(--radius-md);
            height: 48px;
            width: 100%;
            font-size: 16px;
            font-weight: var(--font-weight-bold);
            margin-top: 24px;
            cursor: pointer;
            transition: background-color var(--transition-fast);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-md);
        }
        
        .tweet-button:hover {
            background-color: var(--color-primary-hover);
        }
        
        .tweet-icon {
            display: none;
            width: 24px;
            height: 24px;
        }
        
        .user-pill {
            display: flex;
            align-items: center;
            padding: 10px;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: background-color var(--transition-fast);
            margin-top: auto;
            border: 1px solid transparent;
        }
        
        .user-pill:hover {
            background-color: var(--color-surface);
            border-color: var(--color-border);
        }
        
        .user-avatar {
            width: 38px;
            height: 38px;
            border-radius: var(--radius-sm); /* Square avatar */
            margin-right: 12px;
            background-color: var(--color-surface);
        }
        
        .user-info {
            flex-grow: 1;
            margin-right: 12px;
            line-height: 1.25;
            overflow: hidden;
        }
        
        .user-name {
            font-weight: var(--font-weight-bold);
            font-size: 15px;
            color: var(--color-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .user-handle {
            color: var(--color-text-tertiary);
            font-size: 14px;
        }
        
        .user-more {
            color: var(--color-text-secondary);
        }
        
        .small-icon {
            width: 18px;
            height: 18px;
        }
        
        /* Tablet/Mobile Adjustments */
        @media (max-width: 1020px) {
            .sidebar-nav {
                align-items: center;
                padding-right: 0;
            }
            .nav-label {
                display: none;
            }
            .nav-item {
                width: 50px;
                height: 50px;
                justify-content: center;
                padding: 0;
            }
            .logo-container {
                padding-left: 0;
            }
            .tweet-button {
                width: 50px;
                height: 50px;
                border-radius: 50%; /* Rounded on mobile/tablet for compactness */
                margin-top: 16px;
            }
            .tweet-label {
                display: none;
            }
            .tweet-icon {
                display: block;
            }
            .user-info, .user-more {
                display: none;
            }
            .user-avatar {
                margin-right: 0;
            }
            .user-pill {
                padding: 8px;
                justify-content: center;
            }
        }
      `}</style>
        </nav>
    );
};

export default Sidebar;
