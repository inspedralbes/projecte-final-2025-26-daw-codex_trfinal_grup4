/**
 * useInteractions Hook
 * Handles likes and bookmarks on posts
 */
import { useState, useCallback } from "react";
import interactionsService from "@/services/interactionsService";

/**
 * Hook for managing interactions on a post
 * @param {Object} initialState
 * @param {number} initialState.postId - Post ID
 * @param {number} initialState.likesCount - Initial likes count
 * @param {number} initialState.bookmarksCount - Initial bookmarks count
 * @param {boolean} initialState.userLiked - Whether user has liked
 * @param {boolean} initialState.userBookmarked - Whether user has bookmarked
 * @returns {Object} Interaction state and actions
 */
export function useInteractions({
  postId,
  likesCount: initialLikes = 0,
  bookmarksCount: initialBookmarks = 0,
  userLiked = false,
  userBookmarked = false,
}) {
  const [liked, setLiked] = useState(userLiked);
  const [bookmarked, setBookmarked] = useState(userBookmarked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [bookmarksCount, setBookmarksCount] = useState(initialBookmarks);
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (loading) return;
    
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      setLoading(true);
      await interactionsService.likePost(postId);
    } catch (err) {
      // Revert on error
      console.error("Error toggling like:", err);
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  }, [postId, liked, loading]);

  const toggleBookmark = useCallback(async () => {
    if (loading) return;
    
    // Optimistic update
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);
    setBookmarksCount((prev) => (wasBookmarked ? prev - 1 : prev + 1));

    try {
      setLoading(true);
      await interactionsService.bookmarkPost(postId);
    } catch (err) {
      // Revert on error
      console.error("Error toggling bookmark:", err);
      setBookmarked(wasBookmarked);
      setBookmarksCount((prev) => (wasBookmarked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  }, [postId, bookmarked, loading]);

  return {
    liked,
    bookmarked,
    likesCount,
    bookmarksCount,
    toggleLike,
    toggleBookmark,
    loading,
  };
}

export default useInteractions;
