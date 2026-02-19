import React, { useState } from 'react';
import PostCard from '@/components/feed/PostCard';
import './Profile.css';

// Icons
const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SchoolIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const VerifiedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--codex-teal)">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// Mock user data
const mockUser = {
  name: 'Marc Pérez',
  handle: '@marcperez',
  avatar: 'developer',
  verified: true,
  badge: '2DAW',
  bio: 'Full Stack Developer en formación 🚀 | React, Laravel & Docker enthusiast | Aprendiendo algo nuevo cada día',
  location: 'Barcelona, Catalunya',
  website: 'github.com/marcperez',
  joinedDate: 'Septiembre 2024',
  school: 'IES Jaume Balmes',
  following: 234,
  followers: 567,
  points: 1245,
  techStack: [
    { name: 'React', level: 85 },
    { name: 'JavaScript', level: 90 },
    { name: 'Laravel', level: 75 },
    { name: 'Docker', level: 60 },
    { name: 'PostgreSQL', level: 70 },
    { name: 'TypeScript', level: 55 },
  ],
  stats: {
    posts: 89,
    snippets: 34,
    doubtsResolved: 23,
  },
  savedSnippets: [
    { id: 1, title: 'JWT Auth en Laravel', language: 'PHP', likes: 45 },
    { id: 2, title: 'Custom Hook useDebounce', language: 'JavaScript', likes: 67 },
    { id: 3, title: 'Docker Compose para desarrollo', language: 'YAML', likes: 89 },
    { id: 4, title: 'Optimización de queries', language: 'SQL', likes: 34 },
  ]
};

const mockPosts = [
  {
    id: 201,
    type: 'snippet',
    author: {
      name: 'Marc Pérez',
      handle: '@marcperez',
      avatar: 'developer',
      verified: true,
      badge: '2DAW'
    },
    content: 'Tip del día: Custom hook para manejar formularios de forma sencilla 🎯',
    code: `const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  
  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };
  
  const reset = () => setValues(initialValues);
  
  return { values, handleChange, reset };
};`,
    language: 'javascript',
    tags: ['#React', '#Hooks'],
    timestamp: '2d',
    stats: { likes: 89, reposts: 12, comments: 5 }
  }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('posts');
  const user = mockUser;

  return (
    <div className="profile">
      {/* Banner */}
      <div className="profile__banner">
        <div className="profile__banner-gradient" />
      </div>

      {/* Avatar & Actions */}
      <div className="profile__avatar-section">
        <div className="profile__avatar">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`}
            alt={user.name}
          />
        </div>
        <div className="profile__actions">
          <button className="profile__action-btn">Editar perfil</button>
        </div>
      </div>

      {/* Info */}
      <div className="profile__info">
        <div className="profile__name-row">
          <h1 className="profile__name">{user.name}</h1>
          {user.verified && <VerifiedIcon />}
        </div>
        <div className="profile__handle">{user.handle}</div>
        <span className="profile__badge">{user.badge}</span>

        <p className="profile__bio">{user.bio}</p>

        <div className="profile__meta">
          <span className="profile__meta-item">
            <SchoolIcon />
            {user.school}
          </span>
          <span className="profile__meta-item">
            <LocationIcon />
            {user.location}
          </span>
          <span className="profile__meta-item">
            <LinkIcon />
            <a href={`https://${user.website}`}>{user.website}</a>
          </span>
          <span className="profile__meta-item">
            <CalendarIcon />
            Se unió en {user.joinedDate}
          </span>
        </div>

        <div className="profile__follow-stats">
          <span className="profile__stat">
            <strong>{user.following}</strong> Siguiendo
          </span>
          <span className="profile__stat">
            <strong>{user.followers}</strong> Seguidores
          </span>
          <span className="profile__stat profile__stat--points">
            <strong>{user.points}</strong> Puntos
          </span>
        </div>
      </div>

      {/* Tech Stack */}
      <section className="profile__section">
        <h2 className="profile__section-title">Tech Stack</h2>
        <div className="profile__tech-stack">
          {user.techStack.map(tech => (
            <div key={tech.name} className="profile__tech-item">
              <div className="profile__tech-header">
                <span className="profile__tech-name">{tech.name}</span>
                <span className="profile__tech-level">{tech.level}%</span>
              </div>
              <div className="profile__tech-bar">
                <div 
                  className="profile__tech-progress"
                  style={{ width: `${tech.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="profile__section">
        <div className="profile__stats-grid">
          <div className="profile__stats-card">
            <span className="profile__stats-value">{user.stats.posts}</span>
            <span className="profile__stats-label">Publicaciones</span>
          </div>
          <div className="profile__stats-card">
            <span className="profile__stats-value">{user.stats.snippets}</span>
            <span className="profile__stats-label">Snippets</span>
          </div>
          <div className="profile__stats-card profile__stats-card--highlight">
            <span className="profile__stats-value">{user.stats.doubtsResolved}</span>
            <span className="profile__stats-label">Dudas resueltas</span>
          </div>
        </div>
      </section>

      {/* Saved Snippets */}
      <section className="profile__section">
        <h2 className="profile__section-title">Snippets Guardados</h2>
        <div className="profile__snippets-grid">
          {user.savedSnippets.map(snippet => (
            <a key={snippet.id} href="#" className="profile__snippet-card">
              <span className="profile__snippet-lang">{snippet.language}</span>
              <span className="profile__snippet-title">{snippet.title}</span>
              <span className="profile__snippet-likes">❤️ {snippet.likes}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Tabs & Posts */}
      <nav className="profile__tabs">
        {['posts', 'replies', 'media', 'likes'].map(tab => (
          <button
            key={tab}
            className={`profile__tab ${activeTab === tab ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="profile__posts">
        {mockPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
