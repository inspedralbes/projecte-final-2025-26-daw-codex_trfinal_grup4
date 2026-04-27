/**
 * Socket Context
 * Provides Socket.io connection and real-time event handling throughout the app
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import socketService from "@/services/socketService";
import notificationsService from "@/services/notificationsService";
import chatService from "@/services/chatService";
import { useAuth } from "@/hooks/useAuth";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  // Track which conversation is currently open (to avoid incrementing unread for active chat)
  const activeConversationRef = useRef(null);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      const socket = socketService.connect(token);

      const handleConnect = () => {
        setIsConnected(true);
        // Join user's personal room for notifications
        socketService.joinUserRoom(user.id);

        // Auto-join all group rooms so we receive group messages globally
        chatService.getGroups()
          .then((response) => {
            const groups = response.groups || [];
            groups.forEach((g) => {
              socketService.joinGroupRoom(g.id);
            });
            console.log(`[Socket] Auto-joined ${groups.length} group rooms`);
          })
          .catch((err) => console.error("Error auto-joining group rooms:", err));
      };

      const handleDisconnect = () => {
        setIsConnected(false);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      // If already connected, join room immediately
      if (socket.connected) {
        handleConnect();
      }

      // Fetch initial unread count from API
      notificationsService.getNotifications({ page: 1 })
        .then((response) => {
          const data = response.data || response;
          const meta = data.meta || {};
          setUnreadCount(meta.unread_count || 0);
        })
        .catch((err) => console.error("Error fetching notification count:", err));

      // Fetch initial unread messages count from API
      chatService.getUnreadCount()
        .then((response) => {
          setUnreadMessagesCount(response.unread_count || 0);
        })
        .catch((err) => console.error("Error fetching unread messages count:", err));

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socketService.disconnect();
      };
    }
  }, [user]);

  // Handle real-time notifications
  useEffect(() => {
    if (!user) return;

    const handleNotification = (notification) => {
      console.log("[Socket] New notification:", notification);
      setUnreadCount((prev) => prev + 1);
      
      // Dispatch custom event for components to handle
      window.dispatchEvent(
        new CustomEvent("codex:notification", { detail: notification })
      );
    };

    socketService.onNotification(handleNotification);

    return () => {
      socketService.off("new.notification", handleNotification);
    };
  }, [user]);

  // Handle real-time messages (global listener)
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (message) => {
      console.log("[Socket] New message (global):", message);
      
      const senderId = parseInt(message.sender_id, 10);
      const msgGroupId = message.group_id ? parseInt(message.group_id, 10) : null;
      const activeChat = activeConversationRef.current;
      
      // Determine if the message belongs to the active conversation
      let isForActiveChat = false;
      if (activeChat) {
        if (msgGroupId && activeChat.type === "group" && activeChat.id === msgGroupId) {
          isForActiveChat = true;
        } else if (!msgGroupId && activeChat.type === "user" && activeChat.id === senderId) {
          isForActiveChat = true;
        }
      }
      
      // Only increment counter for messages from others AND not in the active conversation
      if (senderId !== user.id && !isForActiveChat) {
        setUnreadMessagesCount((prev) => prev + 1);
      }
      
      // Dispatch custom event for ALL messages (including own for tempId replacement)
      window.dispatchEvent(
        new CustomEvent("codex:message", { detail: message })
      );
    };

    const handleGroupUpdate = (data) => {
      console.log("[Socket] Group updated:", data);
      window.dispatchEvent(
        new CustomEvent("codex:group_updated", { detail: data })
      );
    };

    const handleGroupMemberChange = (data) => {
      console.log("[Socket] Group member changed:", data);
      const groupId = parseInt(data.group_id, 10);
      const action = data.action;
      const changedUser = data.user;
      const currentUserId = parseInt(user?.id, 10);

      // If CURRENT user was added to a group, join the room immediately
      if (changedUser.id === currentUserId && action === 'added') {
        console.log(`[Socket] We were added to group ${groupId}, joining room...`);
        socketService.joinGroupRoom(groupId);
      }

      window.dispatchEvent(
        new CustomEvent("codex:group_member_changed", { detail: data })
      );
    };

    socketService.onMessage(handleNewMessage);
    socketService.onGroupUpdate(handleGroupUpdate);
    socketService.onGroupMemberChange(handleGroupMemberChange);

    return () => {
      socketService.off("new.message", handleNewMessage);
      socketService.off("group.updated", handleGroupUpdate);
      socketService.off("group.member_changed", handleGroupMemberChange);
    };
  }, [user]);

  // Join a post room for live comments
  const joinPost = useCallback((postId) => {
    socketService.joinPostRoom(postId);
  }, []);

  // Leave a post room
  const leavePost = useCallback((postId) => {
    socketService.leavePostRoom(postId);
  }, []);

  // Subscribe to new comments on current post
  const onNewComment = useCallback((callback) => {
    socketService.onComment(callback);
    return () => socketService.off("new.comment", callback);
  }, []);

  // Subscribe to new notifications
  const onNewNotification = useCallback((callback) => {
    const handleNotif = (event) => callback(event.detail);
    window.addEventListener("codex:notification", handleNotif);
    return () => window.removeEventListener("codex:notification", handleNotif);
  }, []);

  // Update unread count (for when fetched from API)
  const setNotificationCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  // Decrement unread count
  const decrementUnread = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Reset unread count (when marking all as read)
  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Subscribe to new messages globally
  const onNewMessage = useCallback((callback) => {
    const handleMsg = (event) => callback(event.detail);
    window.addEventListener("codex:message", handleMsg);
    return () => window.removeEventListener("codex:message", handleMsg);
  }, []);

  // Subscribe to group updates globally
  const onGroupUpdate = useCallback((callback) => {
    const handleUpdate = (event) => callback(event.detail);
    window.addEventListener("codex:group_updated", handleUpdate);
    return () => window.removeEventListener("codex:group_updated", handleUpdate);
  }, []);

  // Subscribe to group member changes globally
  const onGroupMemberChange = useCallback((callback) => {
    const handleChange = (event) => callback(event.detail);
    window.addEventListener("codex:group_member_changed", handleChange);
    return () => window.removeEventListener("codex:group_member_changed", handleChange);
  }, []);

  // Set unread messages count (for when fetched from API or updater function)
  const setMessagesCount = useCallback((countOrUpdater) => {
    setUnreadMessagesCount(countOrUpdater);
  }, []);

  // Decrement unread messages count
  const decrementMessagesUnread = useCallback(() => {
    setUnreadMessagesCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Set active conversation (to prevent incrementing unread for messages in this chat)
  // Accepts: null, { type: 'user', id: number } or { type: 'group', id: number }
  const setActiveChat = useCallback((chatInfo) => {
    if (!chatInfo) {
      activeConversationRef.current = null;
    } else if (typeof chatInfo === "object" && chatInfo.type) {
      activeConversationRef.current = { type: chatInfo.type, id: parseInt(chatInfo.id, 10) };
    } else {
      // Legacy fallback: treat as user ID
      activeConversationRef.current = { type: "user", id: parseInt(chatInfo, 10) };
    }
  }, []);

  // Reset unread messages count
  const resetMessagesUnread = useCallback(() => {
    setUnreadMessagesCount(0);
  }, []);

  const value = {
    isConnected,
    unreadCount,
    unreadMessagesCount,
    setNotificationCount,
    decrementUnread,
    resetUnread,
    setMessagesCount,
    decrementMessagesUnread,
    resetMessagesUnread,
    setActiveChat,
    joinPost,
    leavePost,
    onNewComment,
    onNewNotification,
    onNewMessage,
    onGroupUpdate,
    onGroupMemberChange,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
