import React, { useEffect, useState } from 'react';
import PostInput from './PostInput';
import PostCard from './PostCard';
import { mockApi } from '@/services/mockApi';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('for-you');

    const fetchPosts = () => {
        mockApi.getPosts().then(setPosts);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    return (
        <div className="feed-container">
            <header className="feed-header">
                <div className="feed-tabs">
                    <div
                        className={`feed-tab ${activeTab === 'for-you' ? 'active' : ''}`}
                        onClick={() => setActiveTab('for-you')}
                    >
                        <span className="tab-label">Per a tu</span>
                        {activeTab === 'for-you' && <div className="tab-indicator" />}
                    </div>
                    <div
                        className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
                        onClick={() => setActiveTab('following')}
                    >
                        <span className="tab-label">Seguint</span>
                        {activeTab === 'following' && <div className="tab-indicator" />}
                    </div>
                </div>
            </header>

            <PostInput onPostCreated={handlePostCreated} />

            <div className="posts-list">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            <style>{`
                .feed-container {
                    width: 100%;
                }
                .feed-header {
                    margin-bottom: 16px;
                    border-bottom: 1px solid var(--color-border);
                }
                .feed-tabs {
                    display: flex;
                    height: 53px;
                }
                .feed-tab {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color var(--transition-fast);
                    position: relative;
                    color: var(--color-text-secondary);
                    font-weight: var(--font-weight-medium);
                }
                .feed-tab:hover {
                    background-color: var(--color-surface);
                    color: var(--color-text);
                }
                .feed-tab.active {
                    color: var(--color-text);
                    font-weight: var(--font-weight-bold);
                }
                .tab-label {
                    padding: 16px 0;
                }
                .tab-indicator {
                    width: 56px;
                    height: 4px;
                    background-color: var(--color-primary);
                    border-radius: 9999px;
                    position: absolute;
                    bottom: 0;
                }
            `}</style>
        </div>
    );
};

export default Feed;
