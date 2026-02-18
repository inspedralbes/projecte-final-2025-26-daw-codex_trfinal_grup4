import React, { useEffect, useState } from 'react';
import { mockApi } from '@/services/mockApi';
import { IconSearch, IconMore } from '@/components/ui/Icons';

const SearchBar = () => (
    <div className="search-container">
        <div className="search-icon-wrapper">
            <IconSearch className="search-icon" />
        </div>
        <input type="text" placeholder="Buscar" className="search-input" />
        <style>{`
        .search-container {
            background-color: #202327;
            border-radius: 9999px;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            margin-bottom: var(--space-3);
            border: 1px solid transparent;
        }
        .search-container:focus-within {
            background-color: var(--color-background);
            border-color: var(--color-primary);
        }
        .search-icon-wrapper {
            margin-right: 12px;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
        }
        .search-icon {
            width: 18px;
            height: 18px;
        }
        .search-input {
            background: transparent;
            border: none;
            color: var(--color-text);
            font-size: 15px;
            width: 100%;
        }
        .search-input:focus {
            outline: none;
        }
        .search-container:focus-within .search-icon-wrapper {
            color: var(--color-primary);
        }
    `}</style>
    </div>
);

const TrendItem = ({ topic, name, posts }) => (
    <div className="trend-item">
        <div className="trend-meta">
            <span className="trend-topic">{topic}</span>
            <IconMore className="trend-more" />
        </div>
        <div className="trend-name">{name}</div>
        <div className="trend-posts">{posts}</div>
        <style>{`
        .trend-item {
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color var(--transition-fast);
        }
        .trend-item:hover {
            background-color: rgba(255, 255, 255, 0.03);
        }
        .trend-meta {
            display: flex;
            justify-content: space-between;
            color: var(--color-text-secondary);
            font-size: 13px;
            margin-bottom: 2px;
        }
        .trend-more {
            width: 16px;
            height: 16px;
            color: var(--color-text-secondary);
        }
        .trend-name {
            font-weight: var(--font-weight-bold);
            font-size: 15px;
            margin-bottom: 2px;
        }
        .trend-posts {
            font-size: 13px;
            color: var(--color-text-secondary);
        }
    `}</style>
    </div>
);

const RightSection = () => {
    const [trends, setTrends] = useState([]);
    const [whoToFollow, setWhoToFollow] = useState([]);

    useEffect(() => {
        mockApi.getTrends().then(setTrends);
        mockApi.getWhoToFollow().then(setWhoToFollow);
    }, []);

    return (
        <div className="right-section">
            <SearchBar />

            <div className="card">
                <h2 className="card-title">Tendències per a tu</h2>
                <div className="card-content">
                    {trends.map((t, i) => (
                        <TrendItem key={i} {...t} />
                    ))}
                </div>
                <div className="card-footer">Show more</div>
            </div>

            <div className="card">
                <h2 className="card-title">A qui seguir</h2>
                <div className="card-content">
                    {whoToFollow.map(user => (
                        <div key={user.id} className="follow-item">
                            <img src={user.avatar} className="follow-avatar" />
                            <div className="follow-info">
                                <div className="follow-name">{user.name}</div>
                                <div className="follow-handle">@{user.handle}</div>
                            </div>
                            <button className="follow-btn">Seguir</button>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .right-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .card {
            background-color: #16181c;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid transparent; 
        }
        
        .card-title {
            padding: 12px 16px;
            font-size: 20px;
            font-weight: 800;
            margin: 0;
        }
        
        .card-footer {
            padding: 16px;
            color: var(--color-primary);
            font-size: 15px;
            cursor: pointer;
            transition: background-color var(--transition-fast);
        }
        
        .card-footer:hover {
            background-color: rgba(255, 255, 255, 0.03);
        }

        .follow-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color var(--transition-fast);
        }
        .follow-item:hover {
            background-color: rgba(255, 255, 255, 0.03);
        }
        .follow-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
        }
        .follow-info {
            flex-grow: 1;
            margin-right: 10px;
            overflow: hidden;
        }
        .follow-name {
            font-weight: bold;
            font-size: 15px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .follow-handle {
            color: var(--color-text-secondary);
            font-size: 15px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .follow-btn {
            background-color: #eff3f4;
            color: #0f1419;
            border: none;
            border-radius: 9999px;
            padding: 6px 16px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            white-space: nowrap;
        }
        .follow-btn:hover {
            background-color: #d7dbdc;
        }
      `}</style>
        </div>
    );
};

export default RightSection;
