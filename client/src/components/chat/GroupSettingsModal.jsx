import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import chatService from '@/services/chatService';
import api from '@/services/api';
import './GroupSettingsModal.css';

// -- Icons --
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const UserMinusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line>
    <line x1="16" y1="11" x2="22" y2="11"></line>
  </svg>
);

const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const GroupSettingsModal = ({ group, members, currentUser, onClose, onGroupUpdated }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState(group.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [imageUrl, setImageUrl] = useState(group.image_url);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [addingMemberId, setAddingMemberId] = useState(null);
  const [kickingMemberId, setKickingMemberId] = useState(null);

  // Use loose equality and check both property locations for robustness
  const isAdmin = (members || []).some(m => {
    const isMe = String(m.id) === String(currentUser?.id);
    const hasAdminProp = m.is_admin === true || m.is_admin === 1;
    return isMe && hasAdminProp;
  });

  // Fetch mutual followers to allow adding new members
  useEffect(() => {
    if (isAdmin) {
      const fetchMutuals = async () => {
        try {
          const data = await chatService.getMutualFollowers();
          // Filter out users already in the group
          const memberIds = members.map(m => m.id);
          const available = (data.users || []).filter(u => !memberIds.includes(u.id));
          setMutualFollowers(available);
        } catch (err) {
          console.error("Error fetching mutual followers:", err);
        }
      };
      fetchMutuals();
    }
  }, [isAdmin, members]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("messages.file_too_large", "File is too large (max 5MB)."));
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const result = await chatService.uploadGroupImage(group.id, file);
      
      if (result.success && result.data?.image_url) {
        setImageUrl(result.data.image_url);
        if (result.data.group) {
          onGroupUpdated(result.data.group);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t("messages.upload_error", "Error subiendo la imagen."));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (newName = name, newImage = imageUrl) => {
    if (!newName.trim()) return;
    
    setSaving(true);
    setError('');
    
    try {
      const result = await chatService.updateGroup(group.id, newName.trim(), newImage);
      if (result.success) {
        setIsEditingName(false);
        onGroupUpdated(result.data.group);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("messages.save_error", "Error saving group."));
    } finally {
      setSaving(false);
    }
  };



  const handleKickMember = async (userId) => {
    console.log(`[GroupSettingsModal] Kicking user ${userId} from group ${group?.id}`);
    
    setKickingMemberId(userId);
    setError('');
    try {
      if (!group?.id) throw new Error("Group ID is missing");
      
      const result = await chatService.removeGroupMember(group.id, userId);
      console.log(`[GroupSettingsModal] Kick successful:`, result);
      
      if (result.success && result.data?.group) {
        onGroupUpdated(result.data.group);
      }
    } catch (err) {
      console.error("[GroupSettingsModal] Kick failed:", err);
      setError(err.response?.data?.message || err.message || t("messages.kick_error", "Error expulsando al miembro."));
    } finally {
      setKickingMemberId(null);
    }
  };

  const handleToggleAdmin = async (userId) => {
    setError('');
    try {
      const result = await chatService.toggleGroupAdmin(group.id, userId);
      if (result.success && result.data?.group) {
        onGroupUpdated(result.data.group);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("messages.admin_error", "Error updating admin status."));
    }
  };

  const handleAddMember = async (userId) => {
    setAddingMemberId(userId);
    setError('');
    try {
      const result = await chatService.addGroupMember(group.id, userId);
      if (result.success && result.data?.group) {
        onGroupUpdated(result.data.group);
        setMutualFollowers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      setError(err.response?.data?.message || t("messages.add_error", "Error adding member."));
    } finally {
      setAddingMemberId(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm(t("messages.confirm_leave", "¿Estás seguro de que deseas abandonar este grupo?"))) return;

    setError('');
    try {
      await chatService.leaveGroup(group.id);
      onClose();
      // Parent will handle redirect or removal from list via socket
    } catch (err) {
      setError(err.response?.data?.message || t("messages.leave_error", "Error leaving group."));
    }
  };

  return (
    <div className="gs-modal__overlay" onClick={onClose}>
      <div className="gs-modal__container" onClick={(e) => e.stopPropagation()}>
        <header className="gs-modal__header">
          <h2>{t("messages.group_info", "Información del Grupo")}</h2>
          <button className="gs-modal__close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <div className="gs-modal__content">
          {error && <div className="gs-modal__error">{error}</div>}

          {/* Group Image & Name */}
          <div className="gs-modal__header-info">
            <div className="gs-modal__image-wrapper">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="gs-modal__image" />
              ) : (
                <div className="gs-modal__image-placeholder">
                  {name.substring(0, 2).toUpperCase()}
                </div>
              )}
              {isAdmin && (
                <button 
                  className="gs-modal__image-edit-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <CameraIcon />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="gs-modal__name-section">
              {isEditingName ? (
                <div className="gs-modal__name-edit">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    autoFocus
                  />
                  <div className="gs-modal__name-actions">
                    <button onClick={() => setIsEditingName(false)} disabled={saving}>{t("common.cancel", "Cancelar")}</button>
                    <button onClick={() => handleSave()} disabled={saving || !name.trim()} className="primary">
                      {saving ? '...' : t("common.save", "Guardar")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gs-modal__name-display">
                  <h3>{name}</h3>
                  {isAdmin && (
                    <button onClick={() => setIsEditingName(true)} className="gs-modal__edit-icon">
                      <EditIcon />
                    </button>
                  )}
                </div>
              )}
              <span className="gs-modal__member-count">
                {members.length} {t("messages.members", "miembros")}
              </span>
            </div>
          </div>

          <div className="gs-modal__divider"></div>

          {/* Members List */}
          <div className="gs-modal__members">
            <div className="gs-modal__section-header">
              <h4>{t("messages.members_list", "Participantes")}</h4>
              {isAdmin && mutualFollowers.length > 0 && (
                <button 
                  className={`gs-modal__add-btn ${showAddMembers ? 'active' : ''}`}
                  onClick={() => setShowAddMembers(!showAddMembers)}
                >
                  <UserPlusIcon />
                  {showAddMembers ? t("common.cancel", "Cancelar") : t("messages.add_member", "Añadir")}
                </button>
              )}
            </div>

            {showAddMembers && isAdmin && (
              <div className="gs-modal__add-section">
                <h5>{t("messages.available_friends", "Seguidores mutuos")}</h5>
                <div className="gs-modal__available-list">
                  {mutualFollowers.length === 0 ? (
                    <p className="gs-modal__empty-text">{t("messages.no_available_members", "No hay más seguidores mutuos para añadir.")}</p>
                  ) : (
                    mutualFollowers.map(u => (
                      <div key={u.id} className="gs-modal__available-item">
                        <div className="gs-modal__member-info">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="gs-modal__member-avatar" />
                          ) : (
                            <div className="gs-modal__member-avatar-placeholder">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="gs-modal__member-name">{u.name}</span>
                        </div>
                        <button 
                          className="gs-modal__invite-btn"
                          onClick={() => handleAddMember(u.id)}
                          disabled={addingMemberId === u.id}
                        >
                          {addingMemberId === u.id ? '...' : <UserPlusIcon />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="gs-modal__members-list">
              {members.map(member => (
                <div key={member.id} className="gs-modal__member-item">
                  <div className="gs-modal__member-info">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="gs-modal__member-avatar" />
                    ) : (
                      <div className="gs-modal__member-avatar-placeholder">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="gs-modal__member-details">
                      <span className="gs-modal__member-name">
                        {member.name} {member.id === currentUser.id && `(${t("messages.you", "tú")})`}
                      </span>
                      <span className="gs-modal__member-username">@{member.username}</span>
                    </div>
                  </div>

                  <div className="gs-modal__member-actions">
                    {member.is_admin && (
                      <span className="gs-modal__admin-badge">
                        <ShieldIcon />
                        {t("messages.admin", "Admin")}
                      </span>
                    )}
                    
                    {isAdmin && member.id !== currentUser.id && (
                      <div className="gs-modal__admin-actions">
                        <button 
                          className={`gs-modal__admin-btn ${member.is_admin ? 'active' : ''}`}
                          onClick={() => handleToggleAdmin(member.id)}
                          title={member.is_admin ? t("messages.demote_admin", "Quitar Admin") : t("messages.promote_admin", "Hacer Admin")}
                        >
                          <ShieldIcon />
                        </button>
                        <button 
                          className={`gs-modal__kick-btn ${kickingMemberId === member.id ? 'loading' : ''}`}
                          onClick={() => handleKickMember(member.id)}
                          disabled={kickingMemberId !== null}
                          title={t("messages.kick_member", "Expulsar")}
                        >
                          {kickingMemberId === member.id ? (
                            <div className="gs-modal__spinner-small"></div>
                          ) : (
                            <UserMinusIcon />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gs-modal__actions">
            <button className="gs-modal__leave-btn" onClick={handleLeaveGroup}>
              <LogOutIcon />
              {t("messages.leave_group", "Abandonar grupo")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
