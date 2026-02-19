import React, { useState } from 'react';
import './PostInput.css';

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const QuestionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function PostInput() {
  const [content, setContent] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle post submission
    console.log({ content, code });
    setContent('');
    setCode('');
    setShowCodeEditor(false);
  };

  return (
    <div className="post-input">
      <div className="post-input__avatar">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=developer" 
          alt="Tu avatar"
        />
      </div>
      <form className="post-input__form" onSubmit={handleSubmit}>
        <textarea
          className="post-input__textarea"
          placeholder="¿Qué quieres compartir hoy?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={content.length > 100 ? 4 : 2}
        />
        
        {showCodeEditor && (
          <div className="post-input__code-editor">
            <div className="post-input__code-header">
              <span className="post-input__code-dots">
                <span /><span /><span />
              </span>
              <select className="post-input__code-lang">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="bash">Bash</option>
                <option value="sql">SQL</option>
              </select>
              <button 
                type="button" 
                className="post-input__code-close"
                onClick={() => setShowCodeEditor(false)}
              >
                ×
              </button>
            </div>
            <textarea
              className="post-input__code-textarea"
              placeholder="// Pega tu código aquí..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={6}
            />
          </div>
        )}

        <div className="post-input__actions">
          <div className="post-input__tools">
            <button 
              type="button" 
              className={`post-input__tool ${showCodeEditor ? 'post-input__tool--active' : ''}`}
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              title="Añadir código"
            >
              <CodeIcon />
            </button>
            <button type="button" className="post-input__tool" title="Añadir imagen">
              <ImageIcon />
            </button>
            <button type="button" className="post-input__tool" title="Añadir enlace">
              <LinkIcon />
            </button>
            <button type="button" className="post-input__tool post-input__tool--question" title="Publicar duda">
              <QuestionIcon />
            </button>
          </div>
          <div className="post-input__submit-area">
            <div className="post-input__visibility">
              <GlobeIcon />
              <span>Público</span>
            </div>
            <button 
              type="submit" 
              className="post-input__submit"
              disabled={!content.trim()}
            >
              Publicar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}