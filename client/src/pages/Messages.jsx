import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext";
import chatService from "@/services/chatService";
import socketService from "@/services/socketService";
import GlitchText from "@/components/ui/GlitchText";
import NewGroupModal from "@/components/chat/NewGroupModal";
import GroupSettingsModal from "@/components/chat/GroupSettingsModal";
import "./Messages.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 1000;

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MessageCircleIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const LockIcon = () => (
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
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UsersIcon = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DoubleCheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 6 9 17 4 12" />
    <polyline points="22 6 13 17" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// ─── Loading Spinner ─────────────────────────────────────────────────────────

const LoadingSpinner = ({ size = 24 }) => (
  <div className="msg__spinner" style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  </div>
);

// ─── Avatar Component ────────────────────────────────────────────────────────

const Avatar = ({ src, name, size = 48, online }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="msg__avatar" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span className="msg__avatar-initials">{initials}</span>
      )}
      {online !== undefined && <span className={`msg__avatar-status ${online ? "online" : ""}`} />}
    </div>
  );
};

// ─── Time Formatting ─────────────────────────────────────────────────────────

const formatMessageTime = (dateString, t) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return t("messages.yesterday");
  }

  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

const formatConversationTime = (dateString, t) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("messages.now");
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

// ─── Conversation List Item ─────────────────────────────────────────────────

