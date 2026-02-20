/**
 * Socket Context
 * Provides Socket.io connection and real-time event handling throughout the app
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import socketService from "@/services/socketService";
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

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      const socket = socketService.connect(token);

      const handleConnect = () => {
        setIsConnected(true);
        // Join user's personal room for notifications
        socketService.joinUserRoom(user.id);
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

  const value = {
    isConnected,
    unreadCount,
    setNotificationCount,
    decrementUnread,
    resetUnread,
    joinPost,
    leavePost,
    onNewComment,
    onNewNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
