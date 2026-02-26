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
    <div className="feed__welcome-icon">👋</div>
    <h2 className="feed__welcome-title">{t("feed.welcome_title")}</h2>
    <p className="feed__welcome-text">{t("feed.welcome_text")}</p>
    <div className="feed__welcome-tips">
      <div className="feed__welcome-tip">
        <span className="feed__welcome-tip-icon">💻</span>
        <span>{t("feed.welcome_tip_code")}</span>
      </div>
      <div className="feed__welcome-tip">
        <span className="feed__welcome-tip-icon">❓</span>
        <span>{t("feed.welcome_tip_question")}</span>
      </div>
      <div className="feed__welcome-tip">
        <span className="feed__welcome-tip-icon">👥</span>
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

      {/* Post Input */}
      <PostInput onSubmit={handleCreatePost} />

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
