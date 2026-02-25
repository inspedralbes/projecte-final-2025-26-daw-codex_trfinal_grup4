import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import i18next from "i18next";
import { useInteractions } from "@/hooks/useInteractions";
import postsService from "@/services/postsService";
import { useAuth } from "@/hooks/useAuth";
import "./PostCard.css";

// Icons - Twitter-style minimal
const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const CommentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1.751 10c0-4.42 3.58-8 8-8h4.5c4.42 0 8 3.58 8 8s-3.58 8-8 8h-1.5l-4.5 4v-4h-.5c-4.42 0-8-3.58-8-8z" />
  </svg>
);

const RepostIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 12V9a4 4 0 014-4h12M20 12v3a4 4 0 01-4 4H4M7 8L4 5l3-3M17 16l3 3-3 3" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l7 7h-4v6h-6v-6H5l7-7zM5 18h14v2H5v-2z" />
  </svg>
);

const MoreIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const ReplyToIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 17l-5-5 5-5M4 12h12a4 4 0 014 4v1" />
  </svg>
);

const VerifiedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--codex-teal)">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// Question badge icons
const QuestionMarkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const QuestionBadge = ({ solved }) => {
  const { t } = useTranslation();
  return (
    <div className={`post-card__question-badge ${solved ? "post-card__question-badge--solved" : ""}`}>
      <span className="post-card__question-badge-icon">
        {solved ? <CheckCircleIcon /> : <QuestionMarkIcon />}
      </span>
      <span className="post-card__question-badge-text">
        {solved ? t("feed.solved") : t("widgets.recent_questions")}
      </span>
      {!solved && <span className="post-card__question-badge-pulse" />}
    </div>
  );
};

// Helper to format relative time
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return i18next.t("feed.time.now");
  if (diffMins < 60) return `${diffMins}${i18next.t("feed.time.m")}`;
  if (diffHours < 24) return `${diffHours}${i18next.t("feed.time.h")}`;
  if (diffDays < 7) return `${diffDays}${i18next.t("feed.time.d")}`;
  return date.toLocaleDateString(i18next.language, { day: "numeric", month: "short" });
};

// Map API role to display badge
const getRoleBadge = (user) => {
  if (!user) return null;
  if (user.role === "teacher") return i18next.t("sidebar.teacher");
  if (user.role === "admin") return i18next.t("sidebar.admin");
  if (user.role === "student" && user.center) {
    // Try to detect course from email or just show center
    return user.center?.name?.substring(0, 8) || "Estudiante";
  }
  return null;
};

