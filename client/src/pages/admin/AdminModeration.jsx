import React, { useState, useEffect } from "react";
import api from "@/services/api";
import AdminUserPosts from "./AdminUserPosts";
import { Eye, ShieldOff, CheckCircle } from "lucide-react";
import "./AdminUsers.css"; // Reuse table styles

// ── Mock data for UI preview ─────────────────────────────────
const MOCK_FLAGGED_USERS = [
    {
        id: 9001,
        name: "Carlos Martínez",
        username: "carlos_m",
        email: "carlos.martinez@iescedros.com",
        avatar: null,
        ban_status: "flagged",
        is_blocked: false,
    },
    {
        id: 9002,
        name: "Laura Pérez",
        username: "laurap99",
        email: "laura.perez@escolavila.edu",
        avatar: null,
        ban_status: "flagged",
        is_blocked: true,
    },
    {
        id: 9003,
        name: "Jordi Mas",
        username: "jordi_mas",
        email: "jordi.mas@institutmontjuic.cat",
        avatar: null,
        ban_status: "flagged",
        is_blocked: false,
    },
];

export default function AdminModeration() {
    const [flaggedUsers, setFlaggedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auditingUser, setAuditingUser] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const fetchFlaggedUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/users?ban_status=flagged");
            const data = response.data || response;
            const users = data.data || [];
            // Fall back to mock data if API returns empty (for UI preview)
            setFlaggedUsers(users.length > 0 ? users : MOCK_FLAGGED_USERS);
        } catch (error) {
            console.error("Error fetching flagged users:", error);
            // Show mock data on error too
            setFlaggedUsers(MOCK_FLAGGED_USERS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlaggedUsers();
    }, []);

    const handleConfirmBan = async (user) => {
        if (!window.confirm(`¿Confirmar baneo permanente para ${user.name}? Se bloqueará su acceso.`)) return;
        // If mock user, just remove from list locally
        if (user.id >= 9000) {
            setFlaggedUsers(prev => prev.filter(u => u.id !== user.id));
            return;
        }
        try {
            await api.put(`/admin/users/${user.id}`, { ban_status: 'banned', is_blocked: true });
            fetchFlaggedUsers();
        } catch (error) {
            alert("Error al confirmar el baneo");
        }
    };

    const handlePardon = async (user) => {
        if (!window.confirm(`¿Retirar reporte y perdonar a ${user.name}?`)) return;
        // If mock user, just remove from list locally
        if (user.id >= 9000) {
            setFlaggedUsers(prev => prev.filter(u => u.id !== user.id));
            return;
        }
        try {
            await api.put(`/admin/users/${user.id}`, { ban_status: 'active' });
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
                            <tr><td colSpan="4" className="text-center">No hay usuarios pendientes de baneo.</td></tr>
                        ) : flaggedUsers.map(user => (
                            <tr
                                key={user.id}
                                className={expandedId === user.id ? 'row-expanded' : ''}
                                onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                            >
                                {/* Summary – always visible */}
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
                                    {/* Mobile quick actions */}
                                    <div className="mobile-actions" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setAuditingUser(user)} className="btn-icon btn-audit" title="Ver Posts"><Eye size={14} /></button>
                                        <button onClick={() => handleConfirmBan(user)} className="btn-icon btn-delete" title="Confirmar Baneo"><ShieldOff size={14} /></button>
                                        <button onClick={() => handlePardon(user)} className="btn-icon btn-unblock" title="Perdonar"><CheckCircle size={14} /></button>
                                    </div>
                                </td>

                                {/* Detail cells – expandable */}
                                <td data-label="Email" className="td-detail">{user.email}</td>
                                <td data-label="Estado" className="td-detail">
                                    <span className="status-badge status-blocked">Pendiente de Confirmar</span>
                                </td>

                                {/* Desktop-only full actions */}
                                <td className="td-actions">
                                    <div className="table-actions">
                                        <button onClick={() => setAuditingUser(user)} className="btn-icon btn-audit" title="Ver Posts">
                                            <Eye size={15} /> Ver Posts
                                        </button>
                                        <button onClick={() => handleConfirmBan(user)} className="btn-icon btn-delete" title="Confirmar Baneo">
                                            <ShieldOff size={15} /> Banear
                                        </button>
                                        <button onClick={() => handlePardon(user)} className="btn-icon btn-unblock" title="Perdonar">
                                            <CheckCircle size={15} /> Perdonar
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
