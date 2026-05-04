import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import followService from "@/services/followService";
import "./FollowListModal.css";

export default function FollowListModal({ userId, type, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchUsers = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        const serviceCall =
          type === "followers" ? followService.getFollowers : followService.getFollowing;

        const response = await serviceCall(userId, pageNum);
        const data = response.data || response;

        const newUsers = data.data || [];
        if (pageNum === 1) {
          setUsers(newUsers);
        } else {
          setUsers((prev) => [...prev, ...newUsers]);
        }

        setHasMore(data.current_page < data.last_page);
        setPage(data.current_page);
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
        setError(t("common.error_generic"));
      } finally {
        setLoading(false);
      }
    },
    [userId, type, t],
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleUserClick = (username) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  const handleToggleFollow = async (e, targetUser) => {
    e.stopPropagation();
    const isCurrentlyFollowing = !!targetUser.is_following;
    const isCurrentlyPending = !!targetUser.is_pending;

    // Optimistic UI update
    setUsers(prev => prev.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          is_following: !isCurrentlyFollowing && !isCurrentlyPending && !u.is_private,
          is_pending: !isCurrentlyFollowing && !isCurrentlyPending && !!u.is_private,
        };
      }
      return u;
    }));

    try {
      const response = await followService.toggleFollowUser(targetUser.id);
      const data = response.data?.data || response.data || response;
      
      setUsers(prev => prev.map(u => {
        if (u.id === targetUser.id) {
          return {
            ...u,
            is_following: data.status === 'accepted' || data.following === true,
            is_pending: data.status === 'pending',
          };
        }
        return u;
      }));
    } catch (err) {
      console.error("Error toggling follow in modal:", err);
      // Revert on error
      setUsers(prev => prev.map(u => {
        if (u.id === targetUser.id) {
          return { ...u, is_following: isCurrentlyFollowing, is_pending: isCurrentlyPending };
        }
        return u;
      }));
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="follow-modal__backdrop" onClick={handleBackdropClick}>
      <div className="follow-modal">
        <div className="follow-modal__header">
          <h2 className="follow-modal__title">
            {type === "followers" ? t("profile.followers") : t("feed.tabs.following")}
          </h2>
          <button className="follow-modal__close" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="follow-modal__content">
          {error && <p className="follow-modal__error">{error}</p>}

          {loading && users.length === 0 ? (
            <div className="follow-modal__loading">{t("common.loading")}</div>
          ) : users.length === 0 ? (
            <div className="follow-modal__empty">
              {type === "followers" ? t("widgets.no_contributors") : t("widgets.no_contributors")}
            </div>
          ) : (
            <div className="follow-modal__list">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="follow-modal__user"
                  onClick={() => handleUserClick(user.username)}
                >
                  <div className="follow-modal__avatar">
                    <img
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                      }
                      alt={user.name}
                    />
                  </div>
                  <div className="follow-modal__info">
                    <span className="follow-modal__name">{user.name}</span>
                    <span className="follow-modal__username">@{user.username}</span>
                  </div>
                  {!user.is_self && (
                    <button 
                      className={`follow-modal__btn ${user.is_following ? 'follow-modal__btn--following' : 'follow-modal__btn--primary'}`}
                      onClick={(e) => handleToggleFollow(e, user)}
                    >
                      {user.is_following ? t("profile.unfollow") : user.is_pending ? t("profile.pending", "Solicitado") : t("profile.follow")}
                    </button>
                  )}
                </div>
              ))}

              {hasMore && (
                <button
                  className="follow-modal__load-more"
                  onClick={() => fetchUsers(page + 1)}
                  disabled={loading}
                >
                  {loading ? t("common.loading") : t("common.load_more")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
