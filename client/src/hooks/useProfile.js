/**
 * useProfile Hook
 * Fetches user profile data
 */
import { useState, useEffect, useCallback } from "react";
import profileService from "@/services/profileService";
import followService from "@/services/followService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for fetching a user's profile
 * @param {string} username - Username to fetch
 * @returns {Object} Profile state and actions
 */
export function useProfile(username) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = currentUser && profile && (
    currentUser.username === profile.username || 
    currentUser.id === profile.id
  );

  const fetchProfile = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const response = await profileService.getProfile(username);
      const data = response.data || response;
      setProfile(data);
      setIsFollowing(data.is_following || false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Toggle follow
  const toggleFollow = useCallback(async () => {
    if (!profile) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setProfile((prev) => ({
      ...prev,
      followers_count: wasFollowing
        ? prev.followers_count - 1
        : prev.followers_count + 1,
    }));

    try {
      await followService.toggleFollowUser(profile.id);
    } catch (err) {
      // Revert on error
      console.error("Error toggling follow:", err);
      setIsFollowing(wasFollowing);
      setProfile((prev) => ({
        ...prev,
        followers_count: wasFollowing
          ? prev.followers_count + 1
          : prev.followers_count - 1,
      }));
    }
  }, [profile, isFollowing]);

  return {
    profile,
    loading,
    error,
    isFollowing,
    isOwnProfile,
    toggleFollow,
    refresh: fetchProfile,
  };
}

export default useProfile;
