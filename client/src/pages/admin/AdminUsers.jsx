import React, { useState, useEffect } from "react";
import api from "@/services/api";
import AdminUserPosts from "./AdminUserPosts";
import { Eye, Clock, Unlock, Ban } from "lucide-react";
import "./AdminUsers.css";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [auditingUser, setAuditingUser] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);

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
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleToggleBlock = async (user) => {
        const confirmMsg = user.is_blocked
            ? "¿Desbloquear a este usuario?"
            : "¿Bloquear temporalmente a este usuario?";
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.put(`/admin/users/${user.id}`, {
                is_blocked: !user.is_blocked
            });
            fetchUsers();
        } catch (error) {
            alert("Error al actualizar el usuario");
        }
    };

    const handleChangeRole = async (user, newRole) => {
        try {
            await api.put(`/admin/users/${user.id}`, {
                role: newRole
            });
            fetchUsers();
        } catch (error) {
            alert("Error al cambiar el rol");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("🚨 ¿BANEAR PERMANENTEMENTE? Esta acción eliminará al usuario y es irreversible.")) {
            return;
        }
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            alert("Error al eliminar el usuario");
        }
    };

    if (auditingUser) {
        return <AdminUserPosts user={auditingUser} onBack={() => setAuditingUser(null)} />;
    }

    return (
        <div className="admin-users">
            <div className="admin-actions">
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o username..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
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
                            <th>Estado</th>
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
                                className={expandedUserId === user.id ? 'row-expanded' : ''}
                                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                            >
                                {/* Summary – always visible on mobile */}
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
                                    {/* Mobile-only quick actions */}
                                    <div className="mobile-actions" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setAuditingUser(user)} className="btn-icon" title="Ver Actividad"><Eye size={14} /></button>
                                        <button
                                            onClick={() => handleToggleBlock(user)}
                                            className={`btn-icon ${user.is_blocked ? 'btn-unblock' : 'btn-block'}`}
                                            title={user.is_blocked ? 'Quitar Time out' : 'Time out'}
                                        >{user.is_blocked ? <Unlock size={14} /> : <Clock size={14} />}</button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!window.confirm(`¿Marcar a ${user.name} para baneo?`)) return;
                                                try { await api.put(`/admin/users/${user.id}`, { ban_status: 'flagged' }); fetchUsers(); } catch (e) { alert('Error'); }
                                            }}
                                            className="btn-icon btn-delete"
                                            title="Reportar para Baneo"
                                        ><Ban size={14} /></button>
                                    </div>
                                </td>

                                {/* Detail cells – expandable on click */}
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
                                    {user.ban_status === 'flagged' ? (
                                        <span className="status-badge status-blocked">Reportado</span>
                                    ) : user.ban_status === 'banned' ? (
                                        <span className="status-badge status-blocked">BANEADO</span>
                                    ) : (
                                        <span className={`status-badge ${user.is_blocked ? 'status-blocked' : 'status-active'}`}>
                                            {user.is_blocked ? 'En Time out' : 'Activo'}
                                        </span>
                                    )}
                                </td>

                                {/* Desktop-only full actions column */}
                                <td className="td-actions">
                                    <div className="table-actions">
                                        <button onClick={() => setAuditingUser(user)} className="btn-icon btn-audit" title="Ver Actividad (Audit)"><Eye size={15} /></button>
                                        <button
                                            onClick={() => handleToggleBlock(user)}
                                            className={`btn-icon ${user.is_blocked ? 'btn-unblock' : 'btn-block'}`}
                                            title={user.is_blocked ? 'Quitar Time out' : 'Poner en Time out'}
                                        >{user.is_blocked ? <Unlock size={15} /> : <Clock size={15} />}</button>
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm(`¿Marcar a ${user.name} para baneo? Pasará a la lista de moderación.`)) return;
                                                try { await api.put(`/admin/users/${user.id}`, { ban_status: 'flagged' }); fetchUsers(); } catch (e) { alert('Error'); }
                                            }}
                                            className="btn-icon btn-delete"
                                            title="Reportar para Baneo"
                                        ><Ban size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="admin-pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Anterior
                    </button>
                    <span>Página {page} de {pagination.last_page}</span>
                    <button
                        disabled={page === pagination.last_page}
                        onClick={() => setPage(page + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}
