/**
 * useComments Hook
 * Fetches and manages comments for a post
 */
import { useState, useEffect, useCallback } from "react";
import commentsService from "@/services/commentsService";

/**
 * Hook for managing comments on a post
 * @param {number} postId - Post ID
 * @returns {Object} Comments state and actions
 */
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await commentsService.getComments(postId);
      const data = response.data || response;
      setComments(data.comments || data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message || "Error al cargar comentarios");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add a new comment
  const addComment = useCallback(async (content, parentId = null) => {
    try {
      const response = await commentsService.createComment({
        post_id: postId,
        parent_id: parentId,
        content,
      });
      
      const newComment = response.data || response;
      
      if (parentId) {
        // Add as a reply to parent
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            return c;
          })
        );
      } else {
        // Add as top-level comment
        setComments((prev) => [...prev, newComment]);
      }
      
      return { success: true, comment: newComment };
    } catch (err) {
      console.error("Error adding comment:", err);
      return { success: false, error: err.message };
    }
  }, [postId]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId, parentId = null) => {
    try {
      await commentsService.deleteComment(commentId);
      
      if (parentId) {
        // Remove from parent's replies
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).filter((r) => r.id !== commentId),
              };
            }
            return c;
          })
        );
      } else {
        // Remove top-level comment
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error deleting comment:", err);
      return { success: false, error: err.message };
    }
  }, []);

  // Mark a comment as solution
  const toggleSolution = useCallback(async (commentId) => {
    try {
      const response = await commentsService.toggleSolution(commentId);
      const result = response.data || response;
      
      // Update comments to reflect solution status
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          is_solution: c.id === commentId ? result.is_solution : false,
          replies: (c.replies || []).map((r) => ({
            ...r,
            is_solution: r.id === commentId ? result.is_solution : false,
          })),
        }))
      );
      
      return { success: true, ...result };
    } catch (err) {
      console.error("Error toggling solution:", err);
      return { success: false, error: err.message };
    }
  }, []);

  // Add comment from real-time event
  const addCommentRealtime = useCallback((comment) => {
    if (comment.parent_id) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === comment.parent_id) {
            // Avoid duplicates
            const exists = (c.replies || []).some((r) => r.id === comment.id);
            if (exists) return c;
            return {
              ...c,
              replies: [...(c.replies || []), comment],
            };
          }
          return c;
        })
      );
    } else {
      setComments((prev) => {
        const exists = prev.some((c) => c.id === comment.id);
        if (exists) return prev;
        return [...prev, comment];
      });
    }
  }, []);

  return {
    comments,
    loading,
    error,
    refresh: fetchComments,
    addComment,
    deleteComment,
    toggleSolution,
    addCommentRealtime,
    totalComments: comments.reduce(
      (acc, c) => acc + 1 + (c.replies?.length || 0),
      0
    ),
  };
}

export default useComments;
