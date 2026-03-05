import React, { useState, useEffect } from "react";
import api from "@/services/api";
import AdminUserPosts from "./AdminUserPosts";
import { Eye, Clock, Unlock, Ban, ShieldOff } from "lucide-react";
import "./AdminUsers.css";

/* ================================================================
   BanModal – shown when admin clicks block/ban on a user
   ================================================================ */
function BanModal({ user, onConfirm, onCancel }) {
    const [type, setType] = useState("timeout");        // "timeout" | "ban"
    const [reason, setReason] = useState("");
    const [duration, setDuration] = useState(30);      // numeric amount
    const [unit, setUnit] = useState("minutes");        // minutes | hours | days

    // Compute exact expiry date for preview
    const expiresAt = (() => {
        if (type !== "timeout") return null;
        const ms = {
            minutes: 60 * 1000,
            hours: 3600 * 1000,
            days: 86400 * 1000,
        }[unit] ?? 0;
        return new Date(Date.now() + duration * ms);
    })();

    const formatDate = (d) =>
        d ? d.toLocaleString("es-ES", {
            day: "2-digit", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        }) : null;

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm({
            type,
            ban_reason: reason.trim(),
            ban_expires_at: type === "timeout" ? expiresAt?.toISOString() : null,
        });
    };

    return (
        <div className="ban-modal-overlay" role="dialog" aria-modal="true">
            <div className="ban-modal">
                <h3 className="ban-modal__title">
                    {type === "timeout" ? "⏱ Timeout temporal" : "🚫 Baneo permanente"}
                </h3>
                <p className="ban-modal__user">
                    Aplicar sanción a <strong>{user.name}</strong> (@{user.username})
                </p>

                {/* Type selector */}
                <div className="ban-modal__type-row">
                    <button
                        type="button"
                        className={`ban-modal__type-btn ${type === "timeout" ? "ban-modal__type-btn--active-timeout" : ""}`}
                        onClick={() => setType("timeout")}
                    >
                        <Clock size={14} /> Timeout
                    </button>
                    <button
                        type="button"
                        className={`ban-modal__type-btn ${type === "ban" ? "ban-modal__type-btn--active-ban" : ""}`}
                        onClick={() => setType("ban")}
                    >
                        <ShieldOff size={14} /> Baneo permanente
                    </button>
                </div>

                {/* Reason */}
                <label className="ban-modal__label">Motivo *</label>
                <textarea
                    className="ban-modal__reason"
                    rows={3}
                    placeholder="Describe el motivo de la sanción..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                />
                <span className="ban-modal__char-count">{reason.length}/500</span>

                {/* Duration (only for timeout) */}
                {type === "timeout" && (
                    <div className="ban-modal__duration">
                        <label className="ban-modal__label">Duración</label>
                        <div className="ban-modal__duration-row">
                            <input
                                type="number"
                                className="ban-modal__duration-input"
                                min="1"
                                max="9999"
                                value={duration}
                                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                            <select
                                className="ban-modal__duration-unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                <option value="minutes">Minutos</option>
                                <option value="hours">Horas</option>
                                <option value="days">Días</option>
                            </select>
                        </div>
                        {expiresAt && (
                            <div className="ban-modal__expires-preview">
                                ⏰ El timeout acabará el <strong>{formatDate(expiresAt)}</strong>
                            </div>
                        )}
                    </div>
                )}

                <div className="ban-modal__actions">
                    <button className="ban-modal__btn ban-modal__btn--cancel" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button
                        className={`ban-modal__btn ${type === "ban" ? "ban-modal__btn--ban" : "ban-modal__btn--timeout"}`}
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                    >
                        {type === "timeout" ? "Aplicar Timeout" : "Banear Permanentemente"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ================================================================
   AdminUsers – main component
   ================================================================ */
export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [auditingUser, setAuditingUser] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [banTargetUser, setBanTargetUser] = useState(null); // user to ban/timeout

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/users?search=${search}&page=${page}`);
            const data = response.data || response;
            setUsers(data.data || []);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total
            });
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => { fetchUsers(); }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    // Apply ban or timeout via the dedicated endpoint
    const handleBanConfirm = async ({ type, ban_reason, ban_expires_at }) => {
        try {
            await api.post(`/admin/users/${banTargetUser.id}/ban`, {
                type,
                ban_reason,
                ban_expires_at,
            });
            setBanTargetUser(null);
            fetchUsers();
        } catch (error) {
            alert("Error al aplicar la sanción: " + (error?.message || "Error desconocido"));
        }
    };

    const handleUnban = async (user) => {
        if (!window.confirm(`¿Levantar la sanción de ${user.name}?`)) return;
        try {
            await api.post(`/admin/users/${user.id}/unban`);
            fetchUsers();
        } catch (error) {
            alert("Error al levantar la sanción");
        }
    };

    const handleChangeRole = async (user, newRole) => {
        try {
            await api.put(`/admin/users/${user.id}`, { role: newRole });
            fetchUsers();
        } catch (error) {
            alert("Error al cambiar el rol");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("🚨 ¿ELIMINAR USUARIO? Esta acción es irreversible.")) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            alert("Error al eliminar el usuario");
        }
    };

    const getBanBadge = (user) => {
        if (user.ban_status === "banned") return <span className="status-badge status-banned">BANEADO</span>;
        if (user.ban_status === "timeout") return <span className="status-badge status-timeout">Timeout</span>;
        if (user.ban_status === "flagged") return <span className="status-badge status-blocked">Reportado</span>;
        return <span className={`status-badge ${user.is_blocked ? "status-blocked" : "status-active"}`}>{user.is_blocked ? "Bloqueado" : "Activo"}</span>;
    };

    const formatExpiry = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleString("es-ES", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    if (auditingUser) {
        return <AdminUserPosts user={auditingUser} onBack={() => setAuditingUser(null)} />;
    }

    return (
        <div className="admin-users">
            {banTargetUser && (
                <BanModal
                    user={banTargetUser}
                    onConfirm={handleBanConfirm}
                    onCancel={() => setBanTargetUser(null)}
                />
            )}

            <div className="admin-actions">
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o username..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="admin-search"
                />
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado / Sanción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && users.length === 0 ? (
                            <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" className="text-center">No se encontraron usuarios.</td></tr>
                        ) : users.map(user => (
                            <tr
                                key={user.id}
                                className={expandedUserId === user.id ? "row-expanded" : ""}
                                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                            >
                                {/* Summary */}
                                <td className="td-summary">
                                    <div className="user-info">
                                        <img
                                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                            alt=""
                                            className="user-avatar-sm"
                                        />
                                        <div>
                                            <div className="user-name">{user.name}</div>
                                            <div className="user-handle">@{user.username}</div>
                                        </div>
                                    </div>
                                    <div className="mobile-actions" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setAuditingUser(user)} className="btn-icon" title="Ver Actividad"><Eye size={14} /></button>
                                        {user.is_blocked ? (
                                            <button onClick={() => handleUnban(user)} className="btn-icon btn-unblock" title="Levantar sanción"><Unlock size={14} /></button>
                                        ) : (
                                            <button onClick={() => setBanTargetUser(user)} className="btn-icon btn-block" title="Sancionar"><Clock size={14} /></button>
                                        )}
                                    </div>
                                </td>

                                <td data-label="Email" className="td-detail">{user.email}</td>

                                <td data-label="Rol" className="td-detail" onClick={(e) => e.stopPropagation()}>
                                    <select value={user.role} onChange={(e) => handleChangeRole(user, e.target.value)} className="role-select">
                                        <option value="userNormal">User</option>
                                        <option value="student">Estudiante</option>
                                        <option value="teacher">Profesor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>

                                <td data-label="Estado" className="td-detail">
                                    {getBanBadge(user)}
                                    {user.ban_reason && (
                                        <div className="ban-reason-cell" title={user.ban_reason}>
                                            📋 {user.ban_reason.length > 40 ? user.ban_reason.slice(0, 40) + "…" : user.ban_reason}
                                        </div>
                                    )}
                                    {user.ban_expires_at && (
                                        <div className="ban-expiry-cell">
                                            ⏰ Hasta: {formatExpiry(user.ban_expires_at)}
                                        </div>
                                    )}
                                </td>

                                <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                                    <div className="table-actions">
                                        <button onClick={() => setAuditingUser(user)} className="btn-icon btn-audit" title="Ver Actividad">
                                            <Eye size={15} />
                                        </button>
                                        {user.is_blocked ? (
                                            <button onClick={() => handleUnban(user)} className="btn-icon btn-unblock" title="Levantar sanción">
                                                <Unlock size={15} /> Levantar
                                            </button>
                                        ) : (
                                            <button onClick={() => setBanTargetUser(user)} className="btn-icon btn-block" title="Sancionar">
                                                <Clock size={15} /> Sancionar
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteUser(user.id)} className="btn-icon btn-delete" title="Eliminar usuario">
                                            <Ban size={15} />
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

