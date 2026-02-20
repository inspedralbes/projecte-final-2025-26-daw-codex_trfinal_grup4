import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import PostCard from "@/components/feed/PostCard";
import "./Profile.css";

// Loading spinner
const LoadingSpinner = () => (
  <div className="profile__spinner">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
    </svg>
  </div>
);

export default function Profile({ username }) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  
  // Use profile hook for the target user (or current user if no username)
  const targetUsername = username || currentUser?.username;
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError,
    isFollowing,
    toggleFollow,
    isOwnProfile 
  } = useProfile(targetUsername);
  
  // Fetch user's posts
  const { 
    posts, 
    loading: postsLoading, 
    hasMore, 
    loadMore,
    deletePost 
  } = usePosts({ 
    feedType: 'user', 
    userId: profile?.username || profile?.id,
    enabled: !!profile
  });

  if (profileLoading) {
    return (
      <div className="profile">
        <div className="profile__loading">
          <LoadingSpinner />
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile">
        <div className="profile__error">
          <p>Error al cargar el perfil: {profileError}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const user = profile;
  
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : null;

  // Generate initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const roleName =
    user.role === "student"
      ? "Estudiante"
      : user.role === "teacher"
        ? "Profesor"
        : user.role === "admin"
          ? "Admin"
          : user.role || "Usuario";

  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'posts') return post.type !== 'question';
    if (activeTab === 'questions') return post.type === 'question';
    if (activeTab === 'likes') return post.liked_by_user;
    return true;
  });

  return (
    <div className="profile">
      {/* Cover band */}
      <div className="profile__cover" />

      {/* Main card */}
      <div className="profile__card">
        {/* Avatar */}
        <div className="profile__avatar">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.name}`}
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
            <span className="profile__stat-label">Posts</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-value">{user.followers_count || 0}</span>
            <span className="profile__stat-label">Seguidores</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-value">{user.following_count || 0}</span>
            <span className="profile__stat-label">Siguiendo</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-value">{typeof user.reputation === 'object' ? user.reputation?.score || 0 : user.reputation || 0}</span>
            <span className="profile__stat-label">Puntos</span>
          </div>
        </div>

        {/* Details */}
        <div className="profile__details">
          {user.bio && (
            <p className="profile__bio">{user.bio}</p>
          )}
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
              <span>Se unió en {joinedDate}</span>
            </div>
          )}
        </div>

        {/* Action button */}
        {isOwnProfile ? (
          <button className="profile__edit-btn">Editar perfil</button>
        ) : (
          <button 
            className={`profile__follow-btn ${isFollowing ? 'profile__follow-btn--following' : ''}`}
            onClick={toggleFollow}
          >
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <nav className="profile__tabs">
        <button 
          className={`profile__tab ${activeTab === 'posts' ? 'profile__tab--active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`profile__tab ${activeTab === 'questions' ? 'profile__tab--active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Dudas
        </button>
        {isOwnProfile && (
          <button 
            className={`profile__tab ${activeTab === 'likes' ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            Me gusta
          </button>
        )}
      </nav>

      {/* Posts list */}
      <div className="profile__posts">
        {postsLoading && posts.length === 0 ? (
          <div className="profile__posts-loading">
            <LoadingSpinner />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="profile__posts-empty">
            <p>No hay publicaciones en esta categoría</p>
          </div>
        ) : (
          <>
            {filteredPosts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post}
                onDelete={isOwnProfile ? () => deletePost(post.id) : undefined}
                className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
              />
            ))}
            {hasMore && (
              <button 
                className="profile__load-more"
                onClick={loadMore}
                disabled={postsLoading}
              >
                {postsLoading ? 'Cargando...' : 'Cargar más'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
