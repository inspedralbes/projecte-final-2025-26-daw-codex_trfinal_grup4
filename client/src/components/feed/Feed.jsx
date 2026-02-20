import React, { useState, useCallback } from 'react';
import PostInput from './PostInput';
import PostCard from './PostCard';
import { usePosts } from '@/hooks/usePosts';
import './Feed.css';

export default function Feed({ feedType = "global", centerMode = false }) {
  const [activeTab, setActiveTab] = useState('all');

  // Determine feed type based on active tab
  const currentFeedType = activeTab === 'following' ? 'following' : (centerMode ? 'center' : 'global');
  const postType = activeTab === 'questions' ? 'question' : null;

  const { 
    posts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    createPost,
    updatePostInList,
    deletePost 
  } = usePosts({ 
    feedType: currentFeedType, 
    type: postType 
  });

  const handleCreatePost = useCallback(async (postData) => {
    const result = await createPost(postData);
    return result;
  }, [createPost]);

  const handleInteractionUpdate = useCallback((postId, updates) => {
    updatePostInList(postId, updates);
  }, [updatePostInList]);

  const handleDeletePost = useCallback(async (postId) => {
    return await deletePost(postId);
  }, [deletePost]);

  return (
    <div className="feed">
      {/* Header */}
      <header className="feed__header">
        <h1 className="feed__title">{centerMode ? 'Hub del Centro' : 'Feed Global'}</h1>
        <nav className="feed__tabs">
          <button 
            className={`feed__tab ${activeTab === 'all' ? 'feed__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Para ti
          </button>
          {!centerMode && (
            <button 
              className={`feed__tab ${activeTab === 'following' ? 'feed__tab--active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Siguiendo
            </button>
          )}
          <button 
            className={`feed__tab ${activeTab === 'questions' ? 'feed__tab--active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Dudas
          </button>
        </nav>
      </header>

      {/* Post Input */}
      <PostInput onSubmit={handleCreatePost} />

      {/* Error State */}
      {error && (
        <div className="feed__error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}

      {/* Posts */}
      <div className="feed__posts">
        {loading && posts.length === 0 ? (
          <div className="feed__loading">
            <div className="feed__spinner" />
            <span>Cargando publicaciones...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="feed__empty">
            <p>No hay publicaciones todavía.</p>
            <span>¡Sé el primero en compartir algo!</span>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
                onInteractionUpdate={handleInteractionUpdate}
                onDelete={handleDeletePost}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="feed__load-more">
                <button 
                  onClick={loadMore} 
                  disabled={loading}
                  className="feed__load-more-btn"
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}