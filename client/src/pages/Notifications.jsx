import React, { useState } from 'react';
import './Notifications.css';

// Notification Icons
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const RepostIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const FollowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const MentionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
);

const SchoolIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    type: 'school',
    title: 'Nuevo anuncio del centro',
    message: 'Las fechas de los exámenes finales de M06 ya están disponibles.',
    timestamp: 'Hace 10 min',
    read: false,
    center: 'IES Jaume Balmes'
  },
  {
    id: 2,
    type: 'like',
    user: { name: 'Laura García', handle: '@lauradev', avatar: 'laura' },
    message: 'le gustó tu snippet de Docker',
    timestamp: 'Hace 25 min',
    read: false
  },
  {
    id: 3,
    type: 'answer',
    user: { name: 'Jordi Mas', handle: '@jordi_code', avatar: 'jordi' },
    message: 'respondió tu duda sobre JWT',
    preview: '"Para refrescar el token puedes usar un middleware que..."',
    timestamp: 'Hace 1h',
    read: false
  },
  {
    id: 4,
    type: 'follow',
    user: { name: 'Anna Puig', handle: '@annapuig', avatar: 'anna', badge: '2DAW' },
    message: 'empezó a seguirte',
    timestamp: 'Hace 2h',
    read: true
  },
  {
    id: 5,
    type: 'mention',
    user: { name: 'Marc Serra', handle: '@marcserra', avatar: 'marc' },
    message: 'te mencionó en un post',
    preview: '"@marcperez tienes razón, el hook useEffect..."',
    timestamp: 'Hace 3h',
    read: true
  },
  {
    id: 6,
    type: 'repost',
    user: { name: 'Elena Ruiz', handle: '@elena_dev', avatar: 'elena' },
    message: 'repostó tu snippet',
    timestamp: 'Hace 5h',
    read: true
  },
  {
    id: 7,
    type: 'snippet-saved',
    user: { name: 'Pau Ferrer', handle: '@pauferrer', avatar: 'pau' },
    message: 'guardó tu snippet "Custom Hook useDebounce"',
    timestamp: 'Ayer',
    read: true
  },
  {
    id: 8,
    type: 'accepted',
    message: 'Tu respuesta fue marcada como solución',
    preview: 'Duda: "¿Cómo optimizar consultas en Laravel?"',
    points: 15,
    timestamp: 'Ayer',
    read: true
  },
  {
    id: 9,
    type: 'school',
    title: 'Entrega disponible',
    message: 'Ya puedes entregar la práctica del módulo M07. Fecha límite: 15 Ene.',
    timestamp: 'Hace 2 días',
    read: true,
    center: 'IES Jaume Balmes'
  },
  {
    id: 10,
    type: 'milestone',
    message: '¡Has alcanzado 500 puntos!',
    description: 'Sigue compartiendo y ayudando a la comunidad.',
    timestamp: 'Hace 3 días',
    read: true
  }
];

const getNotificationIcon = (type) => {
  switch (type) {
    case 'like': return <HeartIcon />;
    case 'comment':
    case 'answer': return <CommentIcon />;
    case 'repost': return <RepostIcon />;
    case 'follow': return <FollowIcon />;
    case 'mention': return <MentionIcon />;
    case 'school': return <SchoolIcon />;
    case 'snippet-saved': return <CodeIcon />;
    case 'accepted': return <CheckIcon />;
    case 'milestone': return <StarIcon />;
    default: return <CommentIcon />;
  }
};

const getIconClass = (type) => {
  switch (type) {
    case 'like': return 'notif__icon--like';
    case 'follow': return 'notif__icon--follow';
    case 'mention': return 'notif__icon--mention';
    case 'school': return 'notif__icon--school';
    case 'accepted':
    case 'milestone': return 'notif__icon--success';
    case 'snippet-saved': return 'notif__icon--code';
    default: return 'notif__icon--default';
  }
};

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filters = [
    { id: 'all', label: 'Todo' },
    { id: 'social', label: 'Social' },
    { id: 'school', label: 'Centro' },
    { id: 'code', label: 'Código' }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'social') return ['like', 'follow', 'repost', 'mention'].includes(n.type);
    if (filter === 'school') return n.type === 'school';
    if (filter === 'code') return ['answer', 'snippet-saved', 'accepted'].includes(n.type);
    return true;
  });

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="notifications">
      {/* Header */}
      <header className="notif__header">
        <div className="notif__header-top">
          <h1 className="notif__title">Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="notif__badge">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="notif__mark-read" onClick={markAllRead}>
            Marcar todo como leído
          </button>
        )}
      </header>

      {/* Filters */}
      <nav className="notif__filters">
        {filters.map(f => (
          <button
            key={f.id}
            className={`notif__filter ${filter === f.id ? 'notif__filter--active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {/* Notifications List */}
      <div className="notif__list">
        {filteredNotifications.map(notif => (
          <article
            key={notif.id}
            className={`notif__item ${!notif.read ? 'notif__item--unread' : ''}`}
          >
            <div className={`notif__icon ${getIconClass(notif.type)}`}>
              {getNotificationIcon(notif.type)}
            </div>

            <div className="notif__content">
              {notif.user && (
                <div className="notif__user">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.user.avatar}`}
                    alt={notif.user.name}
                    className="notif__avatar"
                  />
                </div>
              )}

              <div className="notif__body">
                {notif.type === 'school' ? (
                  <>
                    <span className="notif__center">{notif.center}</span>
                    <p className="notif__headline">{notif.title}</p>
                    <p className="notif__text">{notif.message}</p>
                  </>
                ) : notif.type === 'milestone' ? (
                  <>
                    <p className="notif__headline">{notif.message}</p>
                    <p className="notif__text">{notif.description}</p>
                  </>
                ) : notif.type === 'accepted' ? (
                  <>
                    <p className="notif__headline">{notif.message}</p>
                    <p className="notif__preview">{notif.preview}</p>
                    <span className="notif__points">+{notif.points} puntos</span>
                  </>
                ) : (
                  <>
                    <p className="notif__headline">
                      <strong>{notif.user?.name}</strong> {notif.message}
                    </p>
                    {notif.preview && (
                      <p className="notif__preview">{notif.preview}</p>
                    )}
                    {notif.user?.badge && (
                      <span className="notif__user-badge">{notif.user.badge}</span>
                    )}
                  </>
                )}
              </div>

              <span className="notif__time">{notif.timestamp}</span>
            </div>
          </article>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="notif__empty">
          <p>No hay notificaciones en esta categoría</p>
        </div>
      )}
    </div>
  );
}
