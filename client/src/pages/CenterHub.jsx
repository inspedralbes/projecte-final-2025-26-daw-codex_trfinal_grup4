import React, { useState } from 'react';
import PostCard from '@/components/feed/PostCard';
import PostInput from '@/components/feed/PostInput';
import './CenterHub.css';

// Icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Mock data for center posts
const centerPosts = [
  {
    id: 101,
    type: 'post',
    author: {
      name: 'Prof. García',
      handle: '@profgarcia',
      avatar: 'profgarcia',
      verified: true,
      badge: 'Profesor'
    },
    content: '📢 AVISO IMPORTANTE: Las prácticas de empresa (FCT) para 2DAW comenzarán el 15 de marzo. Recordad revisar el documento de requisitos en la plataforma del centro. Cualquier duda, consultar en horario de tutorías.',
    tags: ['#FCT', '#2DAW', '#Importante'],
    timestamp: '1h',
    stats: { likes: 45, reposts: 12, comments: 8 },
    pinned: true
  },
  {
    id: 102,
    type: 'question',
    author: {
      name: 'Laura Fernández',
      handle: '@laurafernandez',
      avatar: 'laura2',
      verified: false,
      badge: '1DAM'
    },
    content: '¿Alguien de 2º tiene apuntes de la optativa de Desarrollo de Videojuegos? Quiero ir adelantando para el próximo curso.',
    tags: ['#1DAM', '#Videojuegos'],
    timestamp: '3h',
    stats: { likes: 8, reposts: 0, comments: 4 },
    solved: false
  },
  {
    id: 103,
    type: 'post',
    author: {
      name: 'Delegación Estudiantil',
      handle: '@delegacion',
      avatar: 'delegacion',
      verified: true,
      badge: 'Oficial'
    },
    content: '🎮 TORNEO DE ESPORTS del IES Jaume Balmes!\n\n📅 Fecha: 28 de febrero\n🕐 Hora: 16:00h\n📍 Aula de informática principal\n\nJuegos: League of Legends, Valorant, Rocket League\n\nInscripciones abiertas hasta el 25 de febrero. ¡Apuntaos!',
    tags: ['#Esports', '#Torneo', '#Evento'],
    timestamp: '5h',
    stats: { likes: 89, reposts: 34, comments: 23 }
  }
];

// Channel tags for the center
const channels = [
  { tag: '#Anuncios', posts: 45, color: 'rose' },
  { tag: '#1DAM', posts: 234, color: 'teal' },
  { tag: '#2DAM', posts: 189, color: 'teal' },
  { tag: '#1DAW', posts: 312, color: 'violet' },
  { tag: '#2DAW', posts: 278, color: 'violet' },
  { tag: '#ASIX', posts: 156, color: 'amber' },
  { tag: '#FCT', posts: 89, color: 'emerald' },
  { tag: '#OfertasEmpleo', posts: 67, color: 'cyan' },
];

export default function CenterHub() {
  const [activeChannel, setActiveChannel] = useState('all');

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
              <h1 className="center-hub__school-name">IES Jaume Balmes</h1>
              <span className="center-hub__private-badge">
                <LockIcon />
                Privado
              </span>
            </div>
            <p className="center-hub__school-location">Barcelona, Catalunya</p>
            <div className="center-hub__school-stats">
              <span><UsersIcon /> 487 miembros</span>
              <span><CalendarIcon /> Desde 2023</span>
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
          Todos
        </button>
        {channels.map(channel => (
          <button
            key={channel.tag}
            className={`center-hub__channel center-hub__channel--${channel.color} ${activeChannel === channel.tag ? 'center-hub__channel--active' : ''}`}
            onClick={() => setActiveChannel(channel.tag)}
          >
            {channel.tag}
            <span className="center-hub__channel-count">{channel.posts}</span>
          </button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <nav className="center-hub__nav">
        <button className="center-hub__nav-tab center-hub__nav-tab--active">
          Publicaciones
        </button>
        <button className="center-hub__nav-tab">
          Dudas
        </button>
        <button className="center-hub__nav-tab">
          Recursos
        </button>
        <button className="center-hub__nav-tab">
          Miembros
        </button>
      </nav>

      {/* Post Input */}
      <PostInput />

      {/* Posts */}
      <div className="center-hub__posts">
        {centerPosts.map((post, index) => (
          <div key={post.id} className="center-hub__post-wrapper">
            {post.pinned && (
              <div className="center-hub__pinned-badge">
                📌 Fijado
              </div>
            )}
            <PostCard 
              post={post} 
              className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
