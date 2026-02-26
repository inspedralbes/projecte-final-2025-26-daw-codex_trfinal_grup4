import React, { useState, useEffect } from "react";
import api from "@/services/api";
import AdminUserPosts from "./AdminUserPosts";
import "./AdminUsers.css"; // Reuse table styles

export default function AdminModeration() {
    const [flaggedUsers, setFlaggedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auditingUser, setAuditingUser] = useState(null);

    const fetchFlaggedUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/users?ban_status=flagged");
            const data = response.data || response;
            setFlaggedUsers(data.data || []);
        } catch (error) {
            console.error("Error fetching flagged users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlaggedUsers();
    }, []);

    const handleConfirmBan = async (user) => {
        if (!window.confirm(`¿Confirmar baneo permanente para ${user.name}? Se bloqueará su acceso.`)) return;
        try {
            await api.put(`/admin/users/${user.id}`, {
                ban_status: 'banned',
                is_blocked: true
            });
            fetchFlaggedUsers();
        } catch (error) {
            alert("Error al confirmar el baneo");
        }
    };

    const handlePardon = async (user) => {
        if (!window.confirm(`¿Retirar reporte y perdonar a ${user.name}?`)) return;
        try {
            await api.put(`/admin/users/${user.id}`, {
                ban_status: 'active'
            });
            fetchFlaggedUsers();
        } catch (error) {
            alert("Error al perdonar al usuario");
        }
    };

    if (auditingUser) {
        return <AdminUserPosts user={auditingUser} onBack={() => setAuditingUser(null)} />;
    }

    return (
        <div className="admin-users">
            <header className="admin-page-header">
                <h2 className="admin-page-title">Moderación: Usuarios Reportados</h2>
                <p className="admin-page-subtitle">Revisa los posts y decide si confirmar el baneo.</p>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Estado Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center">Cargando...</td></tr>
                        ) : flaggedUsers.length === 0 ? (
                            <tr><td colSpan="4" className="text-center">No hay usuarios pendientes de baneo. ✨</td></tr>
                        ) : flaggedUsers.map(user => (
                            <tr key={user.id}>
                                <td>
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
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className="status-badge status-blocked">Pendiente de Confirmar</span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            onClick={() => setAuditingUser(user)}
                                            className="btn-icon btn-audit"
                                            title="Ver Posts"
                                        >
                                            👁️ Ver Posts
                                        </button>
                                        <button
                                            onClick={() => handleConfirmBan(user)}
                                            className="btn-icon btn-delete"
                                            title="Confirmar Baneo"
                                        >
                                            💀 Banear
                                        </button>
                                        <button
                                            onClick={() => handlePardon(user)}
                                            className="btn-icon btn-unblock"
                                            title="Perdonar"
                                        >
                                            ✅ Perdonar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
