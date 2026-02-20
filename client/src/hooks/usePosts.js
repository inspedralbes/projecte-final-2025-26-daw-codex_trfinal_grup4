/**
 * usePosts Hook
 * Fetches and manages posts state
 */
import { useState, useEffect, useCallback } from "react";
import postsService from "@/services/postsService";
import profileService from "@/services/profileService";

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
  enabled = true 
} = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
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
  }, [feedType, tag, type, userId, centerId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

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
  const deletePost = useCallback(async (postId) => {
    try {
      await postsService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Update post in list
  const updatePostInList = useCallback((postId, updates) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
    );
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