export default function PostCard({ post, className = "", onInteractionUpdate, onDelete }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [reposting, setReposting] = useState(false);

  // Extract user from post (API returns user object)
  const author = post.user || post.author || {};
  const isVerified = author.role === "teacher" || author.role === "admin";
  const badge = getRoleBadge(author);

  // Use interactions hook for API calls
  const { liked, bookmarked, likesCount, toggleLike, toggleBookmark } = useInteractions({
    postId: post.id,
    likesCount: post.likes_count || post.stats?.likes || 0,
    bookmarksCount: post.bookmarks_count || post.stats?.bookmarks || 0,
    userLiked: post.user_liked || false,
    userBookmarked: post.user_bookmarked || false,
  });

  const commentsCount = post.comments_count || post.stats?.comments || 0;
  const repostsCount = post.reposts_count || post.stats?.reposts || 0;

  const handleLike = useCallback(async () => {
    await toggleLike();
    if (onInteractionUpdate) {
      onInteractionUpdate(post.id, {
        likes_count: liked ? likesCount - 1 : likesCount + 1,
        user_liked: !liked,
      });
    }
  }, [toggleLike, onInteractionUpdate, post.id, liked, likesCount]);

  const handleBookmark = useCallback(async () => {
    await toggleBookmark();
  }, [toggleBookmark]);

  const handleRepost = useCallback(async () => {
    if (reposting) return;
    setReposting(true);
    try {
      await postsService.repost(post.id);
      // Could show success toast here
    } catch (err) {
      console.error("Error reposting:", err);
    } finally {
      setReposting(false);
    }
  }, [post.id, reposting]);

  const handleDelete = useCallback(async () => {
    if (onDelete && window.confirm(t("feed.delete_confirm"))) {
      await onDelete(post.id);
    }
    setShowMenu(false);
  }, [onDelete, post.id]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  const isOwner = currentUser?.id === author.id;
  const postType = post.type || "news";
  const avatarUrl =
    author.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username || author.name || "user"}`;

  // Handle repost display
  const isRepost = post.is_repost || !!post.original_post;
  const originalPost = post.original_post;

  // Handle reply display
  const isReply = post.type === "reply";
  const replyToPost = post.reply_to_post;
  const replyToComment = post.reply_to_comment;

  return (
    <article className={`post-card ${isReply ? "post-card--reply" : ""} ${className}`}>
      {/* Repost indicator */}
      {isRepost && originalPost && (
        <div className="post-card__repost-indicator">
          <RepostIcon />{" "}
          <span>
            {author.name} {t("feed.reposted")}
          </span>
        </div>
      )}

      {/* Reply indicator */}
      {isReply && replyToPost && (
        <div className="post-card__reply-indicator">
          <ReplyToIcon />
          <span>
            {t("post.replying_to")}{" "}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/post/${replyToPost.id}`);
              }}
              className="post-card__reply-link"
            >
              @{replyToPost.user?.username || "usuario"}
            </a>
            {replyToComment && (
              <>
                {" "}&middot;{" "}
                <span className="post-card__reply-secondary">
                  @{replyToComment.user?.username}
                </span>
              </>
            )}
          </span>
        </div>
      )}

      <div className="post-card__avatar">
        <img src={avatarUrl} alt={author.name || "Usuario"} />
      </div>

      <div className="post-card__content">
        {/* Header */}
        <header className="post-card__header">
          <div className="post-card__author">
            <span className="post-card__name">
              {author.name || "Usuario"}
              {isVerified && <VerifiedIcon />}
            </span>
            <span className="post-card__handle">@{author.username || "user"}</span>
            {badge && <span className="post-card__badge">{badge}</span>}
            <span className="post-card__dot">·</span>
            <span className="post-card__time">{formatTimestamp(post.created_at)}</span>
          </div>
          <div className="post-card__menu-wrapper">
            <button className="post-card__more" onClick={() => setShowMenu(!showMenu)}>
              <MoreIcon />
            </button>
            {showMenu && (
              <div className="post-card__dropdown">
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="post-card__dropdown-item post-card__dropdown-item--danger"
                  >
                    {t("common.delete")}
                  </button>
                )}
                <button onClick={() => setShowMenu(false)} className="post-card__dropdown-item">
                  {t("common.close")}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Question Badge */}
        {postType === "question" && <QuestionBadge solved={post.is_solved || post.solved} />}

        {/* Text Content */}
        <p className="post-card__text">{post.content}</p>

        {/* Code Block */}
        {post.code_snippet && (
          <div className="post-card__code">
            <div className="post-card__code-header">
              <div className="post-card__code-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="post-card__code-lang">{post.code_language || "code"}</span>
            </div>
            <pre className="post-card__code-content">
              <code>{post.code_snippet}</code>
            </pre>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-card__tags">
            {post.tags.map((tag) => {
              const tagName = typeof tag === "string" ? tag : tag.name || tag.slug;
              return (
                <a key={tagName} href="#" className="post-card__tag">
                  #{tagName}
                </a>
              );
            })}
          </div>
        )}

        {/* Actions - Twitter style */}
        <div className="post-card__actions">
          <button 
            className="post-card__action post-card__action--comment"
            onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
            title={t('feed.comment')}
          >
            <span className="post-card__action-icon"><CommentIcon /></span>
            {commentsCount > 0 && <span className="post-card__action-count">{formatNumber(commentsCount)}</span>}
          </button>
          
          <button
            className={`post-card__action post-card__action--repost ${reposting ? "post-card__action--loading" : ""}`}
            onClick={(e) => { e.stopPropagation(); handleRepost(); }}
            disabled={reposting || isOwner}
            title={isOwner ? t('feed.cant_repost_own') : t('feed.repost')}
          >
            <span className="post-card__action-icon"><RepostIcon /></span>
            {repostsCount > 0 && <span className="post-card__action-count">{formatNumber(repostsCount)}</span>}
          </button>
          
          <button
            className={`post-card__action post-card__action--like ${liked ? "post-card__action--active" : ""}`}
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            title={liked ? t('feed.unlike') : t('feed.like')}
          >
            <span className="post-card__action-icon"><HeartIcon filled={liked} /></span>
            {likesCount > 0 && <span className="post-card__action-count">{formatNumber(likesCount)}</span>}
          </button>
          
          <button
            className={`post-card__action post-card__action--bookmark ${bookmarked ? "post-card__action--active" : ""}`}
            onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
            title={bookmarked ? t('feed.unbookmark') : t('feed.bookmark')}
          >
            <span className="post-card__action-icon"><BookmarkIcon filled={bookmarked} /></span>
          </button>
        </div>
      </div>
    </article>
  );
}
