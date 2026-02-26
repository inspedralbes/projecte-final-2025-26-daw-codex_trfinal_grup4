import React, { useState, useEffect } from 'react';
import PostCard from '@/components/feed/PostCard';
import PostInput from '@/components/feed/PostInput';
import { usePosts } from '@/hooks/usePosts';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/hooks/useAuth';
import centerService from '@/services/centerService';
import api from '@/services/api';
import TeacherVerificationModal from '@/components/auth/TeacherVerificationModal';
import './CenterHub.css';

// Icons
const UsersIcon = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LockIcon = () => (
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
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="center-hub__spinner">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  </div>
);

// Map tag colors based on tag name patterns
const getTagColor = (tagName) => {
  const name = tagName.toLowerCase();
  if (name.includes("anuncio") || name.includes("importante")) return "rose";
  if (name.includes("dam")) return "teal";
  if (name.includes("daw")) return "violet";
  if (name.includes("asix") || name.includes("smx")) return "amber";
  if (name.includes("fct") || name.includes("practicas")) return "emerald";
  if (name.includes("empleo") || name.includes("trabajo")) return "cyan";
  return "teal";
};

export default function CenterHub() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState("all");
  const [activeTab, setActiveTab] = useState("posts");
  const [centerInfo, setCenterInfo] = useState(null);
  const [loadingCenter, setLoadingCenter] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const centerId = user?.center_id;
  const isTeacher = user?.role === 'teacher';

  // Fetch posts for this center
  const {
    posts,
    loading: loadingPosts,
    error: postsError,
    hasMore,
    loadMore,
    createPost,
    deletePost
  } = usePosts({
    feedType: 'center',
    centerId,
    enabled: !!centerId
  });

  // Fetch center-specific tags
  const { tags: channels, loading: loadingTags } = useTags(centerId);

  // Fetch center info
  useEffect(() => {
    if (!centerId) {
      setLoadingCenter(false);
      return;
    }


    const fetchCenterInfo = async () => {
      try {
        setLoadingCenter(true);
        const response = await centerService.getCenter(centerId);
        setCenterInfo(response.data || response);
      } catch (err) {
        console.error("Error fetching center info:", err);
      } finally {
        setLoadingCenter(false);
      }
    };

    fetchCenterInfo();
  }, [centerId]);

  // Filter posts by active channel
  const filteredPosts = posts.filter(post => {
    if (activeChannel === 'all') return true;
    const postTags = post.tags || [];
    return postTags.some(tag => {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      return tagName.toLowerCase() === activeChannel.toLowerCase() ||
        `#${tagName}`.toLowerCase() === activeChannel.toLowerCase();
    });
  }).filter(post => {
    // Filter by tab
    if (activeTab === 'posts') return post.type !== 'question';
    if (activeTab === 'questions') return post.type === 'question';
    return true;
  });

  // Handle post creation
  const handleCreatePost = async (postData) => {
    await createPost({
      ...postData,
      center_id: centerId,
      visibility: "center",
    });
  };

  // Handle center request submission
  const handleCenterRequestSubmit = async (data) => {
    setRequestLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('center_name', data.center_name);
      formData.append('domain', data.domain);
      if (data.city) formData.append('city', data.city);
      formData.append('justificante', data.justificante);
      await api.upload('/center-requests', formData);
      setShowRequestModal(false);
      setRequestSuccess(true);
    } catch (err) {
      console.error('Error submitting center request:', err);
    } finally {
      setRequestLoading(false);
    }
  };

  // No center assigned
  if (!centerId) {
    return (
      <div className="center-hub">
        <div className="center-hub__no-center">
          <span className="center-hub__no-center-icon">🏫</span>
          {requestSuccess ? (
            <>
              <h2>✅ Solicitud enviada</h2>
              <p>Un administrador revisará tu solicitud y activará tu centro en breve.</p>
            </>
          ) : (
            <>
              <h2>{isTeacher ? 'Crea tu centro educativo' : 'No perteneces a ningún centro'}</h2>
              <p>
                {isTeacher
                  ? 'Como profesor, puedes solicitar crear el hub de tu centro en Codex.'
                  : 'Si eres docente o representante de un centro, puedes solicitar darlo de alta en Codex.'}
              </p>
              <button
                className="center-hub__request-btn"
                onClick={() => setShowRequestModal(true)}
              >
                Solicitar Centro
              </button>
            </>
          )}
        </div>
        {showRequestModal && (
          <TeacherVerificationModal
            email={user?.email}
            loading={requestLoading}
            onConfirm={handleCenterRequestSubmit}
            onCancel={() => setShowRequestModal(false)}
          />
        )}
      </div>
    );
  }

  // Loading state
  if (loadingCenter && !centerInfo) {
    return (
      <div className="center-hub">
        <div className="center-hub__loading">
          <LoadingSpinner />
          <p>{t("center.loading")}</p>
        </div>
      </div>
    );
  }

  // Center display values
  const centerName = centerInfo?.name || user?.center?.name || t("center.default_name");
  const centerLocation = centerInfo?.location || user?.center?.location || "";
  const memberCount = centerInfo?.member_count || centerInfo?.members_count || 0;
  const createdYear = centerInfo?.created_at ? new Date(centerInfo.created_at).getFullYear() : 2024;

  return (
    <div className="center-hub">
      {/* Banner */}
      <header className="center-hub__banner">
        <div className="center-hub__banner-overlay" />
        <div className="center-hub__banner-content">
          <div className="center-hub__school-badge">
            <span className="center-hub__school-icon">🎓</span>
          </div>
          <div className="center-hub__school-info">
            <div className="center-hub__school-header">
              <h1 className="center-hub__school-name">{centerName}</h1>
              <span className="center-hub__private-badge">
                <LockIcon />
                {t("center.private")}
              </span>
            </div>
            {centerLocation && <p className="center-hub__school-location">{centerLocation}</p>}
            <div className="center-hub__school-stats">
              <span>
                <UsersIcon /> {memberCount} {t("center.members")}
              </span>
              <span>
                <CalendarIcon /> {t("center.since")} {createdYear}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Channel Filters */}
      <div className="center-hub__channels">
        <button
          className={`center-hub__channel ${activeChannel === 'all' ? 'center-hub__channel--active' : ''}`}
          onClick={() => setActiveChannel('all')}
        >
          {t("notifications.filters.all")}
        </button>
        {channels.map((channel) => {
          const tagName = channel.name || channel.tag;
          const displayName = tagName.startsWith("#") ? tagName : `#${tagName}`;
          const postCount = channel.posts_count || channel.posts || 0;
          const color = getTagColor(displayName);

          return (
            <button
              key={channel.id || displayName}
              className={`center-hub__channel center-hub__channel--${color} ${activeChannel === displayName ? "center-hub__channel--active" : ""}`}
              onClick={() => setActiveChannel(displayName)}
            >
              {displayName}
              <span className="center-hub__channel-count">{postCount}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <nav className="center-hub__nav">
        <button
          className={`center-hub__nav-tab ${activeTab === 'posts' ? 'center-hub__nav-tab--active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          {t("sidebar.profile")}
        </button>
        <button
          className={`center-hub__nav-tab ${activeTab === 'questions' ? 'center-hub__nav-tab--active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          {t("widgets.recent_questions")}
        </button>
        <button
          className={`center-hub__nav-tab ${activeTab === 'resources' ? 'center-hub__nav-tab--active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          {t("center.resources")}
        </button>
        <button
          className={`center-hub__nav-tab ${activeTab === 'members' ? 'center-hub__nav-tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          {t("center.members_tab")}
        </button>
      </nav>

      {/* Post Input */}
      <PostInput onSubmit={handleCreatePost} />

      {/* Error State */}
      {postsError && (
        <div className="center-hub__error">
          <p>
            {t("feed.loading_error")}: {postsError}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loadingPosts && posts.length === 0 && (
        <div className="center-hub__loading">
          <LoadingSpinner />
          <p>{t("feed.loading_posts")}</p>
        </div>
      )}

      {/* Posts */}
      <div className="center-hub__posts">
        {filteredPosts.map((post, index) => (
          <div key={post.id} className="center-hub__post-wrapper">
            {post.pinned && (
              <div className="center-hub__pinned-badge">
                📌 Fijado
              </div>
            )}
            <PostCard
              post={post}
              onDelete={() => deletePost(post.id)}
              className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loadingPosts && filteredPosts.length === 0 && (
        <div className="center-hub__empty">
          <p>{t("profile.no_posts_category")}</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && posts.length > 0 && (
        <button
          className="center-hub__load-more"
          onClick={loadMore}
          disabled={loadingPosts}
        >
          {loadingPosts ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
