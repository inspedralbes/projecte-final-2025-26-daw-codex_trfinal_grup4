import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import PostInput from "./PostInput";
import PostCard from "./PostCard";
import { usePosts } from "@/hooks/usePosts";
import "./Feed.css";

export default function Feed({ feedType = "global", centerMode = false }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  // Determine feed type based on active tab
  const currentFeedType =
    activeTab === "following" ? "following" : centerMode ? "center" : "global";
  const postType = activeTab === "questions" ? "question" : null;

  const { posts, loading, error, hasMore, loadMore, createPost, updatePostInList, deletePost } =
    usePosts({
      feedType: currentFeedType,
      type: postType,
    });

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

  return (
    <div className="feed">
      {/* Header */}
      <header className="feed__header">
        <h1 className="feed__title">{centerMode ? t("sidebar.center") : t("sidebar.home")}</h1>
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
          <div className="feed__loading">
            <div className="feed__spinner" />
            <span>{t("feed.loading_posts")}</span>
          </div>
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

            {/* Load More */}
            {hasMore && (
              <div className="feed__load-more">
                <button onClick={loadMore} disabled={loading} className="feed__load-more-btn">
                  {loading ? t("common.loading") : t("common.load_more")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
