import React, { useState, useRef, useEffect } from 'react';
import {
    IconImage, IconGif, IconPoll, IconSmile, IconLocation, IconUser
} from '@/components/ui/Icons';
import { mockApi } from '@/services/mockApi';

const PostInput = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [user, setUser] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        mockApi.getCurrentUser().then(setUser);
    }, []);

    const handleChange = (e) => {
        setContent(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) return;
        const newPost = await mockApi.createPost(content);
        setContent('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        if (onPostCreated) onPostCreated(newPost);
    };

    return (
        <div className="post-input-container">
            <div className="post-avatar">
                {user ? <img src={user.avatar} className="avatar-img" /> : <div className="avatar-placeholder" />}
            </div>
            <div className="post-content-area">
                <textarea
                    ref={textareaRef}
                    className="post-textarea"
                    placeholder="Què està passant?!"
                    value={content}
                    onChange={handleChange}
                    rows={1}
                />
                <div className="post-tools">
                    <div className="media-icons">
                        <div className="icon-btn"><IconImage className="tool-icon" /></div>
                        <div className="icon-btn"><IconGif className="tool-icon" /></div>
                        <div className="icon-btn"><IconPoll className="tool-icon" /></div>
                        <div className="icon-btn"><IconSmile className="tool-icon" /></div>
                        <div className="icon-btn"><IconLocation className="tool-icon" /></div>
                    </div>
                    <button
                        className="post-submit-btn"
                        disabled={!content.trim()}
                        onClick={handleSubmit}
                    >
                        Publicar
                    </button>
                </div>
            </div>
            <style>{`
                .post-input-container {
                    display: flex;
                    padding: 16px;
                    border: 1px solid var(--color-border);
                    background-color: var(--color-surface);
                    border-radius: var(--radius-lg);
                    margin-bottom: 24px;
                }
                .post-avatar {
                    margin-right: 12px;
                }
                .avatar-img, .avatar-placeholder {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-sm); /* Square avatar */
                    background-color: var(--color-background);
                }
                .post-content-area {
                    flex-grow: 1;
                }
                .post-textarea {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: var(--color-text);
                    font-size: 18px;
                    resize: none;
                    outline: none;
                    min-height: 52px;
                    padding-top: 8px;
                    font-family: var(--font-family-base);
                }
                .post-textarea::placeholder {
                    color: var(--color-text-secondary);
                }
                .post-tools {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 12px;
                    border-top: 1px dashed var(--color-border); /* Dashed for tech feel */
                    padding-top: 12px;
                }
                .media-icons {
                    display: flex;
                    gap: 4px;
                }
                .icon-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    color: var(--color-primary);
                    transition: background-color var(--transition-fast);
                }
                .icon-btn:hover {
                    background-color: rgba(14, 165, 233, 0.1);
                }
                .tool-icon {
                    width: 18px;
                    height: 18px;
                }
                .post-submit-btn {
                    background-color: var(--color-primary);
                    color: #fff;
                    border: none;
                    border-radius: var(--radius-md);
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: var(--font-weight-medium);
                    cursor: pointer;
                    opacity: 1;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                }
                .post-submit-btn:disabled {
                    opacity: 0.5;
                    cursor: default;
                    box-shadow: none;
                }
                .post-submit-btn:not(:disabled):hover {
                    background-color: var(--color-primary-hover);
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
};

export default PostInput;
