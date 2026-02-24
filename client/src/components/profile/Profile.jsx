import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import interactionsService from "@/services/interactionsService";
import profileService from "@/services/profileService";
import PostCard from "@/components/feed/PostCard";
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
    bio: profile.bio || "",
    linkedin_url: profile.linkedin_url || "",
    portfolio_url: profile.portfolio_url || "",
    external_url: profile.external_url || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let result;

    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      if (form.linkedin_url) formData.append("linkedin_url", form.linkedin_url);
      if (form.portfolio_url) formData.append("portfolio_url", form.portfolio_url);
      if (form.external_url) formData.append("external_url", form.external_url);
      result = await onSaveWithAvatar(formData);
    } else {
      result = await onSave(form);
    }

    setSaving(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || t("profile.edit.error"));
    }
  };

  return (
    <div className="edit-modal__backdrop" onClick={handleBackdropClick}>
      <div className="edit-modal">
        <div className="edit-modal__header">
          <h2 className="edit-modal__title">{t("profile.edit.title")}</h2>
          <button className="edit-modal__close" onClick={onClose} aria-label={t("common.close")}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="edit-modal__form" onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="edit-modal__avatar-section">
            <div className="edit-modal__avatar" onClick={() => fileInputRef.current?.click()}>
              <img src={avatarPreview} alt={t("common.user")} />
              <div className="edit-modal__avatar-overlay">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="edit-modal__file-input"
            />
          </div>

          {/* Name */}
          <div className="edit-modal__field">
            <label className="edit-modal__label" htmlFor="edit-name">
              {t("landing.full_name")}
            </label>
            <input
              id="edit-name"
              className="edit-modal__input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength={255}
              required
            />
          </div>

          {/* Bio */}
          <div className="edit-modal__field">
            <label className="edit-modal__label" htmlFor="edit-bio">
              {t("profile.bio")}
            </label>
            <textarea
              id="edit-bio"
              className="edit-modal__textarea"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={1000}
              rows={3}
              placeholder={t("profile.edit.bio_placeholder")}
            />
            <span className="edit-modal__char-count">{form.bio.length}/1000</span>
          </div>

          {/* LinkedIn */}
          <div className="edit-modal__field">
            <label className="edit-modal__label" htmlFor="edit-linkedin">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </label>
            <input
              id="edit-linkedin"
              className="edit-modal__input"
              type="url"
              name="linkedin_url"
              value={form.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          {/* Portfolio */}
          <div className="edit-modal__field">
            <label className="edit-modal__label" htmlFor="edit-portfolio">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Portfolio
            </label>
            <input
              id="edit-portfolio"
              className="edit-modal__input"
              type="url"
              name="portfolio_url"
              value={form.portfolio_url}
              onChange={handleChange}
              placeholder="https://miportfolio.com"
            />
          </div>

          {/* External URL */}
          <div className="edit-modal__field">
            <label className="edit-modal__label" htmlFor="edit-external">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {t("profile.links.web")}
            </label>
            <input
              id="edit-external"
              className="edit-modal__input"
              type="url"
              name="external_url"
              value={form.external_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          {/* Error */}
          {error && <p className="edit-modal__error">{error}</p>}

          {/* Actions */}
          <div className="edit-modal__actions">
            <button
              type="button"
              className="edit-modal__cancel"
              onClick={onClose}
              disabled={saving}
            >
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
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  // Use profile hook for the target user (or current user if no username)
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

  // Fetch user's posts
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

  // Fetch liked posts when tab is selected
  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (activeTab === "likes" && isOwnProfile && !likedPostsLoaded) {
        setLikedPostsLoading(true);
        try {
          const response = await interactionsService.getLikedPosts();
          const data = response.data || response;
          setLikedPosts(data.data || data || []);
          setLikedPostsLoaded(true);
        } catch (err) {
          console.error("Error fetching liked posts:", err);
        } finally {
          setLikedPostsLoading(false);
        }
      }
    };
    fetchLikedPosts();
  }, [activeTab, isOwnProfile, likedPostsLoaded]);

  // Fetch bookmarked posts when tab is selected
  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      if (activeTab === "bookmarks" && isOwnProfile && !bookmarkedPostsLoaded) {
        setBookmarkedPostsLoading(true);
        try {
          const response = await interactionsService.getBookmarkedPosts();
          const data = response.data || response;
          setBookmarkedPosts(data.data || data || []);
          setBookmarkedPostsLoaded(true);
        } catch (err) {
          console.error("Error fetching bookmarked posts:", err);
        } finally {
          setBookmarkedPostsLoading(false);
        }
      }
    };
    fetchBookmarkedPosts();
  }, [activeTab, isOwnProfile, bookmarkedPostsLoaded]);

  // Fetch replies when tab is selected
  useEffect(() => {
    const fetchReplies = async () => {
      if (activeTab === "replies" && targetUsername && !repliesLoaded) {
        setRepliesLoading(true);
        try {
          const response = await profileService.getUserReplies(targetUsername);
          const data = response.data || response;
          setReplies(data.data || data || []);
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

  if (profileLoading) {
    return (
      <div className="profile">
        <div className="profile__loading">
          <LoadingSpinner />
          <p>{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile">
        <div className="profile__error">
          <p>
            {t("profile.error")}: {profileError}
          </p>
        </div>
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
        : user.role === "admin"
          ? t("sidebar.admin")
          : user.role || t("common.user");

  // Get posts based on active tab
  const getDisplayPosts = () => {
    if (activeTab === "likes") return likedPosts;
    if (activeTab === "bookmarks") return bookmarkedPosts;
    if (activeTab === "replies") return replies;
    if (activeTab === "questions") return posts.filter((post) => post.type === "question");
    return posts.filter((post) => post.type !== "question"); // posts tab
  };

  const displayPosts = getDisplayPosts();
  const isLoadingPosts = 
    (activeTab === "likes" && likedPostsLoading) ||
    (activeTab === "bookmarks" && bookmarkedPostsLoading) ||
    (activeTab === "replies" && repliesLoading) ||
    ((activeTab === "posts" || activeTab === "questions") && postsLoading && posts.length === 0);

  return (
    <div className="profile">
      {/* Cover band */}
      <div className="profile__cover" />

      {/* Main card */}
      <div className="profile__card">
        {/* Avatar */}
        <div className="profile__avatar">
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.name}`
            }
            alt={user.name}
          />
        </div>

        {/* Identity */}
        <h1 className="profile__name">{user.name}</h1>
        <p className="profile__username">@{user.username}</p>

        {/* Role pill */}
        <span className="profile__role">{roleName}</span>

        {/* Stats */}
        <div className="profile__stats">
          <div className="profile__stat">
            <span className="profile__stat-value">{user.posts_count || 0}</span>
            <span className="profile__stat-label">{t("feed.posts_count")}</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-value">{user.followers_count || 0}</span>
            <span className="profile__stat-label">{t("profile.followers")}</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-value">{user.following_count || 0}</span>
            <span className="profile__stat-label">{t("feed.tabs.following")}</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-value">
              {typeof user.reputation === "object"
                ? user.reputation?.score || 0
                : user.reputation || 0}
            </span>
            <span className="profile__stat-label">{t("profile.points")}</span>
          </div>
        </div>

        {/* Details */}
        <div className="profile__details">
          {user.bio && <p className="profile__bio">{user.bio}</p>}
          {user.center && (
            <div className="profile__detail">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>{user.center.name || user.center}</span>
            </div>
          )}
          {isOwnProfile && user.email && (
            <div className="profile__detail">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>{user.email}</span>
            </div>
          )}
          {/* Social links */}
          {(user.linkedin_url || user.portfolio_url || user.external_url) && (
            <div className="profile__links">
              {user.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile__link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {user.portfolio_url && (
                <a
                  href={user.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile__link"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Portfolio
                </a>
              )}
              {user.external_url && (
                <a
                  href={user.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile__link"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  {t("profile.links.web")}
                </a>
              )}
            </div>
          )}
          {joinedDate && (
            <div className="profile__detail">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {t("profile.joined")} {joinedDate}
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        {isOwnProfile ? (
          <button className="profile__edit-btn" onClick={() => setEditModalOpen(true)}>
            {t("profile.edit.cta")}
          </button>
        ) : (
          <button
            className={`profile__follow-btn ${isFollowing ? "profile__follow-btn--following" : ""}`}
            onClick={toggleFollow}
          >
            {isFollowing ? t("profile.unfollow") : t("profile.follow")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <nav className="profile__tabs">
        <button
          className={`profile__tab ${activeTab === "posts" ? "profile__tab--active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          {t("sidebar.profile")}
        </button>
        <button
          className={`profile__tab ${activeTab === "replies" ? "profile__tab--active" : ""}`}
          onClick={() => setActiveTab("replies")}
        >
          {t("profile.replies")}
        </button>
        <button
          className={`profile__tab ${activeTab === "questions" ? "profile__tab--active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          {t("widgets.recent_questions")}
        </button>
        {isOwnProfile && (
          <>
            <button
              className={`profile__tab ${activeTab === "likes" ? "profile__tab--active" : ""}`}
              onClick={() => setActiveTab("likes")}
            >
              {t("profile.likes")}
            </button>
            <button
              className={`profile__tab ${activeTab === "bookmarks" ? "profile__tab--active" : ""}`}
              onClick={() => setActiveTab("bookmarks")}
            >
              {t("profile.bookmarks")}
            </button>
          </>
        )}
      </nav>

      {/* Posts list */}
      <div className="profile__posts">
        {isLoadingPosts ? (
          <div className="profile__posts-loading">
            <LoadingSpinner />
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="profile__posts-empty">
            <p>{t("profile.no_posts_category")}</p>
          </div>
        ) : (
          <>
            {displayPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={isOwnProfile && (activeTab === "posts" || activeTab === "questions") ? () => deletePost(post.id) : undefined}
                className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
              />
            ))}
            {hasMore && (activeTab === "posts" || activeTab === "questions") && (
              <button className="profile__load-more" onClick={loadMore} disabled={postsLoading}>
                {postsLoading ? t("common.loading") : t("common.load_more")}
              </button>
            )}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onSave={updateProfile}
          onSaveWithAvatar={updateProfileWithAvatar}
        />
      )}
    </div>
  );
}
