import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Eye, Trash2, MessageSquare, Newspaper, Search, Filter, ExternalLink } from "lucide-react";
import "./AdminPosts.css";

export default function AdminPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [expandedPostId, setExpandedPostId] = useState(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            query.set("search", search);
            query.set("page", String(page));
            if (typeFilter !== "all") {
                query.set("type", typeFilter);
            }

            const response = await api.get(`/admin/posts?${query.toString()}`);
            // El API service ya devuelve el body del JSON
            setPosts(response.data || []);
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                total: response.total
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page, typeFilter]);

    const handleDeletePost = async (postId) => {
        if (!window.confirm("🚨 ¿ELIMINAR POST? Esta acción eliminará el contenido permanentemente.")) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
            if (pagination) setPagination({ ...pagination, total: pagination.total - 1 });
        } catch (error) {
            alert("Error al eliminar el post: " + (error?.message || "Error desconocido"));
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString("es-ES", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div className="admin-posts">
            <header className="admin-page-header">
                <h2 className="admin-page-title">Gestión de Publicaciones</h2>
                <p className="admin-page-subtitle">Monitorea y elimina contenido que infrinja las normas.</p>
            </header>

            <div className="admin-actions">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por contenido, usuario o username..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="admin-search"
                    />
                </div>

                <div className="filter-wrapper">
                    <Filter size={18} className="filter-icon" />
                    <select
                        className="admin-filter"
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="news">Noticias / Posts</option>
                        <option value="question">Preguntas</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Autor</th>
                            <th>Contenido</th>
                            <th>Tipo</th>
                            <th>Fecha</th>
                            <th>Estadísticas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && posts.length === 0 ? (
                            <tr><td colSpan="6" className="text-center">Cargando...</td></tr>
                        ) : posts.length === 0 ? (
                            <tr><td colSpan="6" className="text-center">No se encontraron publicaciones.</td></tr>
                        ) : posts.map(post => (
                            <tr 
                                key={post.id}
                                className={expandedPostId === post.id ? "row-expanded" : ""}
                                onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                            >
                                <td className="td-summary">
                                    <div className="user-info">
                                        <img
                                            src={post.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.username}`}
                                            alt=""
                                            className="user-avatar-sm"
                                        />
                                        <div>
                                            <div className="user-name">{post.user?.name}</div>
                                            <div className="user-handle">@{post.user?.username}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="td-content-preview">
                                    <div className="post-content-preview">
                                        {post.content ? (
                                            post.content.length > 60 
                                                ? post.content.substring(0, 60).replace(/<[^>]*>/g, '') + "..." 
                                                : post.content.replace(/<[^>]*>/g, '')
                                        ) : (
                                            <span className="empty-content">[Sin texto]</span>
                                        )}
                                        {post.image_url && <span className="attachment-badge">🖼️ Imagen</span>}
                                        {post.code_snippet && <span className="attachment-badge">💻 Código</span>}
                                    </div>
                                </td>

                                <td data-label="Tipo">
                                    <span className={`type-badge ${post.type}`}>
                                        {post.type === "question" ? <MessageSquare size={12} /> : <Newspaper size={12} />}
                                        {post.type === "question" ? "Pregunta" : "Noticia"}
                                    </span>
                                </td>

                                <td data-label="Fecha" className="td-date">
                                    {formatDate(post.created_at)}
                                </td>

                                <td data-label="Estadísticas">
                                    <div className="post-stats-mini">
                                        <span>❤️ {post.likes_count || 0}</span>
                                        <span>💬 {post.comments_count || 0}</span>
                                        <span>🔁 {post.reposts_count || 0}</span>
                                    </div>
                                </td>

                                <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                                    <div className="table-actions">
                                        <a 
                                            href={`/post/${post.id}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn-icon btn-view"
                                            title="Ver post original"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                        <button 
                                            onClick={() => handleDeletePost(post.id)} 
                                            className="btn-icon btn-delete" 
                                            title="Eliminar publicación"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="admin-pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
                    <span>Página {page} de {pagination.last_page}</span>
                    <button disabled={page === pagination.last_page} onClick={() => setPage(page + 1)}>Siguiente</button>
                </div>
            )}
        </div>
    );
}
