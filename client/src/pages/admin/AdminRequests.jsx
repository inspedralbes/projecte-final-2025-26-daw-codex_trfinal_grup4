import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { CheckCircle, XCircle, FileText, CheckCheck, X, User, Building2, AtSign, Info } from "lucide-react";
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
                    <span className="ar-modal__icon">
                        {isApprove ? <CheckCircle size={32} color="#10b981" /> : <XCircle size={32} color="#ef4444" />}
                    </span>
                    <div>
                        <h3 className="ar-modal__title">
                            {isApprove ? "Aprobar Solicitud" : "Rechazar Solicitud"}
                        </h3>
                        <p className="ar-modal__subtitle">Revisa los datos antes de confirmar</p>
                    </div>
                </div>

                {/* Request Review Details */}
                <div className="ar-modal__review">
                    <div className="review-item">
                        <span className="review-label"><User size={14} /> Solicitante</span>
                        <div className="review-value">
                            <img src={request.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user?.username}`} alt="" className="review-avatar" />
                            <span>{request.full_name} (@{request.user?.username})</span>
                        </div>
                    </div>
                    <div className="review-item">
                        <span className="review-label"><Building2 size={14} /> Centro</span>
                        <div className="review-value">{request.center_name}</div>
                    </div>
                    <div className="review-item">
                        <span className="review-label"><AtSign size={14} /> Dominio</span>
                        <div className="review-value"><code>@{request.domain}</code></div>
                    </div>
                </div>

                {/* Info / Impact Box */}
                <div className="ar-modal__impact">
                    <div className="impact-header">
                        <Info size={16} />
                        <span>{isApprove ? "Impacto de la aprobación" : "Consecuencia del rechazo"}</span>
                    </div>
                    <div className="impact-body">
                        {isApprove ? (
                            <p>Se creará el centro oficial, se promocionará al usuario a <strong>Profesor</strong> y el centro quedará activo inmediatamente.</p>
                        ) : (
                            <p>La solicitud será denegada y se notificará al usuario con el motivo indicado debajo.</p>
                        )}
                    </div>
                </div>

                {/* Notes / reason textarea */}
                <div className="ar-modal__field">
                    <label className="ar-modal__label">
                        {isApprove
                            ? "Notas del administrador (opcional)"
                            : <>Motivo del rechazo <span className="ar-modal__required">*</span></>
                        }
                    </label>
                    <textarea
                        className="ar-modal__textarea"
                        rows={3}
                        placeholder={isApprove
                            ? "Ej: Documentación verificada."
                            : "Explica brevemente por qué se rechaza..."
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
                            : isApprove ? "Aprobar Ahora" : "Rechazar Solicitud"
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
            <span>{type === "success" ? <CheckCheck size={18} /> : <X size={18} />}</span>
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
                                <FileText size={14} style={{ marginRight: '0.375rem', display: 'inline' }} />
                                Ver Justificante
                            </button>

                            {req.status === 'pending' && (
                                <div className="footer-actions">
                                    <button
                                        onClick={() => setModal({ mode: "approve", request: req })}
                                        className="btn-approve"
                                    >
                                        <CheckCircle size={14} style={{ marginRight: '0.375rem', display: 'inline' }} />
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => setModal({ mode: "reject", request: req })}
                                        className="btn-reject"
                                    >
                                        <XCircle size={14} style={{ marginRight: '0.375rem', display: 'inline' }} />
                                        Rechazar
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
