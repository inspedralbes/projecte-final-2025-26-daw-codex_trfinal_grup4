import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PostCard from "@/components/feed/PostCard";
import PostInput from "@/components/feed/PostInput";
import TeacherVerificationModal from "@/components/auth/TeacherVerificationModal";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";
import centerService from "@/services/centerService";
import api from "@/services/api";
import "./CenterHub.css";

// Icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

// Role badge component
const RoleBadge = ({ role }) => {
  const roleConfig = {
    teacher: { label: "Profesor", color: "violet", icon: <ShieldIcon /> },
    student: { label: "Estudiante", color: "teal", icon: null },
    admin: { label: "Admin", color: "rose", icon: <ShieldIcon /> },
  };
  const config = roleConfig[role] || roleConfig.student;
  
  return (
    <span className={`center-hub__role-badge center-hub__role-badge--${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// Member card component
const MemberCard = ({ member, isTeacher, onRoleChange, onBlock, onUnblock }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`center-hub__member-card ${member.is_blocked ? "center-hub__member-card--blocked" : ""}`}>
      <Link to={`/profile/${member.username}`} className="center-hub__member-avatar">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} />
        ) : (
          <span>{member.name?.charAt(0)?.toUpperCase() || "?"}</span>
        )}
      </Link>
      <div className="center-hub__member-info">
        <Link to={`/profile/${member.username}`} className="center-hub__member-name">
          {member.name}
          <RoleBadge role={member.role} />
        </Link>
        <span className="center-hub__member-username">@{member.username}</span>
        {member.bio && <p className="center-hub__member-bio">{member.bio}</p>}
        <div className="center-hub__member-stats">
          <span>{member.posts_count || 0} {t("profile.posts")}</span>
          <span>·</span>
          <span>{member.comments_count || 0} {t("center.comments")}</span>
        </div>
      </div>
      
      {/* Admin actions for teachers */}
      {isTeacher && member.role !== "admin" && (
        <div className="center-hub__member-actions">
          {member.is_blocked ? (
            <button 
              className="center-hub__action-btn center-hub__action-btn--unblock"
              onClick={() => onUnblock(member.id)}
              title={t("center.unblock_user")}
            >
              Desbloquear
            </button>
          ) : (
            <>
              {member.role === "student" && (
                <button 
                  className="center-hub__action-btn center-hub__action-btn--promote"
                  onClick={() => onRoleChange(member.id, "teacher")}
                  title={t("center.promote_to_teacher")}
                >
                  → Profesor
                </button>
              )}
              {member.role === "teacher" && (
                <button 
                  className="center-hub__action-btn center-hub__action-btn--demote"
                  onClick={() => onRoleChange(member.id, "student")}
                  title={t("center.demote_to_student")}
                >
                  → Estudiante
                </button>
              )}
              <button 
                className="center-hub__action-btn center-hub__action-btn--block"
                onClick={() => onBlock(member.id)}
                title={t("center.block_user")}
              >
                Bloquear
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function CenterHub() {
  const { t } = useTranslation();
  const { user, centerCheck, refreshUser } = useAuth();
  const [activeChannel, setActiveChannel] = useState("all");
  const [activeTab, setActiveTab] = useState("posts");
  const [centerInfo, setCenterInfo] = useState(null);
  const [loadingCenter, setLoadingCenter] = useState(true);
  
  // Members state
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersSearch, setMembersSearch] = useState("");
  const [membersFilter, setMembersFilter] = useState("all");
  
  // Admin state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ description: "", website: "" });
  const [savingCenter, setSavingCenter] = useState(false);

  const centerId = user?.center_id;
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  // Fetch posts for this center
  const {
    posts,
    loading: loadingPosts,
    error: postsError,
    hasMore,
    loadMore,
    createPost,
    deletePost,
  } = usePosts({
    feedType: "center",
    centerId,
    enabled: !!centerId,
  });

  // Fetch center-specific tags
  const { tags: channels } = useTags(centerId);

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
        const data = response.data || response;
        setCenterInfo(data);
        setEditForm({ 
          description: data.description || "", 
          website: data.website || "" 
        });
      } catch (err) {
        console.error("Error fetching center info:", err);
      } finally {
        setLoadingCenter(false);
      }
    };

    fetchCenterInfo();
  }, [centerId]);

  // Fetch members when tab is active
  const fetchMembers = useCallback(async () => {
    if (!centerId) return;
    
    try {
      setLoadingMembers(true);
      const params = {};
      if (membersSearch) params.search = membersSearch;
      if (membersFilter !== "all") params.role = membersFilter;
      
      const response = await centerService.getCenterMembers(centerId, params);
      const data = response.data?.data || response.data || [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [centerId, membersSearch, membersFilter]);

  useEffect(() => {
    if (activeTab === "members" || activeTab === "admin") {
      fetchMembers();
    }
  }, [activeTab, fetchMembers]);

  // Admin actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      await centerService.changeRole(userId, newRole);
      fetchMembers();
    } catch (err) {
      console.error("Error changing role:", err);
    }
  };

  const handleBlock = async (userId) => {
    try {
      await centerService.blockMember(userId);
      fetchMembers();
    } catch (err) {
      console.error("Error blocking user:", err);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await centerService.unblockMember(userId);
      fetchMembers();
    } catch (err) {
      console.error("Error unblocking user:", err);
    }
  };

  const handleSaveCenter = async () => {
    try {
      setSavingCenter(true);
      await centerService.updateCenter(centerId, editForm);
      setCenterInfo(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving center:", err);
    } finally {
      setSavingCenter(false);
    }
  };

  // Filter posts by active channel
  const filteredPosts = posts
    .filter((post) => {
      if (activeChannel === "all") return true;
      const postTags = post.tags || [];
      return postTags.some((tag) => {
        const tagName = typeof tag === "string" ? tag : tag.name;
        return (
          tagName.toLowerCase() === activeChannel.toLowerCase() ||
          `#${tagName}`.toLowerCase() === activeChannel.toLowerCase()
        );
      });
    })
    .filter((post) => {
      if (activeTab === "posts") return post.type !== "question";
      if (activeTab === "questions") return post.type === "question";
      return true;
    });

  // Handle post creation
  const handleCreatePost = async (postData) => {
    try {
      // If we're in the "questions" tab, force the post to be a question
      const isQuestionsTab = activeTab === "questions";
      const finalPostData = {
        ...postData,
        center_id: centerId,
        visibility: "center",
      };
      
      // Force question type when creating from questions tab
      if (isQuestionsTab) {
        finalPostData.type = "question";
        // Add dubtes-recents tag if not present
        const existingTags = postData.tags || [];
        if (!existingTags.some(tag => tag.toLowerCase() === "dubtes-recents")) {
          finalPostData.tags = ["dubtes-recents", ...existingTags].slice(0, 5);
        }
      }
      
      await createPost(finalPostData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // No center assigned
  if (!centerId) {
    return <NoCenterView user={user} t={t} centerCheck={centerCheck} refreshUser={refreshUser} />;
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
  const centerLocation = centerInfo?.city || centerInfo?.location || "";
  const memberCount = centerInfo?.users_count || centerInfo?.member_count || 0;
  const teacherCount = centerInfo?.teachers_count || 0;
  const studentCount = centerInfo?.students_count || 0;
  const createdYear = centerInfo?.created_at ? new Date(centerInfo.created_at).getFullYear() : 2024;
  const isPrivate = centerInfo?.is_private ?? true;

  // Render content based on active tab
  const renderContent = () => {
    // Members Tab
    if (activeTab === "members") {
      return (
        <div className="center-hub__members-section">
          {/* Search & Filter */}
          <div className="center-hub__members-toolbar">
            <div className="center-hub__members-search">
              <SearchIcon />
              <input
                type="text"
                placeholder={t("center.search_members")}
                value={membersSearch}
                onChange={(e) => setMembersSearch(e.target.value)}
              />
            </div>
            <div className="center-hub__members-filters">
              <button
                className={`center-hub__filter-btn ${membersFilter === "all" ? "center-hub__filter-btn--active" : ""}`}
                onClick={() => setMembersFilter("all")}
              >
                {t("notifications.filters.all")} ({memberCount})
              </button>
              <button
                className={`center-hub__filter-btn ${membersFilter === "teacher" ? "center-hub__filter-btn--active" : ""}`}
                onClick={() => setMembersFilter("teacher")}
              >
                {t("center.teachers")} ({teacherCount})
              </button>
              <button
                className={`center-hub__filter-btn ${membersFilter === "student" ? "center-hub__filter-btn--active" : ""}`}
                onClick={() => setMembersFilter("student")}
              >
                {t("center.students")} ({studentCount})
              </button>
            </div>
          </div>

          {/* Members List */}
          {loadingMembers ? (
            <div className="center-hub__loading">
              <LoadingSpinner />
            </div>
          ) : members.length === 0 ? (
            <div className="center-hub__empty">
              <p>{t("center.no_members_found")}</p>
            </div>
          ) : (
            <div className="center-hub__members-list">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isTeacher={isTeacher}
                  onRoleChange={handleRoleChange}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Admin Tab (Teachers only)
    if (activeTab === "admin" && isTeacher) {
      return (
        <div className="center-hub__admin-section">
          <div className="center-hub__admin-card">
            <h3 className="center-hub__admin-title">
              <SettingsIcon /> {t("center.settings")}
            </h3>
            
            {isEditing ? (
              <div className="center-hub__edit-form">
                <div className="center-hub__form-group">
                  <label>{t("center.description")}</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder={t("center.description_placeholder")}
                  />
                </div>
                <div className="center-hub__form-group">
                  <label>{t("center.website")}</label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="center-hub__form-actions">
                  <button 
                    className="center-hub__btn center-hub__btn--secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    {t("common.cancel")}
                  </button>
                  <button 
                    className="center-hub__btn center-hub__btn--primary"
                    onClick={handleSaveCenter}
                    disabled={savingCenter}
                  >
                    {savingCenter ? t("common.saving") : t("common.save")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="center-hub__info-display">
                <div className="center-hub__info-row">
                  <span className="center-hub__info-label">{t("center.description")}</span>
                  <p className="center-hub__info-value">
                    {centerInfo?.description || <em>{t("center.no_description")}</em>}
                  </p>
                </div>
                <div className="center-hub__info-row">
                  <span className="center-hub__info-label">{t("center.website")}</span>
                  <p className="center-hub__info-value">
                    {centerInfo?.website ? (
                      <a href={centerInfo.website} target="_blank" rel="noopener noreferrer">
                        {centerInfo.website}
                      </a>
                    ) : (
                      <em>{t("center.no_website")}</em>
                    )}
                  </p>
                </div>
                <div className="center-hub__info-row">
                  <span className="center-hub__info-label">{t("center.privacy")}</span>
                  <p className="center-hub__info-value center-hub__privacy-badge">
                    {isPrivate ? (
                      <><LockIcon /> {t("center.private")}</>
                    ) : (
                      <><GlobeIcon /> {t("center.public")}</>
                    )}
                  </p>
                </div>
                <button 
                  className="center-hub__btn center-hub__btn--primary"
                  onClick={() => setIsEditing(true)}
                >
                  {t("common.edit")}
                </button>
              </div>
            )}
          </div>

          {/* Stats Overview */}
          <div className="center-hub__admin-card">
            <h3 className="center-hub__admin-title">
              <UsersIcon /> {t("center.statistics")}
            </h3>
            <div className="center-hub__stats-grid">
              <div className="center-hub__stat-card">
                <span className="center-hub__stat-value">{memberCount}</span>
                <span className="center-hub__stat-label">{t("center.total_members")}</span>
              </div>
              <div className="center-hub__stat-card">
                <span className="center-hub__stat-value">{teacherCount}</span>
                <span className="center-hub__stat-label">{t("center.teachers")}</span>
              </div>
              <div className="center-hub__stat-card">
                <span className="center-hub__stat-value">{studentCount}</span>
                <span className="center-hub__stat-label">{t("center.students")}</span>
              </div>
              <div className="center-hub__stat-card">
                <span className="center-hub__stat-value">{posts.length}</span>
                <span className="center-hub__stat-label">{t("profile.posts")}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Posts/Questions/Resources Tab
    return (
      <>
        <PostInput onSubmit={handleCreatePost} forceQuestion={activeTab === "questions"} />

        {postsError && (
          <div className="center-hub__error">
            <p>{t("feed.loading_error")}: {postsError}</p>
          </div>
        )}

        {loadingPosts && posts.length === 0 && (
          <div className="center-hub__loading">
            <LoadingSpinner />
            <p>{t("feed.loading_posts")}</p>
          </div>
        )}

        <div className="center-hub__posts">
          {filteredPosts.map((post, index) => (
            <div key={post.id} className="center-hub__post-wrapper">
              {post.pinned && (
                <div className="center-hub__pinned-badge">📌 {t("center.pinned")}</div>
              )}
              {/* Privacy indicator on posts */}
              <div className="center-hub__post-privacy">
                <LockIcon />
                <span>{t("center.center_only")}</span>
              </div>
              <PostCard
                post={post}
                onDelete={() => deletePost(post.id)}
                className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
              />
            </div>
          ))}
        </div>

        {!loadingPosts && filteredPosts.length === 0 && (
          <div className="center-hub__empty">
            <p>{t("profile.no_posts_category")}</p>
          </div>
        )}

        {hasMore && posts.length > 0 && (
          <button className="center-hub__load-more" onClick={loadMore} disabled={loadingPosts}>
            {loadingPosts ? t("common.loading") : t("common.load_more")}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="center-hub">
      {/* Banner */}
      <header className={`center-hub__banner ${isPrivate ? "center-hub__banner--private" : "center-hub__banner--public"}`}>
        <div className="center-hub__banner-overlay" />
        <div className="center-hub__banner-content">
          <div className="center-hub__school-badge">
            <span className="center-hub__school-icon">🎓</span>
          </div>
          <div className="center-hub__school-info">
            <div className="center-hub__school-header">
              <h1 className="center-hub__school-name">{centerName}</h1>
              <span className={`center-hub__privacy-indicator ${isPrivate ? "center-hub__privacy-indicator--private" : "center-hub__privacy-indicator--public"}`}>
                {isPrivate ? <LockIcon /> : <GlobeIcon />}
                {isPrivate ? t("center.private") : t("center.public")}
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
          className={`center-hub__channel ${activeChannel === "all" ? "center-hub__channel--active" : ""}`}
          onClick={() => setActiveChannel("all")}
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
          className={`center-hub__nav-tab ${activeTab === "posts" ? "center-hub__nav-tab--active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          {t("sidebar.profile")}
        </button>
        <button
          className={`center-hub__nav-tab ${activeTab === "questions" ? "center-hub__nav-tab--active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          {t("widgets.recent_questions")}
        </button>
        <button
          className={`center-hub__nav-tab ${activeTab === "resources" ? "center-hub__nav-tab--active" : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          {t("center.resources")}
        </button>
        <button
          className={`center-hub__nav-tab ${activeTab === "members" ? "center-hub__nav-tab--active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <UsersIcon /> {t("center.members_tab")}
        </button>
        {isTeacher && (
          <button
            className={`center-hub__nav-tab center-hub__nav-tab--admin ${activeTab === "admin" ? "center-hub__nav-tab--active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            <SettingsIcon /> {t("center.admin")}
          </button>
        )}
      </nav>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

/**
 * NoCenterView – Shown when user has no center.
 * - Generic email → locked message
 * - Non-generic email → option to request a center or shows pending status
 */
function NoCenterView({ user, t, centerCheck, refreshUser }) {
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const isGeneric = centerCheck?.is_generic_email ?? false;
  const hasPendingRequest = centerCheck?.has_pending_request ?? false;
  const domain = user?.email ? user.email.split("@")[1] : "";

  const handleTeacherConfirm = async (centerRequestData) => {
    setTeacherLoading(true);
    try {
      const formData = new FormData();
      formData.append("center_name", centerRequestData.center_name);
      formData.append("domain", centerRequestData.domain);
      formData.append("full_name", centerRequestData.full_name);
      formData.append("justificante", centerRequestData.justificante);
      if (centerRequestData.city) {
        formData.append("city", centerRequestData.city);
      }
      await api.upload("/center-requests", formData);
      setShowTeacherModal(false);
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error("Center request error:", error);
    } finally {
      setTeacherLoading(false);
    }
  };

  return (
    <div className="center-hub">
      <div className="center-hub__no-center">
        <span className="center-hub__no-center-icon">🏫</span>

        {isGeneric ? (
          <>
            <h2>{t("center.generic_email_title")}</h2>
            <p>{t("center.generic_email_desc")}</p>
          </>
        ) : hasPendingRequest ? (
          <>
            <h2>{t("center.pending_request_title")}</h2>
            <p>{t("center.pending_request_desc")}</p>
          </>
        ) : (
          <>
            <h2>{t("center.no_center_title")}</h2>
            <p>{t("center.no_center_desc_extended")}</p>
            <button
              className="center-hub__request-btn"
              onClick={() => setShowTeacherModal(true)}
            >
              🏫 {t("center.request_center")}
            </button>
          </>
        )}
      </div>

      {showTeacherModal && (
        <TeacherVerificationModal
          email={user?.email}
          loading={teacherLoading}
          onConfirm={handleTeacherConfirm}
          onCancel={() => setShowTeacherModal(false)}
        />
      )}
    </div>
  );
}
