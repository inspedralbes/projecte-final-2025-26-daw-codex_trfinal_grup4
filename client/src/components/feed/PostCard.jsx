import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useInteractions } from "@/hooks/useInteractions";
import postsService from "@/services/postsService";
import { useAuth } from "@/hooks/useAuth";
import "./PostCard.css";

// Icons
const HeartIcon = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
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
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const RepostIcon = () => (
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
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
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
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
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

const VerifiedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--codex-teal)">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export const QuestionBadge = ({ solved }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`post-card__question-badge ${solved ? "post-card__question-badge--solved" : ""}`}
    >
      {solved ? `✓ ${t("feed.solved")}` : `? ${t("widgets.recent_questions")}`}
    </span>
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

  return (
    <article className={`post-card ${className}`}>
      {/* Repost indicator */}
      {isRepost && originalPost && (
        <div className="post-card__repost-indicator">
          <RepostIcon />{" "}
          <span>
            {author.name} {t("feed.reposted")}
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

        {/* Actions */}
        <div className="post-card__actions">
          <button className="post-card__action">
            <CommentIcon />
            <span>{formatNumber(commentsCount)}</span>
          </button>
          <button
            className={`post-card__action post-card__action--repost ${reposting ? "post-card__action--loading" : ""}`}
            onClick={handleRepost}
            disabled={reposting}
          >
            <RepostIcon />
            <span>{formatNumber(repostsCount)}</span>
          </button>
          <button
            className={`post-card__action post-card__action--like ${liked ? "post-card__action--liked" : ""}`}
            onClick={handleLike}
          >
            <HeartIcon filled={liked} />
            <span>{formatNumber(likesCount)}</span>
          </button>
          <button
            className={`post-card__action ${bookmarked ? "post-card__action--bookmarked" : ""}`}
            onClick={handleBookmark}
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
          <button className="post-card__action">
            <ShareIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
