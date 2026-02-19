import React, { useState } from 'react';
import './Explore.css';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const TrendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Mock data
const trendingTags = [
  { tag: '#SpringBoot', growth: '+245%', posts: 1234 },
  { tag: '#ReactQuery', growth: '+189%', posts: 892 },
  { tag: '#TailwindCSS', growth: '+156%', posts: 2103 },
  { tag: '#PostgreSQL', growth: '+134%', posts: 756 },
  { tag: '#DockerCompose', growth: '+98%', posts: 543 },
];

const topContributors = [
  { name: 'Ana García', handle: '@anagarcia', avatar: 'ana', points: 4521, rank: 1, badge: '👑' },
  { name: 'Carlos López', handle: '@carlosdev', avatar: 'carlos', points: 3890, rank: 2, badge: '⭐' },
  { name: 'María Ruiz', handle: '@mariaruiz', avatar: 'maria', points: 3654, rank: 3, badge: '🔥' },
  { name: 'David Martín', handle: '@davidmartin', avatar: 'david', points: 2987, rank: 4 },
  { name: 'Laura Sánchez', handle: '@laurasanchez', avatar: 'laura', points: 2543, rank: 5 },
];

const trendingRepos = [
  { name: 'awesome-fp-resources', author: 'comunidad-fp', stars: 1245, language: 'Markdown' },
  { name: 'laravel-api-starter', author: 'devjuan', stars: 892, language: 'PHP' },
  { name: 'react-typescript-template', author: 'anagarcia', stars: 756, language: 'TypeScript' },
  { name: 'spring-boot-jwt-auth', author: 'carlosdev', stars: 634, language: 'Java' },
];

const solvedDoubts = [
  { title: '¿Cómo implementar autenticación JWT en Laravel 11?', author: '@devjuan', answers: 12, votes: 89 },
  { title: 'Error CORS en React + Express, solución definitiva', author: '@webmaster', answers: 8, votes: 67 },
  { title: 'Optimización de queries N+1 en Eloquent', author: '@laravelmaster', answers: 15, votes: 123 },
  { title: 'Configurar Docker Compose para desarrollo local', author: '@dockerfan', answers: 6, votes: 45 },
];

const categories = [
  { name: 'Frontend', icon: '🎨', count: 3421 },
  { name: 'Backend', icon: '⚙️', count: 2890 },
  { name: 'DevOps', icon: '🚀', count: 1234 },
  { name: 'Bases de Datos', icon: '🗄️', count: 987 },
  { name: 'Mobile', icon: '📱', count: 756 },
  { name: 'Seguridad', icon: '🔒', count: 543 },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="explore">
      {/* Search Header */}
      <header className="explore__header">
        <div className="explore__search">
          <span className="explore__search-icon"><SearchIcon /></span>
          <input
            type="text"
            className="explore__search-input"
            placeholder="Buscar publicaciones, usuarios, tags, código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="explore__search-shortcut">⌘K</span>
        </div>
      </header>

      {/* Categories */}
      <section className="explore__categories">
        {categories.map(cat => (
          <button key={cat.name} className="explore__category">
            <span className="explore__category-icon">{cat.icon}</span>
            <span className="explore__category-name">{cat.name}</span>
            <span className="explore__category-count">{cat.count}</span>
          </button>
        ))}
      </section>

      {/* Grid Widgets */}
      <div className="explore__grid">
        {/* Trending Tags */}
        <section className="explore__widget explore__widget--trending">
          <div className="explore__widget-header">
            <TrendingIcon />
            <h2 className="explore__widget-title">Tendencias</h2>
          </div>
          <div className="explore__widget-content">
            {trendingTags.map((trend, index) => (
              <a key={trend.tag} href="#" className="explore__trend">
                <span className="explore__trend-rank">{index + 1}</span>
                <div className="explore__trend-info">
                  <span className="explore__trend-tag">{trend.tag}</span>
                  <span className="explore__trend-posts">{trend.posts} publicaciones</span>
                </div>
                <span className="explore__trend-growth">{trend.growth}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Top Contributors */}
        <section className="explore__widget explore__widget--contributors">
          <div className="explore__widget-header">
            <StarIcon />
            <h2 className="explore__widget-title">Top Contribuidores</h2>
          </div>
          <div className="explore__widget-content">
            {topContributors.map(user => (
              <a key={user.handle} href="#" className="explore__contributor">
                <span className={`explore__contributor-rank explore__contributor-rank--${user.rank}`}>
                  {user.rank}
                </span>
                <div className="explore__contributor-avatar">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} alt={user.name} />
                </div>
                <div className="explore__contributor-info">
                  <span className="explore__contributor-name">
                    {user.name} {user.badge && user.badge}
                  </span>
                  <span className="explore__contributor-handle">{user.handle}</span>
                </div>
                <span className="explore__contributor-points">{user.points} pts</span>
              </a>
            ))}
          </div>
        </section>

        {/* Trending Repos */}
        <section className="explore__widget explore__widget--repos">
          <div className="explore__widget-header">
            <CodeIcon />
            <h2 className="explore__widget-title">Repositorios Destacados</h2>
          </div>
          <div className="explore__widget-content">
            {trendingRepos.map(repo => (
              <a key={repo.name} href="#" className="explore__repo">
                <div className="explore__repo-info">
                  <span className="explore__repo-name">{repo.name}</span>
                  <span className="explore__repo-author">@{repo.author}</span>
                </div>
                <div className="explore__repo-meta">
                  <span className="explore__repo-lang">{repo.language}</span>
                  <span className="explore__repo-stars">
                    ⭐ {repo.stars}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Solved Doubts */}
        <section className="explore__widget explore__widget--doubts">
          <div className="explore__widget-header">
            <CheckCircleIcon />
            <h2 className="explore__widget-title">Dudas Resueltas</h2>
          </div>
          <div className="explore__widget-content">
            {solvedDoubts.map((doubt, index) => (
              <a key={index} href="#" className="explore__doubt">
                <div className="explore__doubt-votes">
                  <span className="explore__doubt-votes-count">{doubt.votes}</span>
                  <span className="explore__doubt-votes-label">votos</span>
                </div>
                <div className="explore__doubt-info">
                  <span className="explore__doubt-title">{doubt.title}</span>
                  <div className="explore__doubt-meta">
                    <span>{doubt.author}</span>
                    <span>·</span>
                    <span>{doubt.answers} respuestas</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
