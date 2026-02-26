/**
 * Socket Service
 * Socket.io client connection and event handling
 */
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

const rooms = new Set(); // Track joined rooms for auto-rejoin
let socket = null;

const socketService = {
  /**
   * Initialize socket connection
   * @param {string} token - Auth token
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
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected:", socket.id);
      socketService.rejoinRooms();
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
    if (socket) {
      socket.emit("join", { userId });
      rooms.add(`user.${userId}`);
      console.log("[Socket.io] Joined room: user." + userId);
    }
  },

  /**
   * Join a post room for live comments
   * @param {number} postId - Post ID
   */
  joinPostRoom: (postId) => {
    if (socket) {
      socket.emit("join-post", { postId });
      rooms.add(`post.${postId}`);
      console.log("[Socket.io] Joined room: post." + postId);
    }
  },

  /**
   * Leave a post room
   * @param {number} postId - Post ID
   */
  leavePostRoom: (postId) => {
    if (socket) {
      socket.emit("leave-post", { postId });
      rooms.delete(`post.${postId}`);
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
   * Join a profile room for live follower/stat updates
   * @param {number} userId - User ID whose profile to watch
   */
  joinProfileRoom: (userId) => {
    if (socket) {
      socket.emit("join-profile", { userId });
      rooms.add(`profile.${userId}`);
      console.log("[Socket.io] Joined room: profile." + userId);
    }
  },

  /**
   * Leave a profile room
   * @param {number} userId - User ID
   */
  leaveProfileRoom: (userId) => {
    if (socket) {
      socket.emit("leave-profile", { userId });
      rooms.delete(`profile.${userId}`);
      console.log("[Socket.io] Left room: profile." + userId);
    }
  },

  /**
   * Rejoin all tracked rooms (called on connect)
   */
  rejoinRooms: () => {
    if (socket && socket.connected) {
      rooms.forEach((room) => {
        const [type, id] = room.split(".");
        if (type === "user") socket.emit("join", { userId: id });
        if (type === "post") socket.emit("join-post", { postId: id });
        if (type === "profile") socket.emit("join-profile", { userId: id });
        console.log("[Socket.io] Rejoined room: " + room);
      });
    }
  },

  /**
   * Listen for profile updates (follower count changes, profile edits)
   * @param {Function} callback - Handler function
   */
  onProfileUpdate: (callback) => {
    if (socket) {
      socket.on("profile.updated", callback);
    }
  },

  /**
   * Listen for any event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
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
