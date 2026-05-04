import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import PostInput from "./PostInput";
import PostCard from "./PostCard";
import { usePosts } from "@/hooks/usePosts";
import "./Feed.css";

// Skeleton loader component
const PostSkeleton = () => (
  <div className="post-skeleton">
    <div className="post-skeleton__avatar" />
    <div className="post-skeleton__content">
      <div className="post-skeleton__header">
        <div className="post-skeleton__name" />
        <div className="post-skeleton__handle" />
      </div>
      <div className="post-skeleton__text-line post-skeleton__text-line--full" />
      <div className="post-skeleton__text-line post-skeleton__text-line--3-4" />
      <div className="post-skeleton__text-line post-skeleton__text-line--half" />
      <div className="post-skeleton__actions">
        <div className="post-skeleton__action" />
        <div className="post-skeleton__action" />
        <div className="post-skeleton__action" />
        <div className="post-skeleton__action" />
      </div>
    </div>
  </div>
);

// Welcome card for new/empty feeds
const WelcomeCard = ({ t }) => (
  <div className="feed__welcome">
    <div className="feed__welcome-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
    </div>
    <h2 className="feed__welcome-title">{t("feed.welcome_title")}</h2>
    <p className="feed__welcome-text">{t("feed.welcome_text")}</p>
    <div className="feed__welcome-tips">
      <div className="feed__welcome-tip">
        <span className="feed__welcome-tip-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </span>
        <span>{t("feed.welcome_tip_code")}</span>
      </div>
      <div className="feed__welcome-tip">
        <span className="feed__welcome-tip-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <span>{t("feed.welcome_tip_question")}</span>
      </div>
      <div className="feed__welcome-tip">
        <span className="feed__welcome-tip-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </span>
        <span>{t("feed.welcome_tip_follow")}</span>
      </div>
    </div>
  </div>
);

export default function Feed({ feedType = "global", centerMode = false }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const sentinelRef = useRef(null);

  // Determine feed type based on active tab
  const currentFeedType =
    activeTab === "following" ? "following" : centerMode ? "center" : "global";
  const postType = activeTab === "questions" ? "question" : null;

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [postMode, setPostMode] = useState("text");

  const openModal = (mode) => {
    setPostMode(mode);
    setIsFabMenuOpen(false);
    setIsPostModalOpen(true);
  };

  const { posts, loading, error, hasMore, loadMore, createPost, updatePostInList, deletePost } =
    usePosts({
      feedType: currentFeedType,
      type: postType,
    });

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const handleCreatePost = useCallback(
    async (postData) => {
      const result = await createPost(postData);
      if (result.success) {
        setIsPostModalOpen(false);
      }
      return result;
    },
    [createPost],
  );

  const handleInteractionUpdate = useCallback(
    (postId, updates) => {
      updatePostInList(postId, updates);
    },
    [updatePostInList],
  );

  const handleDeletePost = useCallback(
    async (postId) => {
      return await deletePost(postId);
    },
    [deletePost],
  );

  const isNewUser = user && posts.length === 0 && !loading;

  return (
    <div className="feed">
      {/* Header */}
      <header className="feed__header">
        <nav className="feed__tabs">
          <button
            className={`feed__tab ${activeTab === "all" ? "feed__tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            {t("feed.tabs.for_you")}
          </button>
          {!centerMode && (
            <button
              className={`feed__tab ${activeTab === "following" ? "feed__tab--active" : ""}`}
              onClick={() => setActiveTab("following")}
            >
              {t("feed.tabs.following")}
            </button>
          )}
          <button
            className={`feed__tab ${activeTab === "questions" ? "feed__tab--active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            {t("widgets.recent_questions")}
          </button>
        </nav>
      </header>

      {/* Floating Action Button (Speed Dial) */}
      {isFabMenuOpen && <div className="feed__fab-backdrop" onClick={() => setIsFabMenuOpen(false)} />}
      <div className={`feed__fab-wrapper ${isFabMenuOpen ? "feed__fab-wrapper--open" : ""}`}>
        {isFabMenuOpen && (
          <div className="feed__fab-menu">
            <button className="feed__fab-item" onClick={() => openModal("question")}>
              <span className="feed__fab-label">Duda</span>
              <div className="feed__fab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </button>
            <button className="feed__fab-item" onClick={() => openModal("code")}>
              <span className="feed__fab-label">Código</span>
              <div className="feed__fab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
            </button>
            <button className="feed__fab-item" onClick={() => openModal("image")}>
              <span className="feed__fab-label">Imagen</span>
              <div className="feed__fab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </button>
            <button className="feed__fab-item" onClick={() => openModal("text")}>
              <span className="feed__fab-label">Post</span>
              <div className="feed__fab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
              </div>
            </button>
          </div>
        )}
        <button 
          className="feed__fab" 
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          title={t("feed.publish", "Publicar")}
        >
          {isFabMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          )}
        </button>
      </div>

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="post-modal__backdrop" onClick={() => setIsPostModalOpen(false)}>
          <div className="post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="post-modal__header">
              <h2 className="post-modal__title">{t("feed.publish", "Crear Publicación")}</h2>
              <button className="post-modal__close" onClick={() => setIsPostModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <PostInput key={postMode} onSubmit={handleCreatePost} forceQuestion={activeTab === "questions"} initialMode={postMode} />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="feed__error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>{t("common.retry")}</button>
        </div>
      )}

      {/* Posts */}
      <div className="feed__posts">
        {loading && posts.length === 0 ? (
          // Skeleton loaders instead of spinner
          <div className="feed__skeletons">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : isNewUser ? (
          // Welcome card for new users
          <WelcomeCard t={t} />
        ) : posts.length === 0 ? (
          <div className="feed__empty">
            <p>{t("feed.no_posts")}</p>
            <span>{t("feed.be_first")}</span>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
                onInteractionUpdate={handleInteractionUpdate}
                onDelete={handleDeletePost}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="feed__sentinel">
              {loading && hasMore && (
                <div className="feed__loading-more">
                  <div className="feed__spinner" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
