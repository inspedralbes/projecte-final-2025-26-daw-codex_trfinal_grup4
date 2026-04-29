/**
 * PostDetail - Shows a single post with its comments
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import postsService from "@/services/postsService";
import commentsService from "@/services/commentsService";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/feed/PostCard";
import "./PostDetail.css";

// Icons
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 10l6-6v4c10 0 14 8 14 14-2-4-6-6-14-6v4l-6-6z" />
  </svg>
);

const SolutionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

function Comment({ comment, postAuthorId, onReply, onToggleSolution, level = 0 }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const author = comment.user || {};
  const isPostAuthor = user?.id === postAuthorId;
  const isCommentAuthor = user?.id === author.id;
  const parentAuthor = comment.parent?.user?.username || comment.parent?.user?.name;

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;
    
    setSubmitting(true);
    await onReply(comment.id, replyContent.trim());
    setReplyContent("");
    setShowReplyInput(false);
    setSubmitting(false);
  };

  return (
    <div className={`comment ${level > 0 ? "comment--nested" : ""} ${comment.is_solution ? "comment--solution" : ""}`}>
      {/* Reply indicator - shows what this comment is responding to */}
      {level > 0 && parentAuthor && (
        <div className="comment__replying-to">
          <ReplyIcon />
          <span>{t("post.replying_to", { user: `@${parentAuthor}` })}</span>
        </div>
      )}
      
      {/* Solution badge */}
      {comment.is_solution && (
        <div className="comment__solution-badge">
          <SolutionIcon />
          <span>{t("post.accepted_answer")}</span>
        </div>
      )}

      <div className="comment__main">
        <Link to={`/profile/${author.username}`} className="comment__avatar">
          <img 
            src={author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`} 
            alt={author.name} 
          />
        </Link>
        
        <div className="comment__content">
          <div className="comment__header">
            <Link to={`/profile/${author.username}`} className="comment__author">
              <span className="comment__name">{author.name}</span>
              <span className="comment__username">@{author.username}</span>
            </Link>
            <span className="comment__time">{formatTime(comment.created_at)}</span>
          </div>
          
          <p className="comment__text">{comment.content}</p>
          
          <div className="comment__actions">
            {user && (
              <button 
                className="comment__action"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <ReplyIcon />
                <span>{t("post.reply")}</span>
              </button>
            )}
            
            {isPostAuthor && !isCommentAuthor && (
              <button 
                className={`comment__action comment__action--solution ${comment.is_solution ? "comment__action--active" : ""}`}
                onClick={() => onToggleSolution(comment.id)}
              >
                <SolutionIcon />
                <span>{comment.is_solution ? t("post.unmark_solution") : t("post.mark_solution")}</span>
              </button>
            )}
          </div>
          
          {showReplyInput && (
            <form className="comment__reply-form" onSubmit={handleSubmitReply}>
              <input
                type="text"
                className="comment__reply-input"
                placeholder={t("post.write_reply", { user: author.name })}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                autoFocus
              />
              <button 
                type="submit" 
                className="comment__reply-submit"
                disabled={!replyContent.trim() || submitting}
              >
                {submitting ? "..." : t("post.send")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment__replies">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={{ ...reply, parent: comment }}
              postAuthorId={postAuthorId}
              onReply={onReply}
              onToggleSolution={onToggleSolution}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { Helmet } from "react-helmet-async";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        postsService.getPost(id),
        commentsService.getComments(id)
      ]);
      setPost(postRes.data || postRes);
      setComments(commentsRes.data || commentsRes || []);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.message || "Error al cargar el post");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await commentsService.createComment({
        post_id: parseInt(id),
        content: newComment.trim(),
        parent_id: null
      });
      const newCommentData = res.data || res;
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const res = await commentsService.createComment({
        post_id: parseInt(id),
        content,
        parent_id: parentId
      });
      const newReply = res.data || res;
      
      // Add reply to the correct parent comment
      setComments((prev) => {
        const addReplyToComment = (comments) => {
          return comments.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply]
              };
            }
            if (c.replies) {
              return {
                ...c,
                replies: addReplyToComment(c.replies)
              };
            }
            return c;
          });
        };
        return addReplyToComment(prev);
      });
    } catch (err) {
      console.error("Error creating reply:", err);
    }
  };

  const handleToggleSolution = async (commentId) => {
    try {
      const res = await commentsService.toggleSolution(commentId);
      const { is_solution, is_solved } = res.data || res;
      
      // Update comment and post state
      setComments((prev) => {
        const updateSolution = (comments) => {
          return comments.map((c) => {
            const updated = { ...c, is_solution: c.id === commentId ? is_solution : false };
            if (c.replies) {
              updated.replies = updateSolution(c.replies);
            }
            return updated;
          });
        };
        return updateSolution(prev);
      });
      
      setPost((prev) => ({ ...prev, is_solved }));
    } catch (err) {
      console.error("Error toggling solution:", err);
    }
  };

  if (loading) {
    return (
      <div className="post-detail">
        <header className="post-detail__header">
          <button className="post-detail__back" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <h1 className="post-detail__title">{t("post.title")}</h1>
        </header>
        <div className="post-detail__loading">
          <div className="post-detail__spinner" />
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail">
        <header className="post-detail__header">
          <button className="post-detail__back" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <h1 className="post-detail__title">{t("post.title")}</h1>
        </header>
        <div className="post-detail__error">
          <p>{error || t("post.not_found")}</p>
          <button onClick={() => navigate(-1)}>{t("common.back")}</button>
        </div>
      </div>
    );
  }

  const postAuthorId = post.user?.id || post.author?.id;
  const postAuthorName = post.user?.name || post.author?.name || "Usuario";
  const postTitle = post.title || "Post en Codex";
  const postDescription = post.content ? post.content.substring(0, 150) + "..." : "Mira este proyecto en Codex.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": postTitle,
    "author": {
      "@type": "Person",
      "name": postAuthorName
    },
    "datePublished": post.created_at || new Date().toISOString(),
    "description": postDescription
  };

  return (
    <div className="post-detail">
      <Helmet>
        <title>{postTitle} | Codex</title>
        <meta name="description" content={postDescription} />
        <meta property="og:title" content={postTitle} />
        <meta property="og:description" content={postDescription} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <header className="post-detail__header">
        <button className="post-detail__back" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <h1 className="post-detail__title">{t("post.title")}</h1>
      </header>

      {/* Original Post */}
      <PostCard post={post} />

      {/* Comment Input */}
      {user ? (
        <form className="post-detail__comment-form" onSubmit={handleSubmitComment}>
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.name}
            className="post-detail__comment-avatar"
          />
          <input
            type="text"
            className="post-detail__comment-input"
            placeholder={t("post.write_comment")}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit" 
            className="post-detail__comment-submit"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? "..." : t("post.comment_btn")}
          </button>
        </form>
      ) : (
        <div className="post-detail__login-prompt" style={{ padding: "1.5rem", textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: "12px", margin: "1rem 0", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>{t("post.login_to_comment", "Inicia sesión para participar en la conversación")}</p>
          <button onClick={() => navigate("/welcome")} className="post-detail__comment-submit" style={{ cursor: "pointer", opacity: 1 }}>{t("auth.login", "Iniciar Sesión")}</button>
        </div>
      )}

      {/* Comments Section */}
      <div className="post-detail__comments">
        <h2 className="post-detail__comments-title">
          {t("post.comments")} ({comments.length})
        </h2>
        
        {comments.length === 0 ? (
          <div className="post-detail__no-comments">
            <p>{t("post.no_comments")}</p>
            <span>{t("post.be_first_comment")}</span>
          </div>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postAuthorId={postAuthorId}
              onReply={handleReply}
              onToggleSolution={handleToggleSolution}
            />
          ))
        )}
      </div>
    </div>
  );
}
