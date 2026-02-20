import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTags } from '@/hooks/useTags';
import profileService from '@/services/profileService';
import postsService from '@/services/postsService';
import './RightSection.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="widget__spinner">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
    </svg>
  </div>
);

const TrendingTags = () => {
  const { tags, loading } = useTags();
  const navigate = useNavigate();

  const handleTagClick = (tagName) => {
    navigate(`/explore?q=${encodeURIComponent(tagName)}`);
  };

  return (
    <div className="widget">
      <h3 className="widget__title">Tendencias</h3>
      <div className="widget__list">
        {loading ? (
          <LoadingSpinner />
        ) : tags.length === 0 ? (
          <p className="widget__empty">No hay tendencias</p>
        ) : (
          tags.slice(0, 5).map((tag, index) => (
            <button key={tag.id || index} onClick={() => handleTagClick(tag.name)} className="trend-item">
              <span className="trend-item__rank">{index + 1}</span>
              <div className="trend-item__content">
                <span className="trend-item__tag">#{tag.name}</span>
                <span className="trend-item__posts">{tag.posts_count || 0} publicaciones</span>
              </div>
            </button>
          ))
        )}
      </div>
      <Link to="/explore" className="widget__more">Ver más</Link>
    </div>
  );
};

const TopContributors = () => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await profileService.getLeaderboard(3);
        setContributors(response.data || response || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setContributors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="widget">
      <h3 className="widget__title">Top Contribuidores</h3>
      <div className="widget__list">
        {loading ? (
          <LoadingSpinner />
        ) : contributors.length === 0 ? (
          <p className="widget__empty">No hay contribuidores</p>
        ) : (
          contributors.map((user) => (
            <button key={user.id} onClick={() => navigate(`/profile/${user.username}`)} className="user-item">
              <div className="user-item__avatar">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt={user.name}
                />
              </div>
              <div className="user-item__info">
                <span className="user-item__name">
                  {user.name} {user.badge}
                </span>
                <span className="user-item__handle">@{user.username}</span>
              </div>
              <span className="user-item__points">{user.score} pts</span>
            </button>
          ))
        )}
      </div>
      <Link to="/explore" className="widget__more">Ver ranking</Link>
    </div>
  );
};

const RecentQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await postsService.getFeed({ type: 'question' });
        const posts = response.data?.data || response.data || response || [];
        setQuestions(Array.isArray(posts) ? posts.slice(0, 3) : []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="widget">
      <h3 className="widget__title">Dudas Recientes</h3>
      <div className="widget__list">
        {loading ? (
          <LoadingSpinner />
        ) : questions.length === 0 ? (
          <p className="widget__empty">No hay preguntas</p>
        ) : (
          questions.map((q) => (
            <button key={q.id} onClick={() => navigate(`/post/${q.id}`)} className="question-item">
              <span className={`question-item__status ${q.is_solved ? 'question-item__status--solved' : ''}`}>
                {q.is_solved ? '✓' : '?'}
              </span>
              <div className="question-item__content">
                <span className="question-item__title">{q.content?.slice(0, 50) || 'Sin título'}...</span>
                <span className="question-item__author">@{q.user?.username || 'anónimo'}</span>
              </div>
            </button>
          ))
        )}
      </div>
      <Link to="/explore" className="widget__more">Ver todas</Link>
    </div>
  );
};

export default function RightSection() {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/explore?q=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  return (
    <aside className="right-section">
      <div className="right-section__container">
        {/* Search */}
        <div className="search-box">
          <span className="search-box__icon">
            <SearchIcon />
          </span>
          <input 
            type="text" 
            className="search-box__input" 
            placeholder="Buscar en Codex..."
            onKeyDown={handleSearch}
          />
          <span className="search-box__shortcut">⌘K</span>
        </div>

        {/* Widgets */}
        <TrendingTags />
        <TopContributors />
        <RecentQuestions />

        {/* Footer Links */}
        <footer className="right-section__footer">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Cookies</a>
          <a href="#">Ayuda</a>
          <span>© 2026 Codex</span>
        </footer>
      </div>
    </aside>
  );
}