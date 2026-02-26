import React, { useState, useEffect } from "react";
import api from "@/services/api";
import "./AdminUserPosts.css";

export default function AdminUserPosts({ user, onBack }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get(`/admin/users/${user.id}/posts`);
                setPosts(response.data || response);
            } catch (error) {
                console.error("Error fetching user posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [user.id]);

    return (
        <div className="admin-user-posts">
            <div className="admin-sub-header">
                <button onClick={onBack} className="btn-back">← Volver a usuarios</button>
                <h2>Actividad de {user.name} (@{user.username})</h2>
            </div>

            <div className="audit-posts-list">
                {loading ? (
                    <div className="text-center">Cargando publicaciones...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center">Este usuario no tiene publicaciones.</div>
                ) : posts.map(post => (
                    <div key={post.id} className="audit-post-card">
                        <div className="audit-post-meta">
                            <span className="post-type badge">{post.type.toUpperCase()}</span>
                            <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="audit-post-content">
                            {post.content || <span className="text-italic">Sin contenido de texto</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
