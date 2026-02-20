/**
 * Socket Service
 * Socket.io client connection and event handling
 */
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

let socket = null;

const socketService = {
  /**
   * Initialize socket connection
   * @param {string} token - Auth token (optional, for future auth middleware)
   * @returns {Socket} Socket.io instance
   */
  connect: (token = null) => {
    if (socket && socket.connected) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      auth: token ? { token } : {},
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.io] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket.io] Connection error:", error.message);
    });

    return socket;
  },

  /**
   * Get the current socket instance
   * @returns {Socket|null}
   */
  getSocket: () => socket,

  /**
   * Disconnect socket
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Join user's personal room for notifications
   * @param {number} userId - User ID
   */
  joinUserRoom: (userId) => {
    if (socket && socket.connected) {
      socket.emit("join", { userId });
      console.log("[Socket.io] Joined room: user." + userId);
    }
  },

  /**
   * Join a post room for live comments
   * @param {number} postId - Post ID
   */
  joinPostRoom: (postId) => {
    if (socket && socket.connected) {
      socket.emit("join-post", { postId });
      console.log("[Socket.io] Joined room: post." + postId);
    }
  },

  /**
   * Leave a post room
   * @param {number} postId - Post ID
   */
  leavePostRoom: (postId) => {
    if (socket && socket.connected) {
      socket.emit("leave-post", { postId });
      console.log("[Socket.io] Left room: post." + postId);
    }
  },

  /**
   * Listen for new notifications
   * @param {Function} callback - Handler function
   */
  onNotification: (callback) => {
    if (socket) {
      socket.on("new.notification", callback);
    }
  },

  /**
   * Listen for new interactions (likes, bookmarks)
   * @param {Function} callback - Handler function
   */
  onInteraction: (callback) => {
    if (socket) {
      socket.on("new.interaction", callback);
    }
  },

  /**
   * Listen for new comments on a post
   * @param {Function} callback - Handler function
   */
  onComment: (callback) => {
    if (socket) {
      socket.on("new.comment", callback);
    }
  },

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Handler to remove
   */
  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  },
};

export default socketService;
