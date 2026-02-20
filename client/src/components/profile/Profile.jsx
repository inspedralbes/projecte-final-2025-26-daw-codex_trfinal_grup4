import React from "react";
import { useAuth } from "@/hooks/useAuth";
import "./Profile.css";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : null;

  // Generate initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const roleName =
    user.role === "student"
      ? "Estudiante"
      : user.role === "teacher"
        ? "Profesor"
        : user.role === "admin"
          ? "Admin"
          : user.role || "Usuario";

  return (
    <div className="profile">
      {/* Cover band */}
      <div className="profile__cover" />

      {/* Main card */}
      <div className="profile__card">
        {/* Avatar */}
        <div className="profile__avatar">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.name}`}
            alt={user.name}
          />
        </div>

        {/* Identity */}
        <h1 className="profile__name">{user.name}</h1>
        <p className="profile__username">@{user.username}</p>

        {/* Role pill */}
        <span className="profile__role">{roleName}</span>

        {/* Details */}
        <div className="profile__details">
          {user.center && (
            <div className="profile__detail">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>{user.center.name}</span>
            </div>
          )}
          {user.email && (
            <div className="profile__detail">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>{user.email}</span>
            </div>
          )}
          {joinedDate && (
            <div className="profile__detail">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Se unió en {joinedDate}</span>
            </div>
          )}
        </div>

        {/* Edit button */}
        <button className="profile__edit-btn">Editar perfil</button>
      </div>
    </div>
  );
}
