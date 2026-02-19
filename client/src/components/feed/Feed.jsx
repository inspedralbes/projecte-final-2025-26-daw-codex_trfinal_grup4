import React, { useState } from 'react';
import PostInput from './PostInput';
import PostCard from './PostCard';
import './Feed.css';

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    type: 'snippet',
    author: {
      name: 'Ana García',
      handle: '@anagarcia',
      avatar: 'ana',
      verified: true,
      badge: 'Profesora'
    },
    content: 'Tip del día: Usar `useMemo` en React solo tiene sentido cuando el cálculo es costoso. No lo uses para todo.',
    code: `// ✅ Buena práctica
const expensiveValue = useMemo(() => {
  return items.reduce((acc, item) => {
    return acc + complexCalculation(item);
  }, 0);
}, [items]);

// ❌ Innecesario
const name = useMemo(() => user.name, [user.name]);`,
    language: 'javascript',
    tags: ['#React', '#Performance'],
    timestamp: '2h',
    stats: { likes: 234, reposts: 45, comments: 23 }
  },
  {
    id: 2,
    type: 'question',
    author: {
      name: 'Carlos López',
      handle: '@carlosdev',
      avatar: 'carlos',
      verified: false,
      badge: '2DAW'
    },
    content: '¿Alguien sabe cómo solucionar este error de CORS en Laravel cuando hago peticiones desde React? He probado con el middleware pero sigue sin funcionar.',
    code: `Access to XMLHttpRequest at 'http://api.example.com/posts'
from origin 'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
    language: 'plaintext',
    tags: ['#Laravel', '#CORS', '#Help'],
    timestamp: '4h',
    stats: { likes: 12, reposts: 2, comments: 8 },
    solved: false
  },
  {
    id: 3,
    type: 'post',
    author: {
      name: 'María Ruiz',
      handle: '@mariaruiz',
      avatar: 'maria',
      verified: false,
      badge: '2DAM'
    },
    content: '¡Por fin terminé mi proyecto de FCT! 🎉 Una app de gestión de inventarios con Spring Boot + Vue. Aprendí muchísimo sobre arquitectura limpia y testing. Gracias a todos los que me ayudaron con las dudas!',
    tags: ['#FCT', '#SpringBoot', '#Vue'],
    timestamp: '6h',
    stats: { likes: 189, reposts: 34, comments: 42 }
  },
  {
    id: 4,
    type: 'resource',
    author: {
      name: 'David Martín',
      handle: '@davidmartin',
      avatar: 'david',
      verified: true,
      badge: 'Alumni'
    },
    content: 'Os comparto este recurso increíble para aprender Docker de forma práctica. Viene con ejercicios interactivos y explica conceptos desde cero hasta Kubernetes.',
    link: {
      url: 'https://docker-curriculum.com',
      title: 'Docker Curriculum',
      description: 'Aprende Docker desde cero con ejercicios prácticos',
      image: 'docker'
    },
    tags: ['#Docker', '#DevOps', '#Tutorial'],
    timestamp: '8h',
    stats: { likes: 156, reposts: 78, comments: 15 }
  },
  {
    id: 5,
    type: 'snippet',
    author: {
      name: 'Laura Sánchez',
      handle: '@laurasanchez',
      avatar: 'laura',
      verified: false,
      badge: '1ASIX'
    },
    content: 'Script de bash para automatizar backups de MySQL. Simple pero efectivo. ¿Qué mejorarías?',
    code: `#!/bin/bash
# Backup MySQL Database

DB_USER="root"
DB_PASS="password"
DB_NAME="myapp"
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME_$DATE.sql.gz

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DB_NAME_$DATE.sql.gz"`,
    language: 'bash',
    tags: ['#Bash', '#MySQL', '#Backup'],
    timestamp: '12h',
    stats: { likes: 67, reposts: 23, comments: 9 }
  }
];

export default function Feed() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="feed">
      {/* Header */}
      <header className="feed__header">
        <h1 className="feed__title">Feed Global</h1>
        <nav className="feed__tabs">
          <button 
            className={`feed__tab ${activeTab === 'all' ? 'feed__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Para ti
          </button>
          <button 
            className={`feed__tab ${activeTab === 'following' ? 'feed__tab--active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Siguiendo
          </button>
          <button 
            className={`feed__tab ${activeTab === 'questions' ? 'feed__tab--active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Dudas
          </button>
        </nav>
      </header>

      {/* Post Input */}
      <PostInput />

      {/* Posts */}
      <div className="feed__posts">
        {mockPosts.map((post, index) => (
          <PostCard 
            key={post.id} 
            post={post} 
            className={`animate-slideUp stagger-${Math.min(index + 1, 5)}`}
          />
        ))}
      </div>
    </div>
  );
}