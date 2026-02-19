import React, { useState } from 'react';
import './PostCard.css';

// Icons
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const RepostIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const QuestionBadge = ({ solved }) => (
  <span className={`post-card__question-badge ${solved ? 'post-card__question-badge--solved' : ''}`}>
    {solved ? '✓ Resuelto' : '? Duda técnica'}
  </span>
);

export default function PostCard({ post, className = '' }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.stats.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  return (
    <article className={`post-card ${className}`}>
      <div className="post-card__avatar">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.avatar}`}
          alt={post.author.name}
        />
      </div>

      <div className="post-card__content">
        {/* Header */}
        <header className="post-card__header">
          <div className="post-card__author">
            <span className="post-card__name">
              {post.author.name}
              {post.author.verified && <VerifiedIcon />}
            </span>
            <span className="post-card__handle">{post.author.handle}</span>
            {post.author.badge && (
              <span className="post-card__badge">{post.author.badge}</span>
            )}
            <span className="post-card__dot">·</span>
            <span className="post-card__time">{post.timestamp}</span>
          </div>
          <button className="post-card__more">
            <MoreIcon />
          </button>
        </header>

        {/* Question Badge */}
        {post.type === 'question' && (
          <QuestionBadge solved={post.solved} />
        )}

        {/* Text Content */}
        <p className="post-card__text">{post.content}</p>

        {/* Code Block */}
        {post.code && (
          <div className="post-card__code">
            <div className="post-card__code-header">
              <div className="post-card__code-dots">
                <span /><span /><span />
              </div>
              <span className="post-card__code-lang">{post.language}</span>
            </div>
            <pre className="post-card__code-content">
              <code>{post.code}</code>
            </pre>
          </div>
        )}

        {/* Link Preview */}
        {post.link && (
          <a href={post.link.url} className="post-card__link" target="_blank" rel="noopener noreferrer">
            <div className="post-card__link-image">
              <div className="post-card__link-icon">🔗</div>
            </div>
            <div className="post-card__link-content">
              <span className="post-card__link-title">{post.link.title}</span>
              <span className="post-card__link-desc">{post.link.description}</span>
              <span className="post-card__link-url">{new URL(post.link.url).hostname}</span>
            </div>
          </a>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-card__tags">
            {post.tags.map(tag => (
              <a key={tag} href="#" className="post-card__tag">{tag}</a>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="post-card__actions">
          <button className="post-card__action">
            <CommentIcon />
            <span>{formatNumber(post.stats.comments)}</span>
          </button>
          <button className="post-card__action post-card__action--repost">
            <RepostIcon />
            <span>{formatNumber(post.stats.reposts)}</span>
          </button>
          <button 
            className={`post-card__action post-card__action--like ${liked ? 'post-card__action--liked' : ''}`}
            onClick={handleLike}
          >
            <HeartIcon filled={liked} />
            <span>{formatNumber(likesCount)}</span>
          </button>
          <button 
            className={`post-card__action ${bookmarked ? 'post-card__action--bookmarked' : ''}`}
            onClick={() => setBookmarked(!bookmarked)}
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