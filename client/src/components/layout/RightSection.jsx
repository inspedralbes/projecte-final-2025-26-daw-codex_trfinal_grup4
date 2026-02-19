import React from 'react';
import './RightSection.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const TrendingTags = () => {
  const trends = [
    { tag: '#Laravel', category: 'Backend', posts: 1245 },
    { tag: '#ReactHooks', category: 'Frontend', posts: 892 },
    { tag: '#Docker', category: 'DevOps', posts: 756 },
    { tag: '#TypeScript', category: 'Frontend', posts: 634 },
    { tag: '#PostgreSQL', category: 'Databases', posts: 512 },
  ];

  return (
    <div className="widget">
      <h3 className="widget__title">Tendencias</h3>
      <div className="widget__list">
        {trends.map((trend, index) => (
          <a key={trend.tag} href="#" className="trend-item">
            <span className="trend-item__rank">{index + 1}</span>
            <div className="trend-item__content">
              <span className="trend-item__category">{trend.category}</span>
              <span className="trend-item__tag">{trend.tag}</span>
              <span className="trend-item__posts">{trend.posts} publicaciones</span>
            </div>
          </a>
        ))}
      </div>
      <a href="/explore" className="widget__more">Ver más</a>
    </div>
  );
};

const TopContributors = () => {
  const contributors = [
    { name: 'Ana García', handle: '@anagarcia', avatar: 'ana', points: 2450, badge: '👑' },
    { name: 'Carlos López', handle: '@carlosdev', avatar: 'carlos', points: 1890, badge: '⭐' },
    { name: 'María Ruiz', handle: '@mariaruiz', avatar: 'maria', points: 1654, badge: '🔥' },
  ];

  return (
    <div className="widget">
      <h3 className="widget__title">Top Contribuidores</h3>
      <div className="widget__list">
        {contributors.map((user) => (
          <a key={user.handle} href="#" className="user-item">
            <div className="user-item__avatar">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} 
                alt={user.name}
              />
            </div>
            <div className="user-item__info">
              <span className="user-item__name">
                {user.name} {user.badge}
              </span>
              <span className="user-item__handle">{user.handle}</span>
            </div>
            <span className="user-item__points">{user.points} pts</span>
          </a>
        ))}
      </div>
      <a href="/explore" className="widget__more">Ver ranking</a>
    </div>
  );
};

const RecentQuestions = () => {
  const questions = [
    { title: '¿Cómo implementar JWT en Laravel?', author: '@devjuan', solved: true },
    { title: 'Error CORS con React y Express', author: '@webdev23', solved: false },
    { title: 'Optimizar queries en PostgreSQL', author: '@datamaster', solved: true },
  ];

  return (
    <div className="widget">
      <h3 className="widget__title">Dudas Recientes</h3>
      <div className="widget__list">
        {questions.map((q, index) => (
          <a key={index} href="#" className="question-item">
            <span className={`question-item__status ${q.solved ? 'question-item__status--solved' : ''}`}>
              {q.solved ? '✓' : '?'}
            </span>
            <div className="question-item__content">
              <span className="question-item__title">{q.title}</span>
              <span className="question-item__author">{q.author}</span>
            </div>
          </a>
        ))}
      </div>
      <a href="/explore" className="widget__more">Ver todas</a>
    </div>
  );
};

export default function RightSection() {
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