import React, { useState, useEffect } from "react";
import api from "@/services/api";
import "./AdminRequests.css";

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("pending");

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/center-requests?status=${statusFilter}`);
            const data = response.data || response;
            setRequests(data.data || []);
        } catch (error) {
            console.error("Error fetching center requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const handleApprove = async (requestId) => {
        const notes = window.prompt("Notas de aprobación (opcional):");
        try {
            await api.patch(`/center-requests/${requestId}/approve`, { admin_notes: notes });
            alert("Solicitud aprobada correctamente. El centro ha sido creado y el usuario promovido a profesor.");
            fetchRequests();
        } catch (error) {
            alert("Error al aprobar la solicitud: " + (error.message || "Error desconocido"));
        }
    };

    const handleReject = async (requestId) => {
        const notes = window.prompt("Motivo del rechazo (obligatorio):");
        if (!notes) return;
        try {
            await api.patch(`/center-requests/${requestId}/reject`, { admin_notes: notes });
            alert("Solicitud rechazada.");
            fetchRequests();
        } catch (error) {
            alert("Error al rechazar la solicitud");
        }
    };

    const handleDownloadJustificante = (requestId) => {
        const token = localStorage.getItem("token");
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/center-requests/${requestId}/justificante?token=${token}`, '_blank');
    };

    return (
        <div className="admin-requests">
            <div className="admin-actions">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select"
                >
                    <option value="pending">Pendientes</option>
                    <option value="approved">Aprobadas</option>
                    <option value="rejected">Rechazadas</option>
                    <option value="">Todas</option>
                </select>
            </div>

            <div className="requests-list">
                {loading ? (
                    <div className="text-center">Cargando solicitudes...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center">No hay solicitudes que mostrar.</div>
                ) : requests.map(req => (
                    <div key={req.id} className={`request-card status-${req.status}`}>
                        <div className="request-card-header">
                            <div className="requester-info">
                                <img src={req.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.username}`} alt="" className="avatar-sm" />
                                <div>
                                    <div className="font-bold">{req.full_name} (@{req.user.username})</div>
                                    <div className="text-sm text-gray">{req.user.email}</div>
                                </div>
                            </div>
                            <div className={`badge badge-${req.status}`}>{req.status.toUpperCase()}</div>
                        </div>

                        <div className="request-card-body">
                            <div className="request-detail">
                                <strong>Centro propuesto:</strong> {req.center_name}
                            </div>
                            <div className="request-detail">
                                <strong>Dominio:</strong> {req.domain}
                            </div>
                            <div className="request-detail">
                                <strong>Ubicación:</strong> {req.city || 'No especificada'}
                            </div>
                            {req.message && (
                                <div className="request-message">
                                    <strong>Mensaje:</strong> "{req.message}"
                                </div>
                            )}
                            {req.admin_notes && (
                                <div className="admin-notes">
                                    <strong>Notas del Admin:</strong> {req.admin_notes}
                                </div>
                            )}
                        </div>

                        <div className="request-card-footer">
                            <button
                                onClick={() => handleDownloadJustificante(req.id)}
                                className="btn-secondary"
                            >
                                Ver Justificante 📄
                            </button>

                            {req.status === 'pending' && (
                                <div className="footer-actions">
                                    <button onClick={() => handleApprove(req.id)} className="btn-approve">Aprobar ✅</button>
                                    <button onClick={() => handleReject(req.id)} className="btn-reject">Rechazar ❌</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
