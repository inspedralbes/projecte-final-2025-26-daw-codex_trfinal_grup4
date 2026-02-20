import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
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

export default function PostInput({ onSubmit }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isQuestion, setIsQuestion] = useState(false);
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !code.trim()) return;
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      // Parse tags from input (comma or space separated)
      const parsedTags = tags
        .split(/[,\s]+/)
        .map(t => t.replace(/^#/, '').trim())
        .filter(t => t.length > 0)
        .slice(0, 5);

      const postData = {
        content: content.trim() || null,
        code_snippet: code.trim() || null,
        code_language: code.trim() ? codeLanguage : null,
        type: isQuestion ? 'question' : 'news',
        tags: parsedTags.length > 0 ? parsedTags : undefined,
      };

      if (onSubmit) {
        const result = await onSubmit(postData);
        if (result.success) {
          // Reset form
          setContent('');
          setCode('');
          setTags('');
          setShowCodeEditor(false);
          setIsQuestion(false);
        } else {
          setError(result.error || 'Error al publicar');
        }
      }
    } catch (err) {
      console.error('Error submitting post:', err);
      setError(err.message || 'Error al publicar');
    } finally {
      setSubmitting(false);
    }
  }, [content, code, codeLanguage, isQuestion, tags, submitting, onSubmit]);

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'developer'}`;

  return (
    <div className="post-input">
      <div className="post-input__avatar">
        <img 
          src={avatarUrl} 
          alt="Tu avatar"
        />
      </div>
      <form className="post-input__form" onSubmit={handleSubmit}>
        {error && (
          <div className="post-input__error">
            {error}
          </div>
        )}
        
        <textarea
          className="post-input__textarea"
          placeholder={isQuestion ? "¿Qué duda técnica tienes?" : "¿Qué quieres compartir hoy?"}
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
              <select 
                className="post-input__code-lang"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="bash">Bash</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="typescript">TypeScript</option>
                <option value="csharp">C#</option>
                <option value="plaintext">Plain Text</option>
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

        {/* Tags Input */}
        <div className="post-input__tags-row">
          <input
            type="text"
            className="post-input__tags-input"
            placeholder="Etiquetas (separadas por coma o espacio)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

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
            <button 
              type="button" 
              className={`post-input__tool post-input__tool--question ${isQuestion ? 'post-input__tool--active' : ''}`}
              onClick={() => setIsQuestion(!isQuestion)}
              title="Publicar duda"
            >
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
              disabled={(!content.trim() && !code.trim()) || submitting}
            >
              {submitting ? 'Publicando...' : (isQuestion ? 'Publicar Duda' : 'Publicar')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}