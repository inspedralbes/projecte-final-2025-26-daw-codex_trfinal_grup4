import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import socketService from "@/services/socketService";
import interactionsService from "@/services/interactionsService";
import profileService from "@/services/profileService";
import PostCard from "@/components/feed/PostCard";
import FollowListModal from "./FollowListModal";
import "./Profile.css";

// Loading spinner
const LoadingSpinner = () => (
  <div className="profile__spinner">
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  </div>
);

// ── Edit Profile Modal ───────────────────────────────────────
function EditProfileModal({ profile, onClose, onSave, onSaveWithAvatar }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: profile.name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    banner: profile.banner || "",
    linkedin_url: profile.linkedin_url || "",
    portfolio_url: profile.portfolio_url || "",
    external_url: profile.external_url || "",
  });
  const [previews, setPreviews] = useState({
    avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
    banner:
      profile.banner ||
      "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop",
  });
  const [files, setFiles] = useState({
    avatar: null,
    banner: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    setFiles((prev) => ({ ...prev, [name]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({ ...prev, [name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    if (form.linkedin_url) formData.append("linkedin_url", form.linkedin_url);
    if (form.portfolio_url) formData.append("portfolio_url", form.portfolio_url);
    if (form.external_url) formData.append("external_url", form.external_url);

    if (files.avatar) formData.append("avatar", files.avatar);
    if (files.banner) formData.append("banner", files.banner);

    const result = await onSaveWithAvatar(formData);
    setSaving(false);

    if (result.success) {
      if (result.usernameChanged && result.data?.username) {
        onClose();
        // The parent will handle redirect if needed, but we can return data
        onSave({ success: true, data: result.data, usernameChanged: true });
      } else {
        onClose();
      }
    } else {
      setError(result.error || t("profile.edit.error"));
    }
  };

  return (
    <div className="edit-modal__backdrop" onClick={handleBackdropClick}>
      <div className="edit-modal">
        <div className="edit-modal__header">
          <h2 className="edit-modal__title">{t("profile.edit.title")}</h2>
          <button className="edit-modal__close" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form className="edit-modal__form" onSubmit={handleSubmit}>
          <div className="edit-modal__banner-section">
            <div className="edit-modal__banner">
              <img src={previews.banner} alt="Banner" />
              <label className="edit-modal__banner-overlay">
                <input
                  type="file"
                  name="banner"
                  onChange={handleFileChange}
                  accept="image/*"
                  hidden
                />
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
            </div>
          </div>

          <div className="edit-modal__avatar-section">
            <div className="edit-modal__avatar">
              <img src={previews.avatar} alt="Avatar" />
              <label className="edit-modal__avatar-overlay">
                <input
                  type="file"
                  name="avatar"
                  onChange={handleFileChange}
                  accept="image/*"
                  hidden
                />
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
            </div>
          </div>

          <div className="edit-modal__grid">
            <div className="edit-modal__field">
              <label className="edit-modal__label">{t("landing.full_name")}</label>
              <input
                className="edit-modal__input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="edit-modal__field">
              <label className="edit-modal__label">{t("landing.username")}</label>
              <input
                className="edit-modal__input"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="edit-modal__field">
            <label className="edit-modal__label">{t("profile.bio")}</label>
            <textarea
              className="edit-modal__textarea"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="edit-modal__grid">
            <div className="edit-modal__field">
              <label className="edit-modal__label">LinkedIn</label>
              <input
                className="edit-modal__input"
                type="url"
                name="linkedin_url"
                value={form.linkedin_url}
                onChange={handleChange}
              />
            </div>
            <div className="edit-modal__field">
              <label className="edit-modal__label">
                {t("profile.links.portfolio") || "Portfolio"}
              </label>
              <input
                className="edit-modal__input"
                type="url"
                name="portfolio_url"
                value={form.portfolio_url}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="edit-modal__field">
            <label className="edit-modal__label">{t("profile.links.web")}</label>
            <input
              className="edit-modal__input"
              type="url"
              name="external_url"
              value={form.external_url}
              onChange={handleChange}
            />
          </div>

          {error && <p className="edit-modal__error">{error}</p>}

          <div className="edit-modal__actions">
            <button type="button" className="edit-modal__cancel" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="edit-modal__save" disabled={saving}>
              {saving ? t("common.processing") : t("profile.edit.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Profile Component ───────────────────────────────────
export default function Profile({ username }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("posts");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [followModal, setFollowModal] = useState({ open: false, type: "followers" });

  // Liked posts state
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedPostsLoading, setLikedPostsLoading] = useState(false);
  const [likedPostsLoaded, setLikedPostsLoaded] = useState(false);

  // Bookmarked posts state
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarkedPostsLoading, setBookmarkedPostsLoading] = useState(false);
  const [bookmarkedPostsLoaded, setBookmarkedPostsLoaded] = useState(false);

  // Replies state
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);

  // Stabilize target username
  const targetUsername = username || currentUser?.username;

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    isFollowing,
    toggleFollow,
    isOwnProfile,
    updateProfile,
    updateProfileWithAvatar,
  } = useProfile(targetUsername);

  const {
    posts,
    loading: postsLoading,
    hasMore,
    loadMore,
    deletePost,
  } = usePosts({
    feedType: "user",
    userId: profile?.username || profile?.id,
    enabled: !!profile,
  });

  // Fetch logic for tabs
  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (activeTab === "likes" && isOwnProfile && !likedPostsLoaded) {
        setLikedPostsLoading(true);
        try {
          const response = await interactionsService.getLikedPosts();
          const data = response.data || response;
          setLikedPosts(data.posts || data.data || data || []);
          setLikedPostsLoaded(true);
        } catch (err) {
          console.error("Error fetching likes:", err);
        } finally {
          setLikedPostsLoading(false);
        }
      }
    };
    fetchLikedPosts();
  }, [activeTab, isOwnProfile, likedPostsLoaded]);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      if (activeTab === "bookmarks" && isOwnProfile && !bookmarkedPostsLoaded) {
        setBookmarkedPostsLoading(true);
        try {
          const response = await interactionsService.getBookmarkedPosts();
          const data = response.data || response;
          setBookmarkedPosts(data.posts || data.data || data || []);
          setBookmarkedPostsLoaded(true);
        } catch (err) {
          console.error("Error fetching bookmarks:", err);
        } finally {
          setBookmarkedPostsLoading(false);
        }
      }
    };
    fetchBookmarkedPosts();
  }, [activeTab, isOwnProfile, bookmarkedPostsLoaded]);

  useEffect(() => {
    const fetchReplies = async () => {
      if (activeTab === "replies" && targetUsername && !repliesLoaded) {
        setRepliesLoading(true);
        try {
          const response = await profileService.getUserReplies(targetUsername);
          const data = response.data || response;
          setReplies(data.replies || data.data || data || []);
          setRepliesLoaded(true);
        } catch (err) {
          console.error("Error fetching replies:", err);
        } finally {
          setRepliesLoading(false);
        }
      }
    };
    fetchReplies();
  }, [activeTab, targetUsername, repliesLoaded]);

  // Real-time updates for domestic lists
  useEffect(() => {
    if (!profile?.id) return;

    // Listen for deletions to remove from local state
    const handlePostDeleted = (data) => {
      setLikedPosts((prev) => prev.filter((p) => p.id !== data.post_id));
      setBookmarkedPosts((prev) => prev.filter((p) => p.id !== data.post_id));
      setReplies((prev) => prev.filter((p) => p.id !== data.post_id && p.post_id !== data.post_id));
    };

    // Listen for interaction removals
    const handleInteractionRemoved = (data) => {
      if (data.userId === currentUser?.id) {
        if (data.type === "like" && data.interactable_type === "Post") {
          setLikedPosts((prev) => prev.filter((p) => p.id !== data.interactable_id));
        }
        if (data.type === "bookmark" && data.interactable_type === "Post") {
          setBookmarkedPosts((prev) => prev.filter((p) => p.id !== data.interactable_id));
        }
      }
    };

    // Listen for new interactions (to invalidate lists or update counts)
    const handleNewInteraction = (data) => {
      // If I liked/bookmarked something, I want the lists to refresh next time I visit the tab
      if (data.user?.id === currentUser?.id) {
        if (data.type === "like") setLikedPostsLoaded(false);
        if (data.type === "bookmark") setBookmarkedPostsLoaded(false);
      }
    };

    socketService.on("post.deleted", handlePostDeleted);
    socketService.on("comment.deleted", handlePostDeleted);
    socketService.on("interaction.removed", handleInteractionRemoved);
    socketService.on("new.interaction", handleNewInteraction);

    return () => {
      socketService.off("post.deleted", handlePostDeleted);
      socketService.off("comment.deleted", handlePostDeleted);
      socketService.off("interaction.removed", handleInteractionRemoved);
      socketService.off("new.interaction", handleNewInteraction);
    };
  }, [profile?.id, currentUser?.id]);

  const handleProfileSave = (result) => {
    if (result.success && result.usernameChanged) {
      navigate(`/profile/${result.data.username}`, { replace: true });
    }
  };

  // Display logic
  const getDisplayPosts = () => {
    if (activeTab === "likes") return likedPosts;
    if (activeTab === "bookmarks") return bookmarkedPosts;
    if (activeTab === "replies") return replies;
    if (activeTab === "questions") return posts.filter((p) => p.type === "question");
    return posts.filter((p) => p.type !== "question");
  };

  const displayPosts = getDisplayPosts();
  const isLoadingPosts =
    (activeTab === "likes" && likedPostsLoading) ||
    (activeTab === "bookmarks" && bookmarkedPostsLoading) ||
    (activeTab === "replies" && repliesLoading) ||
    ((activeTab === "posts" || activeTab === "questions") && postsLoading && posts.length === 0);

  if (profileLoading && !profile) {
    return (
      <div className="profile-guay profile-guay--loading">
        <div className="profile-guay__header profile-guay__header--skeleton">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile__error">
        <p>
          {t("profile.error")}: {profileError}
        </p>
      </div>
    );
  }

  if (!profile) return null;

  const user = profile;
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(i18next.language, {
        month: "long",
        year: "numeric",
      })
    : null;
  const roleName =
    user.role === "student"
      ? t("sidebar.student")
      : user.role === "teacher"
        ? t("sidebar.teacher")
        : t("common.user");

  return (
    <div className="profile-guay">
      {/* 1. Header Visual */}
      <header className="profile-guay__header">
        <div className="profile-guay__cover">
          {user.banner ? (
            <img src={user.banner} alt="Banner" className="profile-guay__banner-img" />
          ) : (
            <div className="profile-guay__cover-overlay" />
          )}
        </div>
        <div className="profile-guay__avatar-row">
          <div className="profile-guay__avatar-container">
            <div className="profile-guay__avatar-box">
              <img
                src={
                  user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                }
                alt={user.name}
              />
            </div>
          </div>
          <div className="profile-guay__actions-row">
            {isOwnProfile ? (
              <button
                className="profile-guay__btn profile-guay__btn--secondary"
                onClick={() => setEditModalOpen(true)}
              >
                {t("profile.edit.cta")}
              </button>
            ) : (
              <>
                <button
                  className="profile-guay__btn profile-guay__btn--message"
                  onClick={() => navigate(`/messages?user=${user.id}`)}
                  title={t("profile.sendMessage")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </button>
                <button
                  className={`profile-guay__btn ${isFollowing ? "profile-guay__btn--following" : "profile-guay__btn--primary"}`}
                  onClick={toggleFollow}
                >
                  {isFollowing ? t("profile.unfollow") : t("profile.follow")}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Identity Section */}
      <section className="profile-guay__info">
        <div className="profile-guay__identity">
          <div className="profile-guay__name-group">
            <h1 className="profile-guay__name">{user.name}</h1>
            <span className="profile-guay__role-badge">{roleName}</span>
          </div>
          <p className="profile-guay__username">@{user.username}</p>
        </div>

        {user.bio && <p className="profile-guay__bio">{user.bio}</p>}

        <div className="profile-guay__metadata">
          <div className="profile-guay__meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>
              {t("profile.joined")} {joinedDate}
            </span>
          </div>

          {user.center && (
            <div className="profile-guay__meta-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>{user.center.name || user.center}</span>
            </div>
          )}

          {user.linkedin_url && (
            <a
              href={user.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-guay__meta-item profile-guay__link"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span>LinkedIn</span>
            </a>
          )}

          {user.portfolio_url && (
            <a
              href={user.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-guay__meta-item profile-guay__link"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>{t("profile.links.portfolio") || "Portfolio"}</span>
            </a>
          )}

          {user.external_url && (
            <a
              href={user.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-guay__meta-item profile-guay__link"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{t("profile.links.web") || "Web"}</span>
            </a>
          )}
        </div>

        <div className="profile-guay__stats">
          <button
            className="profile-guay__stat-btn"
            onClick={() => setFollowModal({ open: true, type: "following" })}
          >
            <span className="profile-guay__stat-value">{user.following_count || 0}</span>
            <span className="profile-guay__stat-label">{t("feed.tabs.following")}</span>
          </button>
          <button
            className="profile-guay__stat-btn"
            onClick={() => setFollowModal({ open: true, type: "followers" })}
          >
            <span className="profile-guay__stat-value">{user.followers_count || 0}</span>
            <span className="profile-guay__stat-label">{t("profile.followers")}</span>
          </button>
          <div className="profile-guay__stat-btn no-click">
            <span className="profile-guay__stat-value">{user.posts_count || 0}</span>
            <span className="profile-guay__stat-label">{t("feed.posts_count")}</span>
          </div>
          <div className="profile-guay__stat-btn no-click">
            <span className="profile-guay__stat-value">
              {typeof user.reputation === "object"
                ? user.reputation?.score || 0
                : user.reputation || 0}
            </span>
            <span className="profile-guay__stat-label">{t("profile.points")}</span>
          </div>
        </div>
      </section>

      {/* 3. Feed Section */}
      <section className="profile-guay__content">
        <nav className="profile-guay__nav">
          <button
            className={`profile-guay__nav-btn ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            {t("sidebar.profile")}
          </button>
          <button
            className={`profile-guay__nav-btn ${activeTab === "replies" ? "active" : ""}`}
            onClick={() => setActiveTab("replies")}
          >
            {t("profile.replies")}
          </button>
          <button
            className={`profile-guay__nav-btn ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            {t("widgets.recent_questions")}
          </button>
          {isOwnProfile && (
            <>
              <button
                className={`profile-guay__nav-btn ${activeTab === "likes" ? "active" : ""}`}
                onClick={() => setActiveTab("likes")}
              >
                {t("profile.likes")}
              </button>
              <button
                className={`profile-guay__nav-btn ${activeTab === "bookmarks" ? "active" : ""}`}
                onClick={() => setActiveTab("bookmarks")}
              >
                {t("profile.bookmarks")}
              </button>
            </>
          )}
        </nav>

        <div className="profile-guay__feed">
          {isLoadingPosts ? (
            <div className="profile-guay__loading-feed">
              <LoadingSpinner />
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="profile-guay__empty-feed">
              <p>{t("profile.no_posts_category")}</p>
            </div>
          ) : (
            <>
              {displayPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={
                    isOwnProfile &&
                    (activeTab === "posts" || activeTab === "questions" || activeTab === "replies")
                      ? () => deletePost(post.id)
                      : undefined
                  }
                  className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
                />
              ))}
              {hasMore && (activeTab === "posts" || activeTab === "questions") && (
                <button
                  className="profile-guay__load-more"
                  onClick={loadMore}
                  disabled={postsLoading}
                >
                  {postsLoading ? t("common.loading") : t("common.load_more")}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modals */}
      {editModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onSave={handleProfileSave}
          onSaveWithAvatar={updateProfileWithAvatar}
        />
      )}
      {followModal.open && (
        <FollowListModal
          userId={profile.id}
          type={followModal.type}
          onClose={() => setFollowModal({ ...followModal, open: false })}
        />
      )}
    </div>
  );
}
