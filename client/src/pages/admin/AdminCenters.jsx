import React, { useState, useEffect } from "react";
import api from "@/services/api";
import "./AdminCenters.css";

export default function AdminCenters() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchCenters = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/centers?status=${statusFilter}`);
            const data = response.data || response;
            setCenters(data.data || []);
        } catch (error) {
            console.error("Error fetching centers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, [statusFilter]);

    const handleUpdateStatus = async (centerId, newStatus) => {
        try {
            await api.patch(`/centers/${centerId}/status`, { status: newStatus });
            fetchCenters();
        } catch (error) {
            alert("Error al actualizar el estado del centro");
        }
    };

    const handleDeleteCenter = async (centerId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este centro? Los usuarios asociados perderán su vinculación.")) {
            return;
        }
        try {
            await api.delete(`/centers/${centerId}`);
            fetchCenters();
        } catch (error) {
            alert("Error al eliminar el centro");
        }
    };

    const handleDownloadJustificante = async (centerId) => {
        const token = localStorage.getItem("token");
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        try {
            const response = await fetch(
                `${baseUrl}/center-requests/${centerId}/justificante`,
                { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } }
            );
            if (!response.ok) {
                alert('No se pudo cargar el justificante.');
                return;
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (err) {
            alert('Error al obtener el justificante.');
        }
    };

    return (
        <div className="admin-centers">
            <div className="admin-actions">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select"
                >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendientes</option>
                    <option value="rejected">Rechazados</option>
                </select>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Centro</th>
                            <th>Dominio</th>
                            <th>Ciudad</th>
                            <th>Usuarios</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center">Cargando...</td></tr>
                        ) : centers.length === 0 ? (
                            <tr><td colSpan="6" className="text-center">No se encontraron centros.</td></tr>
                        ) : centers.map(center => (
                            <tr key={center.id}>
                                <td>
                                    <div className="center-info">
                                        {center.logo && <img src={center.logo} alt="" className="center-logo-sm" />}
                                        <div className="center-name">{center.name}</div>
                                    </div>
                                </td>
                                <td>{center.domain}</td>
                                <td>{center.city || '-'}</td>
                                <td>{center.users_count || 0}</td>
                                <td>
                                    <select
                                        value={center.status}
                                        onChange={(e) => handleUpdateStatus(center.id, e.target.value)}
                                        className={`status-select status-${center.status}`}
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="active">Activo</option>
                                        <option value="rejected">Rechazado</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        {center.justificante && (
                                            <button
                                                onClick={() => handleDownloadJustificante(center.id)}
                                                className="btn-icon"
                                                title="Ver Justificante"
                                            >
                                                📄
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteCenter(center.id)}
                                            className="btn-icon btn-delete"
                                            title="Eliminar"
                                        >
                                            🗑️
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
