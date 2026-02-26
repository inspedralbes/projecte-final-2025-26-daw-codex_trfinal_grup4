/**
 * usePosts Hook
 * Fetches and manages posts state
 */
import { useState, useEffect, useCallback } from "react";
import postsService from "@/services/postsService";
import profileService from "@/services/profileService";
import commentsService from "@/services/commentsService";
import socketService from "@/services/socketService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for fetching posts (global feed, following feed, center feed, or user posts)
 * @param {Object} options
 * @param {string} options.feedType - "global" | "following" | "center" | "user"
 * @param {string} options.tag - Filter by tag
 * @param {string} options.type - Filter by post type (question|news)
 * @param {string} options.userId - User ID for user-specific posts
 * @param {string} options.centerId - Center ID for center-specific posts
 * @param {boolean} options.enabled - Whether to fetch (default: true)
 * @returns {Object} { posts, loading, error, hasMore, loadMore, refresh, createPost }
 */
export function usePosts({
  feedType = "global",
  tag = null,
  type = null,
  userId = null,
  centerId = null,
  enabled = true,
} = {}) {
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(
    async (pageNum = 1, append = false) => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let response;
        const params = { page: pageNum };
        if (tag) params.tag = tag;
        if (type) params.type = type;
        if (centerId) params.center_id = centerId;

        switch (feedType) {
          case "following":
            response = await postsService.getFollowingFeed(pageNum);
            break;
          case "center":
            response = await postsService.getCenterPosts(params);
            break;
          case "user":
            if (!userId) {
              setLoading(false);
              return;
            }
            response = await profileService.getUserPosts(userId, params);
            break;
          default:
            response = await postsService.getFeed(params);
        }

        const data = response.data || response;
        const newPosts = data.data || data;

        // Handle pagination metadata
        const meta = data.meta || {};
        const lastPage = meta.last_page || 1;
        setHasMore(pageNum < lastPage);

        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        setPage(pageNum);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Error al cargar publicaciones");
      } finally {
        setLoading(false);
      }
    },
    [feedType, tag, type, userId, centerId, enabled],
  );

  // Initial fetch
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!enabled) return;

    const handlePostDeleted = (data) => {
      setPosts((prev) => prev.filter((p) => p.id !== data.post_id));
    };

    const handleInteractionRemoved = (data) => {
      // Update counts and status in the list for any post
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === data.interactable_id && data.interactable_type === "Post") {
            const updates = {};
            if (data.type === "like") {
              updates.liked_by_users_count = Math.max(0, (p.liked_by_users_count || 0) - 1);
              if (data.userId === currentUser?.id) {
                updates.is_liked = false;
              }
            }
            if (data.type === "bookmark") {
              updates.bookmarked_by_users_count = Math.max(
                0,
                (p.bookmarked_by_users_count || 0) - 1,
              );
              if (data.userId === currentUser?.id) {
                updates.is_bookmarked = false;
              }
            }
            return { ...p, ...updates };
          }
          return p;
        }),
      );
    };

    const token = localStorage.getItem("token");
    socketService.connect(token);
    socketService.on("post.deleted", handlePostDeleted);
    socketService.on("comment.deleted", handlePostDeleted); // Re-use same handler as it fits data structure
    socketService.on("interaction.removed", handleInteractionRemoved);

    return () => {
      socketService.off("post.deleted", handlePostDeleted);
      socketService.off("comment.deleted", handlePostDeleted);
      socketService.off("interaction.removed", handleInteractionRemoved);
    };
  }, [enabled, currentUser?.id]);

  // Load more posts
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, true);
    }
  }, [loading, hasMore, page, fetchPosts]);

  // Refresh feed
  const refresh = useCallback(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Create a new post and add to feed
  const createPost = useCallback(async (postData) => {
    try {
      const response = await postsService.createPost(postData);
      const newPost = response.data || response;

      // Prepend new post to feed
      setPosts((prev) => [newPost, ...prev]);
      return { success: true, post: newPost };
    } catch (err) {
      console.error("Error creating post:", err);
      return { success: false, error: err.message };
    }
  }, []);

  // Delete a post
  const deletePost = useCallback(
    async (postId) => {
      try {
        const targetPost = posts.find((p) => p.id === postId);
        if (targetPost && targetPost.type === "reply") {
          await commentsService.deleteComment(postId);
        } else {
          await postsService.deletePost(postId);
        }
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return { success: true };
      } catch (err) {
        console.error("Error deleting post/comment:", err);
        return { success: false, error: err.message };
      }
    },
    [posts],
  );

  // Update post in list
  const updatePostInList = useCallback((postId, updates) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    createPost,
    deletePost,
    updatePostInList,
  };
}

export default usePosts;
