/**
 * useTags Hook
 * Fetches and manages tags
 */
import { useState, useEffect, useCallback } from "react";
import tagsService from "@/services/tagsService";
import followService from "@/services/followService";

/**
 * Hook for fetching tags
 * @param {string} type - "global" or "center"
 * @returns {Object} Tags state and actions
 */
export function useTags(type = "global") {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = type === "center"
        ? await tagsService.getCenterTags()
        : await tagsService.getTags();
      
      const data = response.data || response;
      setTags(data.tags || data || []);
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError(err.message || "Error al cargar etiquetas");
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Initial fetch
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Toggle follow on a tag
  const toggleFollow = useCallback(async (tagId) => {
    try {
      const response = await followService.toggleFollowTag(tagId);
      const data = response.data || response;
      
      setTags((prev) =>
        prev.map((t) =>
          t.id === tagId ? { ...t, is_following: data.following } : t
        )
      );
      
      return { success: true, following: data.following };
    } catch (err) {
      console.error("Error toggling tag follow:", err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    tags,
    loading,
    error,
    refresh: fetchTags,
    toggleFollow,
  };
}

export default useTags;
