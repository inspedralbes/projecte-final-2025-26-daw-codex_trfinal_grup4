import React, { useState, useEffect } from "react";
import chatService from "@/services/chatService";
import { useAuth } from "@/hooks/useAuth";
import "./NewGroupModal.css";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Avatar = ({ src, name, size = 40 }) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="msg__avatar" style={{ width: size, height: size }}>
      {src ? <img src={src} alt={name} /> : <span className="msg__avatar-initials">{initials}</span>}
    </div>
  );
};

export default function NewGroupModal({ isOpen, onClose, onGroupCreated, t }) {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [mutuals, setMutuals] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadMutuals();
    }
  }, [isOpen]);

  const loadMutuals = async () => {
    setLoading(true);
    try {
      const data = await chatService.getMutualFollowers();
      // Filter out current user just in case
      const filtered = (data.users || []).filter(u => String(u.id) !== String(user?.id));
      setMutuals(filtered);
    } catch (err) {
      console.error("Error loading mutual followers:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 2) return;

    setCreating(true);
    try {
      const result = await chatService.createGroup(groupName.trim(), selectedIds);
      // chatService returns result.data, which is { group: { ... } }
      if (result && result.group) {
        onGroupCreated(result.group);
        onClose();
        setGroupName("");
        setSelectedIds([]);
      } else {
        alert(t("messages.error_creating_group", "Error al crear el grupo"));
      }
    } catch (err) {
      console.error("Error creating group:", err);
      const errorMsg = err.response?.data?.message || err.message || t("messages.error_creating_group", "Error al crear el grupo");
      alert(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  const filteredMutuals = mutuals.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="msg__modal-overlay" onClick={onClose}>
      <div className="msg__modal group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="msg__modal-header">
          <h3>{t("messages.new_group", "Nuevo Grupo")}</h3>
          <button className="msg__modal-close" onClick={onClose}>×</button>
        </div>

        <div className="group-modal__body">
          <div className="group-modal__field">
            <label>{t("messages.group_name", "Nombre del Grupo")}</label>
            <input
              type="text"
              placeholder={t("messages.enter_group_name", "Ej: Desarrolladores React")}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="group-modal__search">
            <SearchIcon />
            <input
              type="text"
              placeholder={t("messages.search_friends", "Buscar amigos mutuos...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="group-modal__list">
            <div className="group-modal__list-header">
              <span>{t("messages.mutual_followers", "Seguidores Mutuos")}</span>
              <span className="group-modal__count">
                {selectedIds.length} / {mutuals.length}
              </span>
            </div>

            {loading ? (
              <div className="group-modal__loading">{t("messages.loading", "Cargando...")}</div>
            ) : filteredMutuals.length === 0 ? (
              <div className="group-modal__empty">
                {searchQuery ? t("messages.no_results", "Sin resultados") : t("messages.no_mutuals", "No tienes seguidores mutuos aún")}
              </div>
            ) : (
              filteredMutuals.map((user) => (
                <div
                  key={user.id}
                  className={`group-modal__user ${selectedIds.includes(user.id) ? "selected" : ""}`}
                  onClick={() => toggleUser(user.id)}
                >
                  <Avatar src={user.avatar} name={user.name} />
                  <div className="group-modal__user-info">
                    <span className="group-modal__user-name">{user.name}</span>
                    <span className="group-modal__user-username">@{user.username}</span>
                  </div>
                  <div className="group-modal__checkbox">
                    {selectedIds.includes(user.id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="msg__modal-footer group-modal__footer">
          <p className="group-modal__hint">
            {selectedIds.length < 2 
              ? t("messages.group_min_members", "Selecciona al menos 2 personas") 
              : t("messages.group_ready", "¡Todo listo!")}
          </p>
          <button
            className="group-modal__create-btn"
            disabled={creating || !groupName.trim() || selectedIds.length < 2}
            onClick={handleCreate}
          >
            {creating ? t("messages.creating", "Creando...") : t("messages.create_group", "Crear Grupo")}
          </button>
        </div>
      </div>
    </div>
  );
}
