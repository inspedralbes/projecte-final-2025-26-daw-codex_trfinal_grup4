import React, { useState } from 'react';
import {
    IconReply, IconRepost, IconLike, IconShare, IconVerify, IconMore
} from '@/components/ui/Icons';
import { mockApi } from '@/services/mockApi';

const PostCard = ({ post }) => {
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(post.likedByMe);
    const [isReposted, setIsReposted] = useState(false);

    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
            setIsLiked(false);
        } else {
            setLikes(likes + 1);
            setIsLiked(true);
        }
        // In real app, call API
    };

    const handleRepost = () => {
        setIsReposted(!isReposted);
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = (now - date) / 1000; // seconds

        if (diff < 60) return `${Math.floor(diff)}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return date.toLocaleDateString();
    };

    return (
        <article className="post-card">
            <div className="post-avatar-col">
                <img src={post.user.avatar} className="avatar-img" />
            </div>
            <div className="post-content-col">
                <div className="post-header">
                    <div className="user-meta">
                        <span className="user-name">{post.user.name}</span>
                        {post.user.verified && <IconVerify className="verified-icon" />}
                        <span className="user-handle">@{post.user.handle}</span>
                        <span className="separator">·</span>
                        <span className="post-time">{formatTime(post.timestamp)}</span>
                    </div>
                    <div className="more-btn">
                        <IconMore className="more-icon" />
                    </div>
                </div>

                <div className="post-text">
                    {post.content}
                </div>

                {post.image && (
                    <div className="post-image-container">
                        <img src={post.image} className="post-image" />
                    </div>
                )}

                <div className="post-actions">
                    <div className="action-group reply">
                        <div className="action-icon-wrapper">
                            <IconReply className="action-icon" />
                        </div>
                        <span className="action-count">{post.replies || ''}</span>
                    </div>

                    <div className={`action-group repost ${isReposted ? 'active' : ''}`} onClick={handleRepost}>
                        <div className="action-icon-wrapper">
                            <IconRepost className="action-icon" />
                        </div>
                        <span className="action-count">{post.reposts || ''}</span>
                    </div>

                    <div className={`action-group like ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                        <div className="action-icon-wrapper">
                            <IconLike className="action-icon" active={isLiked} />
                        </div>
                        <span className="action-count">{likes || ''}</span>
                    </div>

                    <div className="action-group share">
                        <div className="action-icon-wrapper">
                            <IconShare className="action-icon" />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .post-card {
                    display: flex;
                    padding: 16px;
                    border: 1px solid var(--color-border);
                    background-color: var(--color-surface);
                    border-radius: var(--radius-lg);
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                .post-card:hover {
                    border-color: var(--color-text-secondary);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sm);
                }
                .post-avatar-col {
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                .avatar-img {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-sm); /* Square avatar */
                    background-color: var(--color-background);
                }
                .post-content-col {
                    flex-grow: 1;
                    overflow: hidden;
                }
                .post-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .user-meta {
                    display: flex;
                    align-items: center;
                    font-size: 15px;
                    white-space: nowrap;
                    overflow: hidden;
                }
                .user-name {
                    font-weight: var(--font-weight-bold);
                    color: var(--color-text);
                    margin-right: 4px;
                }
                .verified-icon {
                    width: 18px;
                    height: 18px;
                    color: var(--color-primary);
                    margin-right: 4px;
                }
                .user-handle, .post-time, .separator {
                    color: var(--color-text-secondary);
                    font-family: var(--font-family-mono); /* Code feel for handles */
                    font-size: 13px;
                }
                .separator {
                    padding: 0 4px;
                }
                .more-icon {
                    width: 18px;
                    height: 18px;
                    color: var(--color-text-secondary);
                }
                .post-text {
                    font-size: 15px;
                    line-height: 1.5;
                    color: var(--color-text);
                    white-space: pre-wrap;
                    margin-bottom: 12px;
                }
                .post-image-container {
                    margin-top: 12px;
                    margin-bottom: 12px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    border: 1px solid var(--color-border);
                }
                .post-image {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                .post-actions {
                    display: flex;
                    justify-content: space-between;
                    max-width: 425px;
                    margin-top: 12px;
                }
                .action-group {
                    display: flex;
                    align-items: center;
                    color: var(--color-text-secondary);
                    font-size: 13px;
                    transition: color var(--transition-fast);
                }
                .action-icon-wrapper {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm); /* Square hover effect */
                    transition: background-color var(--transition-fast);
                    margin-right: 4px;
                }
                .action-icon {
                    width: 18px;
                    height: 18px;
                }
                
                /* Hover Effects */
                .action-group.reply:hover {
                    color: var(--color-primary);
                }
                .action-group.reply:hover .action-icon-wrapper {
                    background-color: rgba(14, 165, 233, 0.1);
                }
                
                .action-group.repost:hover, .action-group.repost.active {
                    color: var(--color-success);
                }
                .action-group.repost:hover .action-icon-wrapper {
                    background-color: rgba(16, 185, 129, 0.1);
                }
                
                .action-group.like:hover, .action-group.like.active {
                    color: var(--color-like);
                }
                .action-group.like:hover .action-icon-wrapper {
                    background-color: rgba(249, 24, 128, 0.1);
                }
                
                .action-group.share:hover {
                    color: var(--color-primary);
                }
                .action-group.share:hover .action-icon-wrapper {
                    background-color: rgba(14, 165, 233, 0.1);
                }
            `}</style>
        </article>
    );
};

export default PostCard;
