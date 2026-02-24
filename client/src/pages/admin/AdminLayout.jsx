import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
