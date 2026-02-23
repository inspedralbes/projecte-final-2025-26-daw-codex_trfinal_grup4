/**
 * useProfile Hook
 * Fetches user profile data with real-time socket updates
 */
import { useState, useEffect, useCallback, useRef } from "react";
import profileService from "@/services/profileService";
import followService from "@/services/followService";
import socketService from "@/services/socketService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for fetching a user's profile with real-time updates
 * @param {string} username - Username to fetch
 * @returns {Object} Profile state and actions
 */
export function useProfile(username) {
  const { user: currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const profileIdRef = useRef(null);

  // Determine if viewing own profile
  const isOwnProfile =
    currentUser &&
    profile &&
    (currentUser.username === profile.username || currentUser.id === profile.id);

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

      // Flatten stats from nested object to top-level for easy access
      const flatProfile = {
        ...data,
        posts_count: data.stats?.posts_count ?? data.posts_count ?? 0,
        comments_count: data.stats?.comments_count ?? data.comments_count ?? 0,
        followers_count: data.stats?.followers_count ?? data.followers_count ?? 0,
        following_count: data.stats?.following_count ?? data.following_count ?? 0,
        total_likes_received: data.stats?.total_likes_received ?? data.total_likes_received ?? 0,
      };

      setProfile(flatProfile);
      setIsFollowing(data.is_following || false);
      profileIdRef.current = data.id;
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

  // ── Real-time socket updates ────────────────────────────────
  useEffect(() => {
    if (!profile?.id) return;

    const token = localStorage.getItem("token");
    socketService.connect(token);
    socketService.joinProfileRoom(profile.id);

    const handleProfileUpdate = (data) => {
      if (data.user_id === profile.id) {
        setProfile((prev) => ({
          ...prev,
          name: data.name ?? prev.name,
          avatar: data.avatar ?? prev.avatar,
          bio: data.bio ?? prev.bio,
          followers_count: data.followers_count ?? prev.followers_count,
          following_count: data.following_count ?? prev.following_count,
        }));

        // If it's the own profile, also refresh the global auth state to sync Sidebar etc.
        if (isOwnProfile) {
          refreshUser();
        }
      }
    };

    socketService.onProfileUpdate(handleProfileUpdate);

    return () => {
      socketService.leaveProfileRoom(profile.id);
      socketService.off("profile.updated", handleProfileUpdate);
    };
  }, [profile?.id, isOwnProfile, refreshUser]);

  // Toggle follow
  const toggleFollow = useCallback(async () => {
    if (!profile) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setProfile((prev) => ({
      ...prev,
      followers_count: wasFollowing ? prev.followers_count - 1 : prev.followers_count + 1,
    }));

    try {
      await followService.toggleFollowUser(profile.id);
    } catch (err) {
      // Revert on error
      console.error("Error toggling follow:", err);
      setIsFollowing(wasFollowing);
      setProfile((prev) => ({
        ...prev,
        followers_count: wasFollowing ? prev.followers_count + 1 : prev.followers_count - 1,
      }));
    }
  }, [profile, isFollowing]);

  // Update profile (for edit modal)
  const updateProfile = useCallback(
    async (data) => {
      try {
        const response = await profileService.updateProfile(data);
        // Refresh local profile
        await fetchProfile();
        // Sync global auth state
        if (isOwnProfile) await refreshUser();
        return { success: true, data: response.data || response };
      } catch (err) {
        console.error("Error updating profile:", err);
        return { success: false, error: err.message || "Error al actualizar perfil" };
      }
    },
    [fetchProfile, isOwnProfile, refreshUser],
  );

  // Update profile with avatar
  const updateProfileWithAvatar = useCallback(
    async (formData) => {
      try {
        const response = await profileService.updateProfileWithAvatar(formData);
        // Refresh local profile
        await fetchProfile();
        // Sync global auth state
        if (isOwnProfile) await refreshUser();
        return { success: true, data: response.data || response };
      } catch (err) {
        console.error("Error updating profile with avatar:", err);
        return { success: false, error: err.message || "Error al actualizar perfil" };
      }
    },
    [fetchProfile, isOwnProfile, refreshUser],
  );

  return {
    profile,
    loading,
    error,
    isFollowing,
    isOwnProfile,
    toggleFollow,
    updateProfile,
    updateProfileWithAvatar,
    refresh: fetchProfile,
  };
}

export default useProfile;
