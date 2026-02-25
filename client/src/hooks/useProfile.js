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

    profileIdRef.current = profile.id;

    const token = localStorage.getItem("token");
    socketService.connect(token);
    socketService.joinProfileRoom(profile.id);

    const handleProfileUpdate = (data) => {
      // Use ref to check current profile ID
      if (data.user_id === profileIdRef.current) {
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            name: data.name ?? prev.name,
            username: data.username ?? prev.username,
            avatar: data.avatar ?? prev.avatar,
            banner: data.banner ?? prev.banner,
            bio: data.bio ?? prev.bio,
            linkedin_url: data.linkedin_url ?? prev.linkedin_url,
            portfolio_url: data.portfolio_url ?? prev.portfolio_url,
            external_url: data.external_url ?? prev.external_url,
            followers_count: data.followers_count ?? prev.followers_count,
            following_count: data.following_count ?? prev.following_count,
          };
        });
      }
    };

    const handlePostDeleted = (data) => {
      if (data.user_id === profileIdRef.current) {
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            posts_count: Math.max(0, (prev.posts_count || 0) - 1),
          };
        });
      }
    };

    socketService.onProfileUpdate(handleProfileUpdate);
    socketService.on("post.deleted", handlePostDeleted);

    return () => {
      if (profileIdRef.current) {
        socketService.leaveProfileRoom(profileIdRef.current);
      }
      socketService.off("profile.updated", handleProfileUpdate);
      socketService.off("post.deleted", handlePostDeleted);
    };
  }, [profile?.id]); // Re-run when profile ID changes

  // Toggle follow
  const toggleFollow = useCallback(async () => {
    if (!profile) return;

    // Optimistic update to UI for immediate feedback
    const wasFollowing = isFollowing;
    const prevFollowersCount = profile.followers_count;

    setIsFollowing(!wasFollowing);
    setProfile((prev) => ({
      ...prev,
      followers_count: wasFollowing ? prev.followers_count - 1 : prev.followers_count + 1,
    }));

    try {
      const response = await followService.toggleFollowUser(profile.id);
      const data = response.data?.data || response.data || response;

      // Update with exact data from server
      if (data.followers_count !== undefined) {
        setProfile((prev) => ({
          ...prev,
          followers_count: data.followers_count,
        }));
      }
      if (data.following !== undefined) {
        setIsFollowing(data.following);
      }

      // Also refresh current user to sync their "following" count if needed
      if (currentUser) refreshUser();
    } catch (err) {
      // Revert on error
      console.error("Error toggling follow:", err);
      setIsFollowing(wasFollowing);
      setProfile((prev) => ({
        ...prev,
        followers_count: prevFollowersCount,
      }));
    }
  }, [profile, isFollowing, currentUser, refreshUser]);

  // Update profile (for edit modal)
  const updateProfile = useCallback(
    async (data) => {
      try {
        const response = await profileService.updateProfile(data);
        const updatedUser = response.data || response;

        // If username changed, don't fetch with old username
        // The caller (Profile.jsx) will handle navigation
        if (updatedUser.username !== profile?.username) {
          if (isOwnProfile) await refreshUser();
          return { success: true, data: updatedUser, usernameChanged: true };
        }

        // Refresh local profile
        await fetchProfile();
        // Sync global auth state
        if (isOwnProfile) await refreshUser();
        return { success: true, data: updatedUser };
      } catch (err) {
        console.error("Error updating profile:", err);
        return { success: false, error: err.message || "Error al actualizar perfil" };
      }
    },
    [fetchProfile, isOwnProfile, refreshUser, profile?.username],
  );

  // Update profile with avatar
  const updateProfileWithAvatar = useCallback(
    async (formData) => {
      try {
        const response = await profileService.updateProfileWithAvatar(formData);
        const updatedUser = response.data || response;

        // If username changed, handle transitions
        if (updatedUser.username !== profile?.username) {
          if (isOwnProfile) await refreshUser();
          return { success: true, data: updatedUser, usernameChanged: true };
        }

        // Refresh local profile
        await fetchProfile();
        // Sync global auth state
        if (isOwnProfile) await refreshUser();
        return { success: true, data: updatedUser };
      } catch (err) {
        console.error("Error updating profile with avatar:", err);
        return { success: false, error: err.message || "Error al actualizar perfil" };
      }
    },
    [fetchProfile, isOwnProfile, refreshUser, profile?.username],
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
