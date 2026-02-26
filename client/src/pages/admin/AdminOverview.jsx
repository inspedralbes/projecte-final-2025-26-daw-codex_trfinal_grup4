import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import "./AdminOverview.css";

export default function AdminOverview() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/admin/stats");
                setStats(response.data || response);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="admin-loading">Cargando estadísticas...</div>;

    const statItems = [
        { label: "Usuarios Totales", value: stats?.total_users || 0, color: "teal", icon: "👥" },
        { label: "Centros", value: stats?.total_centers || 0, color: "violet", icon: "🏢" },
        { label: "Solicitudes", value: stats?.pending_requests || 0, color: "amber", icon: "📩" },
        { label: "Publicaciones", value: stats?.total_posts || 0, color: "emerald", icon: "📝" },
    ];

    // Mock data for charts if backend doesn't provide enough history yet
    const areaData = [
        { name: 'Lun', users: 120, posts: 45 },
        { name: 'Mar', users: 150, posts: 52 },
        { name: 'Mie', users: 180, posts: 61 },
        { name: 'Jue', users: 210, posts: 58 },
        { name: 'Vie', users: 250, posts: 72 },
        { name: 'Sab', users: 300, posts: 85 },
        { name: 'Dom', users: 350, posts: 90 },
    ];

    const pieData = [
        { name: 'Alumnos', value: 65, color: '#14b8a6' }, // --codex-teal
        { name: 'Profesores', value: 25, color: '#8b5cf6' }, // --codex-violet
        { name: 'Admins', value: 10, color: '#06b6d4' }, // --codex-cyan
    ];

    return (
        <div className="admin-overview">
            <header className="admin-page-header">
                <h2 className="admin-page-title">Resumen de actividad</h2>
                <p className="admin-page-subtitle">Panel de control administrativo de Codex.</p>
            </header>

            <div className="stats-grid">
                {statItems.map((item, index) => (
                    <div key={index} className={`stat-card stat-card--${item.color}`}>
                        <div className="stat-card-header">
                            <span className="stat-label">{item.label}</span>
                            <span className="stat-icon">{item.icon}</span>
                        </div>
                        <span className="stat-value">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <h3>Crecimiento de la plataforma</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={areaData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#0f1520',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#14b8a6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container chart-pie">
                    <h3>Distribución de roles</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: '#0f1520',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                        {pieData.map((item) => (
                            <div key={item.name} className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                <span>{item.name} ({item.value}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
