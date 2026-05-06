/**
 * Socket Service
 * Socket.io client connection and event handling
 */
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

const rooms = new Set(); // Track joined rooms for auto-rejoin
let socket = null;
let authToken = null; // Store auth token for P2P messaging

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

    authToken = token; // Store token for later use

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
   * Update the auth token (after login)
   * @param {string} token - New auth token
   */
  setAuthToken: (token) => {
    authToken = token;
  },

  /**
   * Get the current auth token
   * @returns {string|null}
   */
  getAuthToken: () => authToken,

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
   * Join the global admin room
   */
  joinAdminRoom: () => {
    if (socket) {
      socket.emit("join-admin");
      rooms.add("admin");
      console.log("[Socket.io] Joined room: admin");
    }
  },

  /**
   * Leave the admin room
   */
  leaveAdminRoom: () => {
    if (socket) {
      socket.emit("leave-admin"); // Optional: handle in server if needed, or just leave
      rooms.delete("admin");
      console.log("[Socket.io] Left room: admin");
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
   * Join a chat room for live messages
   * @param {number} userId - Current user ID
   * @param {number} partnerId - Chat partner ID
   */
  joinChatRoom: (userId, partnerId) => {
    if (socket) {
      socket.emit("join-chat", { userId, partnerId });
      const ids = [userId, partnerId].sort((a, b) => a - b);
      rooms.add(`chat.${ids[0]}-${ids[1]}`);
      console.log(`[Socket.io] Joined room: chat.${ids[0]}-${ids[1]}`);
    }
  },

  /**
   * Leave a chat room
   * @param {number} userId - Current user ID
   * @param {number} partnerId - Chat partner ID
   */
  leaveChatRoom: (userId, partnerId) => {
    if (socket) {
      socket.emit("leave-chat", { userId, partnerId });
      const ids = [userId, partnerId].sort((a, b) => a - b);
      rooms.delete(`chat.${ids[0]}-${ids[1]}`);
      console.log(`[Socket.io] Left room: chat.${ids[0]}-${ids[1]}`);
    }
  },

  /**
   * Join a group room for live messages
   * @param {number} groupId - Group ID
   */
  joinGroupRoom: (groupId) => {
    if (socket) {
      socket.emit("join-group", { groupId });
      rooms.add(`group.${groupId}`);
      console.log("[Socket.io] Joined room: group." + groupId);
    }
  },

  /**
   * Leave a group room
   * @param {number} groupId - Group ID
   */
  leaveGroupRoom: (groupId) => {
    if (socket) {
      socket.emit("leave-group", { groupId });
      rooms.delete(`group.${groupId}`);
      console.log("[Socket.io] Left room: group." + groupId);
    }
  },

  /**
   * Send typing indicator
   * @param {number} userId - Current user ID
   * @param {number} partnerId - Chat partner ID
   * @param {boolean} isTyping - Whether the user is typing
   */
  sendTypingIndicator: (userId, partnerId, isTyping = true) => {
    if (socket) {
      socket.emit("typing", { userId, partnerId, isTyping });
    }
  },

  /**
   * Send a P2P message via socket
   * @param {number|null} receiverId - Receiver user ID (for 1:1)
   * @param {string} content - Message content
   * @param {string} tempId - Temporary ID for optimistic update
   * @param {number|null} groupId - Group ID (for group chats)
   * @returns {Promise<{success: boolean, message?: object, error?: string}>}
   */
  sendMessage: (receiverId, content, tempId, groupId = null) => {
    return new Promise((resolve) => {
      if (!socket || !socket.connected) {
        console.error("[Socket.io] sendMessage: Not connected");
        resolve({ success: false, error: "Not connected" });
        return;
      }

      if (!authToken) {
        console.error("[Socket.io] sendMessage: No auth token");
        resolve({ success: false, error: "Not authenticated" });
        return;
      }

      console.log("[Socket.io] Sending message:", {
        receiverId,
        groupId,
        contentLength: content?.length,
        tempId,
        hasToken: !!authToken,
      });

      // Timeout in case server doesn't respond
      const timeout = setTimeout(() => {
        console.error("[Socket.io] sendMessage: Timeout");
        resolve({ success: false, error: "Server timeout" });
      }, 10000);

      socket.emit("send-message", { receiverId, groupId, content, tempId, token: authToken }, (response) => {
        clearTimeout(timeout);
        console.log("[Socket.io] sendMessage response:", response);
        resolve(response || { success: false, error: "No response" });
      });
    });
  },

  /**
   * Mark messages as read via socket (P2P)
   * @param {number} userId - Current user ID
   * @param {number} partnerId - Partner ID whose messages to mark read
   */
  markMessagesRead: (userId, partnerId) => {
    if (socket && authToken) {
      socket.emit("mark-read", { userId, partnerId, token: authToken });
    }
  },

  /**
   * Listen for new messages
   * @param {Function} callback - Handler function
   */
  onMessage: (callback) => {
    if (socket) {
      socket.on("new.message", callback);
    }
  },

  /**
   * Listen for messages read events
   * @param {Function} callback - Handler function
   */
  onMessagesRead: (callback) => {
    if (socket) {
      socket.on("messages.read", callback);
    }
  },

  /**
   * Listen for typing indicator
   * @param {Function} callback - Handler function
   */
  onTyping: (callback) => {
    if (socket) {
      socket.on("user.typing", callback);
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
        if (room === "admin") socket.emit("join-admin");
        if (type === "group") socket.emit("join-group", { groupId: parseInt(id) });
        if (type === "chat") {
          const [userId, partnerId] = id.split("-");
          socket.emit("join-chat", { userId: parseInt(userId), partnerId: parseInt(partnerId) });
        }
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
   * Listen for admin events
   * @param {Function} callback - Handler function
   */
  onAdminEvent: (callback) => {
    if (socket) {
      socket.on("admin.new_request", callback);
    }
  },

  /**
   * Listen for group updates (name, image)
   * @param {Function} callback - Handler function
   */
  onGroupUpdate: (callback) => {
    if (socket) {
      socket.on("group.updated", callback);
    }
  },

  /**
   * Listen for group membership changes (add, remove, leave)
   * @param {Function} callback - Handler function
   */
  onGroupMemberChange: (callback) => {
    if (socket) {
      socket.on("group.member_changed", callback);
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

  // ─── WebRTC Signaling ────────────────────────────────────────────────────────
  
  callUser: (data) => {
    if (socket) socket.emit("call-user", data);
  },
  answerCall: (data) => {
    if (socket) socket.emit("make-answer", data);
  },
  sendIceCandidate: (data) => {
    if (socket) socket.emit("ice-candidate", data);
  },
  endCall: (data) => {
    if (socket) socket.emit("end-call", data);
  },
  rejectCall: (data) => {
    if (socket) socket.emit("reject-call", data);
  },

  onIncomingCall: (callback) => {
    if (socket) socket.on("call-made", callback);
  },
  onCallAnswered: (callback) => {
    if (socket) socket.on("call-answered", callback);
  },
  onIceCandidate: (callback) => {
    if (socket) socket.on("ice-candidate-received", callback);
  },
  onCallEnded: (callback) => {
    if (socket) socket.on("call-ended", callback);
  },
  onCallRejected: (callback) => {
    if (socket) socket.on("call-rejected", callback);
  },
  
  offIncomingCall: (callback) => {
    if (socket) socket.off("call-made", callback);
  },
  offCallAnswered: (callback) => {
    if (socket) socket.off("call-answered", callback);
  },
  offIceCandidate: (callback) => {
    if (socket) socket.off("ice-candidate-received", callback);
  },
  offCallEnded: (callback) => {
    if (socket) socket.off("call-ended", callback);
  },
  offCallRejected: (callback) => {
    if (socket) socket.off("call-rejected", callback);
  },

  sendVideoToggle: (data) => {
    if (socket) socket.emit("video-toggle", data);
  },
  onPeerVideoToggle: (callback) => {
    if (socket) socket.on("peer-video-toggle", callback);
  },
  offPeerVideoToggle: (callback) => {
    if (socket) socket.off("peer-video-toggle", callback);
  }
};

export default socketService;