const ConversationItem = ({ conversation, isActive, onClick, t }) => {
  const { last_message, unread_count } = conversation;
  const isGroup = conversation.type === "group";
  const name = isGroup ? conversation.group?.name : conversation.partner?.name;
  const avatarSrc = isGroup ? conversation.group?.image_url : conversation.partner?.avatar;
  const is_mutual = !isGroup && conversation.is_mutual;

  return (
    <div
      className={`msg__conv-item ${isActive ? "active" : ""} ${unread_count > 0 ? "unread" : ""}`}
      onClick={onClick}
    >
      {isGroup ? (
        <div
          className="msg__avatar msg__avatar--group"
          style={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={name}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <UsersIcon />
          )}
        </div>
      ) : (
        <Avatar src={avatarSrc} name={name} size={48} />
      )}
      <div className="msg__conv-content">
        <div className="msg__conv-header">
          <span className="msg__conv-name">
            {name}
            {!isGroup && !is_mutual && (
              <span className="msg__conv-restricted" title={t("messages.restriction.title")}>
                <LockIcon />
              </span>
            )}
          </span>
          {last_message && (
            <span className="msg__conv-time">
              {formatConversationTime(last_message.created_at, t)}
            </span>
          )}
        </div>
        <div className="msg__conv-preview">
          {last_message ? (
            <>
              <span className="msg__conv-text">
                {last_message.content?.slice(0, 40)}
                {last_message.content?.length > 40 ? "..." : ""}
              </span>
              {unread_count > 0 && <span className="msg__conv-badge">{unread_count}</span>}
            </>
          ) : (
            <span className="msg__conv-empty">{t("messages.no_messages")}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Message Bubble ──────────────────────────────────────────────────────────

const MessageBubble = ({ message, showAvatar, partnerAvatar, partnerName, isGroup }) => {
  const { content, is_own, is_read, created_at, sender } = message;
  const displayAvatar = isGroup ? sender?.avatar : partnerAvatar;
  const displayName = isGroup ? sender?.name : partnerName;

  return (
    <div className={`msg__bubble-wrapper ${is_own ? "own" : "other"}`}>
      {!is_own && showAvatar && <Avatar src={displayAvatar} name={displayName} size={32} />}
      {!is_own && !showAvatar && <div className="msg__bubble-spacer" />}
      <div className={`msg__bubble ${is_own ? "own" : "other"}`}>
        {isGroup && !is_own && showAvatar && (
          <span
            className="msg__bubble-sender"
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent-primary, #7c5cfc)",
              marginBottom: "2px",
              display: "block",
            }}
          >
            {displayName}
          </span>
        )}
        <p className="msg__bubble-text">{content}</p>
        <div className="msg__bubble-meta">
          <span className="msg__bubble-time">
            {new Date(created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {is_own && !isGroup && (
            <span className={`msg__bubble-status ${is_read ? "read" : ""}`}>
              {is_read ? <DoubleCheckIcon /> : <CheckIcon />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Restriction Banner ──────────────────────────────────────────────────────

const RestrictionBanner = ({ isMutual, canSend, restrictionReason, t }) => {
  if (isMutual) return null;

  return (
    <div className="msg__restriction">
      {!isMutual && (
        <div className="msg__restriction-badge">
          <LockIcon />
          <span>
            <GlitchText>{t("messages.restriction.title")}</GlitchText>
          </span>
        </div>
      )}
      {!canSend && restrictionReason === "message_limit_reached" && (
        <p className="msg__restriction-text">
          <GlitchText>{t("messages.restriction.message_sent")}</GlitchText>
        </p>
      )}
      {canSend && !isMutual && (
        <p className="msg__restriction-text">
          <GlitchText>{t("messages.restriction.not_following")}</GlitchText>
        </p>
      )}
    </div>
  );
};

// ─── New Conversation Search ─────────────────────────────────────────────────

const NewConversationModal = ({ isOpen, onClose, onSelectUser, t }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await chatService.searchUsers(query);
        setResults(data.users || []);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="msg__modal-overlay" onClick={onClose}>
      <div className="msg__modal" onClick={(e) => e.stopPropagation()}>
        <div className="msg__modal-header">
          <h3>
            <GlitchText>{t("messages.new_conversation")}</GlitchText>
          </h3>
          <button className="msg__modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="msg__modal-search">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            placeholder={t("messages.search_users")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="msg__modal-results">
          {loading && (
            <div className="msg__modal-loading">
              <LoadingSpinner size={24} />
            </div>
          )}
          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="msg__modal-empty">
              <GlitchText>{t("messages.no_results")}</GlitchText>
            </p>
          )}
          {results.map((user) => (
            <div
              key={user.id}
              className="msg__modal-user"
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
            >
              <Avatar src={user.avatar} name={user.name} size={40} />
              <div className="msg__modal-user-info">
                <span className="msg__modal-user-name">{user.name}</span>
                <span className="msg__modal-user-username">@{user.username}</span>
              </div>
              {user.is_mutual && (
                <span className="msg__modal-mutual" title={t("messages.mutual_followers")}>
                  <UsersIcon />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Empty States ────────────────────────────────────────────────────────────

const EmptyConversations = ({ onNewConversation, t }) => (
  <div className="msg__empty">
    <div className="msg__empty-icon">
      <MessageCircleIcon />
    </div>
    <h3>
      <GlitchText>{t("messages.no_conversations")}</GlitchText>
    </h3>
    <p>
      <GlitchText>{t("messages.no_conversations_subtitle")}</GlitchText>
    </p>
    <button className="msg__empty-btn" onClick={onNewConversation}>
      <PlusIcon />
      <GlitchText>{t("messages.new_conversation")}</GlitchText>
    </button>
  </div>
);

const EmptyChat = ({ t }) => (
  <div className="msg__empty-chat">
    <div className="msg__empty-icon">
      <MessageCircleIcon />
    </div>
    <h3>
      <GlitchText>{t("messages.select_conversation")}</GlitchText>
    </h3>
    <p>
      <GlitchText>{t("messages.select_conversation_subtitle")}</GlitchText>
    </p>
  </div>
);

// ─── Main Messages Component ─────────────────────────────────────────────────

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    resetMessagesUnread,
    setMessagesCount,
    setActiveChat,
    onNewMessage,
    onGroupUpdate,
    onGroupMemberChange,
  } = useSocket();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [conversationStatus, setConversationStatus] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [groupDetails, setGroupDetails] = useState({ members: [] });
  const [typing, setTyping] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConversationRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Get active conversation from URL
  const activeUserId = searchParams.get("user");
  const activeGroupId = searchParams.get("group");
  const isGroupActive = !!activeGroupId;
  const currentActiveId = activeGroupId || activeUserId;

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await chatService.getConversations();
        setConversations(data.conversations || []);
        // Sync unread count with context
        const totalUnread = (data.conversations || []).reduce(
          (sum, c) => sum + (c.unread_count || 0),
          0,
        );
        setMessagesCount(totalUnread);
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [setMessagesCount]);

  // Clear active chat when component unmounts
  useEffect(() => {
    return () => setActiveChat(null);
  }, [setActiveChat]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!currentActiveId) {
      setActiveConversation(null);
      setMessages([]);
      setPartner(null);
      setConversationStatus(null);
      setMobileView("list");
      setActiveChat(null);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        let data;
        if (isGroupActive) {
          data = await chatService.getGroupMessages(parseInt(activeGroupId));
          setPartner(null);
          setGroupDetails(data.group);
          setConversationStatus({ is_mutual: true, can_send: true });
          setActiveConversation(`group_${activeGroupId}`);
          socketService.joinGroupRoom(parseInt(activeGroupId));
          setActiveChat({ type: "group", id: parseInt(activeGroupId) });
        } else {
          data = await chatService.getMessages(parseInt(activeUserId));
          setPartner(data.partner);
          setConversationStatus(data.conversation_status);
          setActiveConversation(parseInt(activeUserId));
          socketService.joinChatRoom(user.id, parseInt(activeUserId));
          setActiveChat({ type: "user", id: parseInt(activeUserId) });
        }

        setMessages(data.messages || []);
        setMobileView("chat");

        // Reset unread for both private and group conversations
        setConversations((prev) => {
          let idx;
          if (isGroupActive) {
            idx = prev.findIndex(
              (c) => c.type === "group" && c.group?.id === parseInt(activeGroupId),
            );
          } else {
            idx = prev.findIndex(
              (c) => c.type === "private" && c.partner?.id === parseInt(activeUserId),
            );
          }
          if (idx !== -1 && prev[idx].unread_count > 0) {
            const unreadToRemove = prev[idx].unread_count;
            setTimeout(() => {
              setMessagesCount((current) => Math.max(0, current - unreadToRemove));
            }, 0);
            const updated = [...prev];
            updated[idx] = { ...updated[idx], unread_count: 0 };
            return updated;
          }
          return prev;
        });

        if (isGroupActive) {
          chatService.markGroupAsRead(parseInt(activeGroupId)).catch(() => {});
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Cleanup: leave P2P chat rooms (group rooms stay joined via SocketContext)
    return () => {
      if (user?.id && !isGroupActive && activeUserId) {
        socketService.leaveChatRoom(user.id, parseInt(activeUserId));
      }
      setActiveChat(null);
    };
  }, [
    activeUserId,
    activeGroupId,
    user?.id,
    setMessagesCount,
    setActiveChat,
    isGroupActive,
    currentActiveId,
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time message handling
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (!data) return;
      const activeId = activeGroupId ? `group_${activeGroupId}` : activeUserId;
      const userId = parseInt(user?.id, 10);
      const msgSenderId = parseInt(data.sender_id, 10);
      const msgReceiverId = data.receiver_id ? parseInt(data.receiver_id, 10) : null;
      const msgGroupId = data.group_id ? parseInt(data.group_id, 10) : null;

      console.log("[Messages] handleNewMessage received:", data);
      console.log("[Messages] Current active chat:", { activeGroupId, activeUserId });

      // Determine if this message is for the active conversation
      let isForCurrentChat = false;
      if (msgGroupId && activeGroupId && parseInt(activeGroupId) === parseInt(msgGroupId)) {
        isForCurrentChat = true;
      } else if (!msgGroupId && !activeGroupId && msgReceiverId) {
        const activePartnerId = parseInt(activeUserId, 10);
        isForCurrentChat =
          (parseInt(msgSenderId) === activePartnerId && parseInt(msgReceiverId) === userId) ||
          (parseInt(msgSenderId) === userId && parseInt(msgReceiverId) === activePartnerId);
      }

      console.log("[Messages] isForCurrentChat:", isForCurrentChat);

      if (isForCurrentChat) {
        setMessages((prev) => {
          // If this message has a tempId, replace the optimistic message
          if (data.tempId) {
            const tempIndex = prev.findIndex((m) => m.tempId === data.tempId);
            if (tempIndex !== -1) {
              const updated = [...prev];
              updated[tempIndex] = {
                id: data.id,
                content: data.content,
                sender_id: msgSenderId,
                receiver_id: msgReceiverId,
                group_id: msgGroupId,
                is_own: msgSenderId === userId,
                is_read: data.is_read,
                created_at: data.created_at,
                sender: data.sender,
              };
              return updated;
            }
          }

          // Avoid duplicates by ID
          if (data.id && prev.some((m) => m.id === data.id)) return prev;

          return [
            ...prev,
            {
              id: data.id,
              content: data.content,
              sender_id: msgSenderId,
              receiver_id: msgReceiverId,
              group_id: msgGroupId,
              is_own: msgSenderId === userId,
              is_read: data.is_read,
              created_at: data.created_at,
              sender: data.sender,
            },
          ];
        });

        // Mark as read if we're viewing this P2P conversation
        if (!msgGroupId && msgSenderId === parseInt(activeUserId, 10) && userId) {
          socketService.markMessagesRead(userId, parseInt(activeUserId, 10));
          setConversationStatus((prev) => {
            if (prev && !prev.can_send) {
              return { ...prev, can_send: true, reason: "partner_replied" };
            }
            return prev;
          });
        }
      }

      // Always update conversation list for ANY message to show last message and unread count
      setConversations((prev) => {
        const targetPartnerId = msgSenderId === userId ? msgReceiverId : msgSenderId;
        const idx = prev.findIndex((c) =>
          msgGroupId
            ? c.type === "group" && c.group?.id === msgGroupId
            : c.type === "private" && c.partner?.id === targetPartnerId,
        );

        if (idx === -1) {
          chatService.getConversations().then((res) => setConversations(res.conversations || []));
          return prev;
        }

        const updated = [...prev];
        const conv = { ...updated[idx] };

        conv.last_message = {
          id: data.id,
          content: data.content,
          sender_id: msgSenderId,
          created_at: data.created_at,
        };

        if (!isForCurrentChat && msgSenderId !== userId) {
          conv.unread_count = (conv.unread_count || 0) + 1;
        }

        updated.splice(idx, 1);
        return [conv, ...updated];
      });
    };

    const handleTyping = (data) => {
      if (!data) return;
      const typingUserId = parseInt(data.userId, 10);
      const activeId = parseInt(activeConversationRef.current, 10);
      if (typingUserId === activeId) {
        setTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (data) => {
      if (!data) return;
      const readerId = parseInt(data.reader_id, 10);
      const activeId = parseInt(activeConversationRef.current, 10);
      const userId = parseInt(user?.id, 10);
      if (readerId === activeId) {
        setMessages((prev) =>
          prev.map((m) => (m.sender_id === userId ? { ...m, is_read: true } : m)),
        );
      }
    };

    const handleGroupUpdate = (data) => {
      if (!data) return;
      const groupId = parseInt(data.id, 10);
      const activeId = activeConversationRef.current;
      setConversations((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c.type === "group" && c.group?.id === groupId);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], group: { ...updated[idx].group, ...data } };
        }
        return updated;
      });
      if (activeId === `group_${groupId}`) {
        setGroupDetails((prev) => ({ ...prev, ...data }));
      }
    };

    const handleGroupMemberChange = (data) => {
      if (!data) return;
      const groupId = parseInt(data.group_id, 10);
      const action = data.action;
      const changedUser = data.user;
      const currentUserId = parseInt(user?.id, 10);
      const activeId = activeConversationRef.current;

      if (changedUser.id === currentUserId) {
        if (action === "removed" || action === "left") {
          setConversations((prev) =>
            prev.filter((c) => !(c.type === "group" && c.group?.id === groupId)),
          );
          if (activeId === `group_${groupId}`) {
            navigate("/messages");
            setMobileView("list");
            setActiveConversation(null);
          }
        } else if (action === "added") {
          console.log("[Messages] We were added to a group, refreshing list...");
          chatService.getConversations().then((res) => {
            setConversations(res.conversations || []);
            socketService.joinGroupRoom(groupId);
          });
        }
      } else {
        if (activeId === `group_${groupId}`) {
          setGroupDetails((prev) => {
            if (!prev || prev.id !== groupId) return prev;
            let updatedMembers = [...(prev.members || [])];
            if (action === "added") {
              if (!updatedMembers.some((m) => m.id === changedUser.id)) {
                updatedMembers.push({ ...changedUser, is_admin: false });
              }
            } else {
              updatedMembers = updatedMembers.filter((m) => m.id !== changedUser.id);
            }
            return { ...prev, members: updatedMembers, members_count: data.members_count };
          });
        }
        chatService.getConversations().then((res) => setConversations(res.conversations || []));
      }
    };

    const unsubscribeMsg = onNewMessage(handleNewMessage);
    const unsubscribeUpdate = onGroupUpdate(handleGroupUpdate);
    const unsubscribeMember = onGroupMemberChange(handleGroupMemberChange);

    socketService.onTyping(handleTyping);
    socketService.onMessagesRead(handleMessagesRead);

    return () => {
      unsubscribeMsg();
      unsubscribeUpdate();
      unsubscribeMember();
      socketService.off("user.typing", handleTyping);
      socketService.off("messages.read", handleMessagesRead);
    };
  }, [
    user?.id,
    onNewMessage,
    onGroupUpdate,
    onGroupMemberChange,
    navigate,
    activeUserId,
    activeGroupId,
  ]);

  // Send message (P2P via socket)
  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return;

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Optimistically add message to UI
    const optimisticMessage = {
      tempId,
      content,
      sender_id: user?.id,
      receiver_id: isGroupActive ? null : parseInt(activeUserId),
      group_id: isGroupActive ? parseInt(activeGroupId) : null,
      is_own: true,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: { id: user?.id, name: user?.name, avatar: user?.avatar },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setSending(true);

    try {
      const result = await socketService.sendMessage(
        isGroupActive ? null : parseInt(activeUserId),
        content,
        tempId,
        isGroupActive ? parseInt(activeGroupId) : null,
      );

      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.tempId !== tempId));
        console.error("Error sending message:", result.error);
      } else {
        if (!isGroupActive && conversationStatus && !conversationStatus.is_mutual) {
          setConversationStatus((prev) => ({
            ...prev,
            can_send: false,
            sent_count: (prev?.sent_count || 0) + 1,
          }));
        }

        setConversations((prev) => {
          const idx = prev.findIndex((c) =>
            isGroupActive
              ? c.type === "group" && c.group?.id === parseInt(activeGroupId)
              : c.type === "private" && c.partner?.id === parseInt(activeUserId),
          );
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            last_message: {
              id: result.message?.id || tempId,
              content: content,
              sender_id: user?.id,
              created_at: new Date().toISOString(),
            },
          };
          const conv = updated.splice(idx, 1)[0];
          return [conv, ...updated];
        });
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.tempId !== tempId));
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // Handle input change with typing indicator and character limit
  const handleInputChange = (e) => {
    const value = e.target.value;

    // Enforce character limit
    if (value.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    setNewMessage(value);

    if (user?.id && activeConversation) {
      socketService.sendTypingIndicator(user.id, activeConversation, true);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTypingIndicator(user.id, activeConversation, false);
      }, 2000);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Select user from modal or conversation
  const selectConversation = (id, isGroup = false) => {
    if (isGroup) {
      setSearchParams({ group: id });
    } else {
      setSearchParams({ user: id });
    }
  };

  // Handle new user selection
  const handleNewUserSelect = async (selectedUser) => {
    const existing = conversations.find(
      (c) => c.type === "private" && c.partner?.id === selectedUser.id,
    );
    if (existing) {
      selectConversation(selectedUser.id);
      return;
    }

    setConversations((prev) => [
      {
        type: "private",
        partner: selectedUser,
        last_message: null,
        unread_count: 0,
        is_mutual: selectedUser.is_mutual,
        can_send: selectedUser.can_message,
      },
      ...prev,
    ]);
    selectConversation(selectedUser.id);
  };

  // Handle new group created
  const handleGroupCreated = (group) => {
    setConversations((prev) => [
      {
        type: "group",
        group: {
          id: group.id,
          name: group.name,
          image_url: group.image_url,
          members_count: group.members_count,
        },
        last_message: null,
        unread_count: 0,
      },
      ...prev,
    ]);
    socketService.joinGroupRoom(group.id);
    selectConversation(group.id, true);
  };

  // Back to list (mobile)
  const handleBack = () => {
    setSearchParams({});
    setMobileView("list");
  };

  // Can send message?
  const canSend = conversationStatus?.can_send !== false;

  return (
    <div className="msg">
      {/* Conversation List */}
      <aside className={`msg__sidebar ${mobileView === "chat" ? "hidden-mobile" : ""}`}>
        <div className="msg__sidebar-header">
          <h1 className="msg__title">
            <GlichText>{t("messages.title")}</GlichText>
          </h1>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="msg__new-btn"
              onClick={() => setShowGroupModal(true)}
              title={t("messages.new_group", "Nuevo Grupo")}
            >
              <UsersIcon />
            </button>
            <button
              className="msg__new-btn"
              onClick={() => setShowNewModal(true)}
              title={t("messages.new_conversation")}
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        <div className="msg__search">
          <SearchIcon />
          <input type="text" placeholder={t("messages.search_conversation")} />
        </div>

        <div className="msg__conv-list">
          {loading ? (
            <div className="msg__loading">
              <LoadingSpinner />
            </div>
          ) : conversations.length === 0 ? (
            <EmptyConversations onNewConversation={() => setShowNewModal(true)} t={t} />
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.type === "group" ? `g_${conv.group.id}` : `p_${conv.partner.id}`}
                conversation={conv}
                isActive={
                  conv.type === "group"
                    ? activeGroupId === String(conv.group.id)
                    : activeUserId === String(conv.partner?.id)
                }
                onClick={() =>
                  selectConversation(
                    conv.type === "group" ? conv.group.id : conv.partner.id,
                    conv.type === "group",
                  )
                }
                t={t}
              />
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className={`msg__chat ${mobileView === "list" ? "hidden-mobile" : ""}`}>
        {!activeConversation ? (
          <EmptyChat t={t} />
        ) : loadingMessages ? (
          <div className="msg__loading">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="msg__chat-header">
              <button className="msg__back-btn" onClick={handleBack}>
                <ChevronLeftIcon />
              </button>
              <div
                className="msg__chat-user-link"
                onClick={() => !isGroupActive && navigate(`/profile/${partner?.username}`)}
                style={{ cursor: isGroupActive ? "default" : "pointer" }}
              >
                {isGroupActive ? (
                  <div className="msg__avatar msg__avatar--group" style={{ width: 40, height: 40 }}>
                    {groupDetails?.image_url ? (
                      <img
                        src={groupDetails.image_url}
                        alt={groupDetails.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <UsersIcon />
                    )}
                  </div>
                ) : (
                  <Avatar src={partner?.avatar} name={partner?.name} size={40} />
                )}
                <div className="msg__chat-info">
                  <h2 className="msg__chat-name">
                    {isGroupActive ? groupDetails?.name || "Grupo" : partner?.name}
                  </h2>
                  <span className="msg__chat-username">
                    {isGroupActive
                      ? t("messages.group_chat", "Chat de grupo")
                      : `@${partner?.username}`}
                    {typing && !isGroupActive && (
                      <span className="msg__typing-indicator">{t("messages.typing")}</span>
                    )}
                  </span>
                </div>
              </div>
              <div
                className="msg__header-actions"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {conversationStatus?.is_mutual && !isGroupActive && (
                  <span className="msg__mutual-badge" title={t("messages.mutual_followers")}>
                    <UsersIcon />
                    {t("messages.mutual")}
                  </span>
                )}
                {isGroupActive && (
                  <button
                    className="msg__header-btn"
                    onClick={() => setShowGroupSettingsModal(true)}
                    title={t("messages.group_info", "Info")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                      borderRadius: "50%",
                    }}
                  >
                    <InfoIcon />
                  </button>
                )}
              </div>
            </header>

            {/* Restriction Banner */}
            <RestrictionBanner
              isMutual={conversationStatus?.is_mutual}
              canSend={canSend}
              restrictionReason={conversationStatus?.restriction_reason}
              t={t}
            />

            {/* Messages */}
            <div className="msg__messages">
              {messages.map((msg, idx) => {
                const prevMsg = messages[idx - 1];
                const showAvatar =
                  !msg.is_own &&
                  (!prevMsg || prevMsg.is_own || prevMsg.sender_id !== msg.sender_id);

                return (
                  <MessageBubble
                    key={msg.id || msg.tempId}
                    message={msg}
                    showAvatar={showAvatar}
                    partnerAvatar={partner?.avatar}
                    partnerName={partner?.name}
                    isGroup={isGroupActive}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="msg__input-area">
              {canSend ? (
                <>
                  <div className="msg__input-wrapper">
                    <textarea
                      ref={inputRef}
                      className={`msg__input ${newMessage.length > MAX_MESSAGE_LENGTH * 0.9 ? "msg__input--warning" : ""}`}
                      placeholder={
                        conversationStatus?.is_mutual
                          ? t("messages.type_message")
                          : t("messages.type_message_limited")
                      }
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      rows={1}
                      maxLength={MAX_MESSAGE_LENGTH}
                    />
                    {newMessage.length > MAX_MESSAGE_LENGTH * 0.7 && (
                      <span
                        className={`msg__char-counter ${newMessage.length >= MAX_MESSAGE_LENGTH ? "msg__char-counter--limit" : newMessage.length > MAX_MESSAGE_LENGTH * 0.9 ? "msg__char-counter--warning" : ""}`}
                      >
                        {newMessage.length}/{MAX_MESSAGE_LENGTH}
                      </span>
                    )}
                  </div>
                  <button
                    className="msg__send-btn"
                    onClick={handleSend}
                    disabled={
                      !newMessage.trim() || sending || newMessage.length > MAX_MESSAGE_LENGTH
                    }
                  >
                    {sending ? <LoadingSpinner size={20} /> : <SendIcon />}
                  </button>
                </>
              ) : (
                <div className="msg__input-disabled">
                  <LockIcon />
                  <span>{t("messages.waiting_follow")}</span>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <NewConversationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSelectUser={handleNewUserSelect}
        t={t}
      />

      <NewGroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupCreated={handleGroupCreated}
        t={t}
      />

      {showGroupSettingsModal && isGroupActive && groupDetails && (
        <GroupSettingsModal
          group={groupDetails}
          members={groupDetails.members || []}
          currentUser={user}
          onClose={() => setShowGroupSettingsModal(false)}
          onGroupUpdated={(updatedGroup) => {
            setGroupDetails((prev) => ({ ...prev, ...updatedGroup }));
            setConversations((prev) => {
              const updated = [...prev];
              const idx = updated.findIndex(
                (c) => c.type === "group" && c.group?.id === updatedGroup.id,
              );
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  group: { ...updated[idx].group, ...updatedGroup },
                };
              }
              return updated;
            });
          }}
        />
      )}
    </div>
  );
}
