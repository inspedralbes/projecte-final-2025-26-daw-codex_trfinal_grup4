import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocket } from '@/context/SocketContext';
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

const LoadingSpinner = () => (
  <div className="notif__spinner">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
    </svg>
  </div>
);

// Map API notification types to icon types
const mapNotificationType = (type) => {
  const typeMap = {
    'like': 'like',
    'comment': 'comment',
    'reply': 'answer',
    'follow': 'follow',
    'mention': 'mention',
    'repost': 'repost',
    'solution': 'accepted',
    'center': 'school',
    'milestone': 'milestone',
    'bookmark': 'snippet-saved'
  };
  return typeMap[type] || 'comment';
};

// Format timestamp to relative time
const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const getNotificationIcon = (type) => {
  const mappedType = mapNotificationType(type);
  switch (mappedType) {
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
  const mappedType = mapNotificationType(type);
  switch (mappedType) {
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
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    addNotification 
  } = useNotifications();
  const { onNewNotification } = useSocket();

  // Listen for real-time notifications
  useEffect(() => {
    const unsubscribe = onNewNotification((newNotif) => {
      addNotification(newNotif);
    });
    return unsubscribe;
  }, [onNewNotification, addNotification]);

  const filters = [
    { id: 'all', label: 'Todo' },
    { id: 'social', label: 'Social' },
    { id: 'school', label: 'Centro' },
    { id: 'code', label: 'Código' }
  ];

  const filteredNotifications = notifications.filter(n => {
    const mappedType = mapNotificationType(n.type);
    if (filter === 'all') return true;
    if (filter === 'social') return ['like', 'follow', 'repost', 'mention'].includes(mappedType);
    if (filter === 'school') return mappedType === 'school';
    if (filter === 'code') return ['answer', 'snippet-saved', 'accepted', 'comment'].includes(mappedType);
    return true;
  });

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read_at) {
      try {
        await markAsRead(notif.id);
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
    // TODO: Navigate to relevant content based on notification type
  };

  if (loading) {
    return (
      <div className="notifications">
        <header className="notif__header">
          <div className="notif__header-top">
            <h1 className="notif__title">Notificaciones</h1>
          </div>
        </header>
        <div className="notif__loading">
          <LoadingSpinner />
          <p>Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications">
        <header className="notif__header">
          <div className="notif__header-top">
            <h1 className="notif__title">Notificaciones</h1>
          </div>
        </header>
        <div className="notif__error">
          <p>Error al cargar notificaciones: {error}</p>
        </div>
      </div>
    );
  }

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
          <button className="notif__mark-read" onClick={handleMarkAllRead}>
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
        {filteredNotifications.map(notif => {
          const mappedType = mapNotificationType(notif.type);
          const isRead = !!notif.read_at;
          
          return (
            <article
              key={notif.id}
              className={`notif__item ${!isRead ? 'notif__item--unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className={`notif__icon ${getIconClass(notif.type)}`}>
                {getNotificationIcon(notif.type)}
              </div>

              <div className="notif__content">
                {notif.sender && (
                  <div className="notif__user">
                    <img
                      src={notif.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.sender.username}`}
                      alt={notif.sender.name}
                      className="notif__avatar"
                    />
                  </div>
                )}

                <div className="notif__body">
                  {mappedType === 'school' ? (
                    <>
                      <span className="notif__center">{notif.data?.center_name || 'Centro'}</span>
                      <p className="notif__headline">{notif.data?.title || notif.title}</p>
                      <p className="notif__text">{notif.message || notif.data?.message}</p>
                    </>
                  ) : mappedType === 'milestone' ? (
                    <>
                      <p className="notif__headline">{notif.message}</p>
                      <p className="notif__text">{notif.data?.description}</p>
                    </>
                  ) : mappedType === 'accepted' ? (
                    <>
                      <p className="notif__headline">{notif.message}</p>
                      {notif.data?.preview && (
                        <p className="notif__preview">{notif.data.preview}</p>
                      )}
                      {notif.data?.points && (
                        <span className="notif__points">+{notif.data.points} puntos</span>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="notif__headline">
                        {notif.sender && <strong>{notif.sender.name}</strong>} {notif.message}
                      </p>
                      {notif.data?.preview && (
                        <p className="notif__preview">{notif.data.preview}</p>
                      )}
                      {notif.sender?.badge && (
                        <span className="notif__user-badge">{notif.sender.badge}</span>
                      )}
                    </>
                  )}
                </div>

                <span className="notif__time">{formatTimestamp(notif.created_at)}</span>
              </div>
            </article>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="notif__empty">
          <p>No hay notificaciones en esta categoría</p>
        </div>
      )}
    </div>
  );
}
