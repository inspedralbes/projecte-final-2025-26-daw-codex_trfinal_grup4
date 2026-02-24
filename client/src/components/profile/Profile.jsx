import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
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
// (Keep EditProfileModal logic identical but update styling if needed in CSS)
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

    // We use updateProfileWithAvatar because it handles multipart/form-data
    const result = await onSaveWithAvatar(formData);
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error || t("profile.edit.error"));
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
              <img src={previews.banner} alt="Banner preview" />
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
              <img src={previews.avatar} alt={t("common.user")} />
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

          {/* Social & Links Restoration */}
          <div className="edit-modal__grid">
            <div className="edit-modal__field">
              <label className="edit-modal__label">LinkedIn</label>
              <input
                className="edit-modal__input"
                type="url"
                name="linkedin_url"
                value={form.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
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
                placeholder="https://..."
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
              placeholder="https://su-web.com"
            />
          </div>

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
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Stabilize target username to avoid flickering redirects
  // If username prop is present, use it. Otherwise use currentUser's username.
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

  // Additional state for tabs
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedPostsLoading, setLikedPostsLoading] = useState(false);
  const [likedPostsLoaded, setLikedPostsLoaded] = useState(false);

  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarkedPostsLoading, setBookmarkedPostsLoading] = useState(false);
  const [bookmarkedPostsLoaded, setBookmarkedPostsLoaded] = useState(false);

  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);

  // Follow Modal State
  const [followModal, setFollowModal] = useState({ open: false, type: "following" });

  // Fetch liked posts when tab is selected
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
          setBookmarkedPosts(data.posts || data.data || data || []);
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

  if (profileLoading && !profile)
    return (
      <div className="profile-guay profile-guay--loading">
        <div className="profile-guay__header profile-guay__header--skeleton">
          <LoadingSpinner />
        </div>
      </div>
    );
  if (profileError)
    return (
      <div className="profile__error">
        <p>
          {t("profile.error")}: {profileError}
        </p>
      </div>
    );
  if (!profile && !profileLoading) return null;

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

  // Determine which posts to display and which loading state to use
  let displayPosts = [];
  let isLoadingPosts = false;

  if (activeTab === "posts") {
    displayPosts = posts.filter((p) => p.type !== "question");
    isLoadingPosts = postsLoading;
  } else if (activeTab === "questions") {
    displayPosts = posts.filter((p) => p.type === "question");
    isLoadingPosts = postsLoading;
  } else if (activeTab === "likes") {
    displayPosts = likedPosts;
    isLoadingPosts = likedPostsLoading;
  } else if (activeTab === "bookmarks") {
    displayPosts = bookmarkedPosts;
    isLoadingPosts = bookmarkedPostsLoading;
  } else if (activeTab === "replies") {
    displayPosts = replies;
    isLoadingPosts = repliesLoading;
  }

  return (
    <div className="profile-guay">
      {/* 1. Header Visual: Cover + Avatar + Basic Stats overlay */}
      <header className="profile-guay__header">
        <div className="profile-guay__cover">
          {user.banner ? (
            <img
              src={user.banner}
              alt="Profile banner"
              className="profile-guay__banner-img"
              loading="lazy"
            />
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
                loading="lazy"
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
              <button
                className={`profile-guay__btn ${isFollowing ? "profile-guay__btn--following" : "profile-guay__btn--primary"}`}
                onClick={toggleFollow}
              >
                {isFollowing ? t("profile.unfollow") : t("profile.follow")}
              </button>
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
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
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
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>{t("profile.links.web")}</span>
            </a>
          )}
        </div>

        {/* Interactive Stats Panel */}
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
                onDelete={
                  isOwnProfile && (activeTab === "posts" || activeTab === "questions")
                    ? () => deletePost(post.id)
                    : undefined
                }
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

      {/* Modals */}
      {editModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onSave={updateProfile}
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
