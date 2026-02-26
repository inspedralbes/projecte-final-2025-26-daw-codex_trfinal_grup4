import React, { useState, useEffect } from "react";
import api from "@/services/api";
import "./AdminRequests.css";

// ── Custom modal for approve / reject ───────────────────────
function ActionModal({ mode, request, onConfirm, onClose }) {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const isApprove = mode === "approve";

    const handleConfirm = async () => {
        if (!isApprove && !notes.trim()) return; // reject needs reason
        setLoading(true);
        await onConfirm(notes.trim() || undefined);
        setLoading(false);
    };

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="ar-modal-overlay" onClick={onClose}>
            <div
                className={`ar-modal ${isApprove ? "ar-modal--approve" : "ar-modal--reject"}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top accent line */}
                <div className="ar-modal__accent" />

                {/* Header */}
                <div className="ar-modal__header">
                    <span className="ar-modal__icon">{isApprove ? "✅" : "❌"}</span>
                    <div>
                        <h3 className="ar-modal__title">
                            {isApprove ? "Aprobar solicitud" : "Rechazar solicitud"}
                        </h3>
                        <p className="ar-modal__subtitle">
                            <strong>{request.full_name}</strong> — {request.center_name}
                        </p>
                    </div>
                </div>

                {/* Info box */}
                <div className="ar-modal__info">
                    {isApprove ? (
                        <>
                            <p>Al aprobar esta solicitud:</p>
                            <ul>
                                <li>🏫 Se <strong>creará el centro</strong> <em>{request.center_name}</em> con el dominio <code>@{request.domain}</code></li>
                                <li>👨‍🏫 El usuario <strong>@{request.user?.username}</strong> será <strong>promovido a Profesor</strong> y asignado como responsable del centro</li>
                                <li>📧 El centro estará activo de inmediato para todos los usuarios con ese dominio</li>
                            </ul>
                        </>
                    ) : (
                        <>
                            <p>Al rechazar esta solicitud el usuario recibirá una notificación con el motivo. <strong>Debes indicar el motivo del rechazo.</strong></p>
                        </>
                    )}
                </div>

                {/* Notes / reason textarea */}
                <div className="ar-modal__field">
                    <label className="ar-modal__label">
                        {isApprove
                            ? "Notas para el administrador (opcional)"
                            : <>Motivo del rechazo <span className="ar-modal__required">*</span></>
                        }
                    </label>
                    <textarea
                        className="ar-modal__textarea"
                        rows={3}
                        placeholder={isApprove
                            ? "Ej: Se ha verificado la documentación correctamente."
                            : "Ej: La documentación aportada no es suficiente para verificar la vinculación con el centro."
                        }
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Actions */}
                <div className="ar-modal__actions">
                    <button className="ar-modal__btn ar-modal__btn--cancel" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button
                        className={`ar-modal__btn ${isApprove ? "ar-modal__btn--approve" : "ar-modal__btn--reject"}`}
                        onClick={handleConfirm}
                        disabled={loading || (!isApprove && !notes.trim())}
                    >
                        {loading
                            ? "Procesando..."
                            : isApprove ? "Confirmar aprobación" : "Confirmar rechazo"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Toast notification ───────────────────────────────────────
function Toast({ message, type, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3500);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div className={`ar-toast ar-toast--${type}`}>
            <span>{type === "success" ? "✅" : "❌"}</span>
            <span>{message}</span>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────
export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("pending");

    // Modal state
    const [modal, setModal] = useState(null); // { mode: 'approve'|'reject', request }

    // Toast state
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

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

    const handleApprove = async (notes) => {
        try {
            await api.patch(`/center-requests/${modal.request.id}/approve`, { admin_notes: notes });
            setModal(null);
            showToast(`✅ Centro "${modal.request.center_name}" creado y @${modal.request.user?.username} promovido a Profesor.`, "success");
            fetchRequests();
        } catch (error) {
            setModal(null);
            showToast("Error al aprobar la solicitud: " + (error.message || "Error desconocido"), "error");
        }
    };

    const handleReject = async (notes) => {
        try {
            await api.patch(`/center-requests/${modal.request.id}/reject`, { admin_notes: notes });
            setModal(null);
            showToast("Solicitud rechazada correctamente.", "error");
            fetchRequests();
        } catch (error) {
            setModal(null);
            showToast("Error al rechazar la solicitud.", "error");
        }
    };

    const handleDownloadJustificante = async (requestId) => {
        const token = localStorage.getItem("token");
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        try {
            const response = await fetch(
                `${baseUrl}/center-requests/${requestId}/justificante`,
                { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
            );
            if (!response.ok) {
                showToast('No se pudo cargar el justificante.', 'error');
                return;
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (err) {
            showToast('Error al obtener el justificante.', 'error');
        }
    };

    return (
        <div className="admin-requests">
            {/* Filter */}
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

            {/* Requests list */}
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
                                    <button
                                        onClick={() => setModal({ mode: "approve", request: req })}
                                        className="btn-approve"
                                    >
                                        Aprobar ✅
                                    </button>
                                    <button
                                        onClick={() => setModal({ mode: "reject", request: req })}
                                        className="btn-reject"
                                    >
                                        Rechazar ❌
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom modal */}
            {modal && (
                <ActionModal
                    mode={modal.mode}
                    request={modal.request}
                    onConfirm={modal.mode === "approve" ? handleApprove : handleReject}
                    onClose={() => setModal(null)}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDone={() => setToast(null)}
                />
            )}
        </div>
    );
}
