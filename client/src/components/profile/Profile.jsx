import React, { useEffect, useState } from 'react';
import { mockApi } from '@/services/mockApi';
import PostCard from '@/components/feed/PostCard'; // Reusing PostCard
import { IconVerify, IconLocation, IconMore } from '@/components/ui/Icons'; // Reusing icons

const Profile = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = await mockApi.getCurrentUser();
            setUser(currentUser);
            // For now just getting all posts, in reality filter by user
            const allPosts = await mockApi.getPosts();
            setPosts(allPosts.filter(p => p.userId === currentUser.id || p.userId === 'u1')); // Mock filter
        };
        fetchData();
    }, []);

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="header-back">
                    {/* Back arrow could go here */}
                    <div className="header-info">
                        <h2 className="header-name">{user.name}</h2>
                        <span className="header-posts">1,234 posts</span>
                    </div>
                </div>
            </header>

            <div className="profile-hero">
                <div className="banner"></div>
                <div className="profile-avatar-container">
                    <img src={user.avatar} className="profile-avatar" />
                    <button className="edit-profile-btn">Editar perfil</button>
                </div>
                <div className="profile-info">
                    <div className="name-row">
                        <h1 className="profile-name">{user.name}</h1>
                        {user.verified && <IconVerify className="verified-icon" />}
                    </div>
                    <div className="profile-handle">@{user.handle}</div>

                    <div className="profile-bio">
                        Full Stack Developer | React & Laravel enthusiast | Building cool things 🚀
                    </div>

                    <div className="profile-meta">
                        <div className="meta-item">
                            <IconLocation className="meta-icon" />
                            <span>Barcelona, ES</span>
                        </div>
                        {/* More meta items like Link, Joined Date... */}
                    </div>

                    <div className="follow-stats">
                        <span className="stat-item">
                            <span className="stat-value">567</span> <span className="stat-label">Seguint</span>
                        </span>
                        <span className="stat-item">
                            <span className="stat-value">890</span> <span className="stat-label">Seguidors</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                {['Posts', 'Replies', 'Highlights', 'Media', 'Likes'].map(tab => (
                    <div
                        key={tab}
                        className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        <span className="tab-text">{tab}</span>
                        {activeTab === tab && <div className="tab-line" />}
                    </div>
                ))}
            </div>

            <div className="profile-feed">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            <style>{`
                .profile-header {
                    position: sticky;
                    top: 0;
                    background-color: rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(12px);
                    z-index: 10;
                    padding: 0 16px;
                    height: 53px;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid var(--color-border);
                }
                .header-name {
                    font-size: 20px;
                    font-weight: bold;
                    line-height: 1.2;
                }
                .header-posts {
                    font-size: 13px;
                    color: var(--color-text-secondary);
                }
                
                .banner {
                    height: 200px;
                    background-color: #333639; /* Placeholder color */
                    background-image: linear-gradient(to right, #1d9bf0, #80c9f7);
                }
                
                .profile-avatar-container {
                    padding: 0 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-top: -70px;
                    margin-bottom: 12px;
                }
                
                .profile-avatar {
                    width: 134px;
                    height: 134px;
                    border-radius: 50%;
                    border: 4px solid var(--color-background);
                    background-color: #000;
                }
                
                .edit-profile-btn {
                    margin-top: 82px; /* Offset to align with bottom of avatar area */
                    background: transparent;
                    color: var(--color-text);
                    border: 1px solid var(--color-border);
                    border-radius: 9999px;
                    padding: 6px 16px;
                    font-weight: bold;
                    font-size: 15px;
                    cursor: pointer;
                    transition: background-color var(--transition-fast);
                }
                .edit-profile-btn:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .profile-info {
                    padding: 0 16px;
                    margin-bottom: 16px;
                }
                .name-row {
                    display: flex;
                    align-items: center;
                }
                .profile-name {
                    font-size: 20px;
                    font-weight: 800;
                    margin-right: 4px;
                }
                .verified-icon {
                    width: 20px;
                    height: 20px;
                    color: var(--color-primary);
                }
                .profile-handle {
                    color: var(--color-text-secondary);
                    font-size: 15px;
                    margin-bottom: 12px;
                }
                .profile-bio {
                    font-size: 15px;
                    margin-bottom: 12px;
                    line-height: 1.3;
                }
                .profile-meta {
                    display: flex;
                    align-items: center;
                    color: var(--color-text-secondary);
                    font-size: 15px;
                    margin-bottom: 12px;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    margin-right: 16px;
                }
                .meta-icon {
                    width: 18px;
                    height: 18px;
                    margin-right: 4px;
                }
                
                .follow-stats {
                    display: flex;
                    font-size: 14px;
                }
                .stat-item {
                    margin-right: 20px;
                    cursor: pointer;
                }
                .stat-item:hover {
                    text-decoration: underline;
                }
                .stat-value {
                    font-weight: bold;
                    color: var(--color-text);
                }
                .stat-label {
                    color: var(--color-text-secondary);
                }
                
                .profile-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--color-border);
                    margin-top: 16px;
                }
                .tab-item {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 53px;
                    cursor: pointer;
                    position: relative;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    transition: background-color var(--transition-fast);
                }
                .tab-item:hover {
                    background-color: var(--color-surface);
                    color: var(--color-text);
                }
                .tab-item.active {
                    color: var(--color-text);
                    font-weight: bold;
                }
                .tab-line {
                    position: absolute;
                    bottom: 0;
                    width: 56px;
                    height: 4px;
                    background-color: var(--color-primary);
                    border-radius: 9999px;
                }
            `}</style>
        </div>
    );
};

export default Profile;
