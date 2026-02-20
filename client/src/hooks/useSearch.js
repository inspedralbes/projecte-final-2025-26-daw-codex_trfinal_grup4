/**
 * useSearch Hook
 * Handles search functionality
 */
import { useState, useCallback } from "react";
import searchService from "@/services/searchService";

/**
 * Hook for searching
 * @returns {Object} Search state and actions
 */
export function useSearch() {
  const [results, setResults] = useState({ posts: [], users: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const search = useCallback(async (searchQuery, type = null) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults({ posts: [], users: [], tags: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuery(searchQuery);

      const response = await searchService.search(searchQuery, type);
      const data = response.data || response;
      
      setResults({
        posts: data.posts || [],
        users: data.users || [],
        tags: data.tags || [],
      });
    } catch (err) {
      console.error("Error searching:", err);
      setError(err.message || "Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCenter = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults({ posts: [], members: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuery(searchQuery);

      const response = await searchService.searchCenter(searchQuery);
      const data = response.data || response;
      
      setResults({
        posts: data.posts || [],
        members: data.members || [],
      });
    } catch (err) {
      console.error("Error searching center:", err);
      setError(err.message || "Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults({ posts: [], users: [], tags: [] });
    setQuery("");
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    query,
    search,
    searchCenter,
    clearResults,
  };
}

export default useSearch;
