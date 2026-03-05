require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createRedisClient } = require("./config/redis");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
  path: "/socket.io/",
});

// ─── Health check ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "socket",
    timestamp: new Date().toISOString(),
    subscribedChannels: Array.from(subscribedChannels),
  });
});

// ─── Track subscribed channels (for debugging) ───────────────
const subscribedChannels = new Set();

// ─── Socket.io connection handling ────────────────────────────
io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  /**
   * Clients join their personal room so they receive
   * notifications, interactions, etc.
   *   socket.emit('join', { userId: 3 })
   */
  socket.on("join", (data) => {
    if (data && data.userId) {
      const room = `user.${data.userId}`;
      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room ${room}`);
    }
  });

  /**
   * Clients join the admin room to receive global admin notifications.
   *   socket.emit('join-admin')
   */
  socket.on("join-admin", () => {
    socket.join("admin");
    console.log(`[Socket.io] ${socket.id} joined room admin`);
  });

  /**
   * Clients join a post room to receive live comments.
   *   socket.emit('join-post', { postId: 1 })
   */
  socket.on("join-post", (data) => {
    if (data && data.postId) {
      const room = `post.${data.postId}`;
      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room ${room}`);
    }
  });

  /**
   * Leave a post room.
   *   socket.emit('leave-post', { postId: 1 })
   */
  socket.on("leave-post", (data) => {
    if (data && data.postId) {
      const room = `post.${data.postId}`;
      socket.leave(room);
      console.log(`[Socket.io] ${socket.id} left room ${room}`);
    }
  });

  /**
   * Clients join a profile room to receive live follower updates.
   * Accepts { userId: 5 } or { profileId: 5 }
   */
  socket.on("join-profile", (data) => {
    const id = data?.userId || data?.profileId;
    if (id) {
      const room = `profile.${id}`;
      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room ${room}`);
    }
  });

  /**
   * Leave a profile room.
   */
  socket.on("leave-profile", (data) => {
    const id = data?.userId || data?.profileId;
    if (id) {
      const room = `profile.${id}`;
      socket.leave(room);
      console.log(`[Socket.io] ${socket.id} left room ${room}`);
    }
  });

  /**
   * Clients join a chat room to receive live messages.
   * Chat room ID is always the two user IDs sorted and joined with hyphen.
   *   socket.emit('join-chat', { partnerId: 5 }) // Current user + partner
   */
  socket.on("join-chat", (data) => {
    if (data && data.partnerId && data.userId) {
      const ids = [data.userId, data.partnerId].sort((a, b) => a - b);
      const room = `chat.${ids[0]}-${ids[1]}`;
      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room ${room}`);
    }
  });

  /**
   * Leave a chat room.
   */
  socket.on("leave-chat", (data) => {
    if (data && data.partnerId && data.userId) {
      const ids = [data.userId, data.partnerId].sort((a, b) => a - b);
      const room = `chat.${ids[0]}-${ids[1]}`;
      socket.leave(room);
      console.log(`[Socket.io] ${socket.id} left room ${room}`);
    }
  });

  /**
   * Typing indicator for chat.
   *   socket.emit('typing', { partnerId: 5, userId: 3 })
   */
  socket.on("typing", (data) => {
    if (data && data.partnerId && data.userId) {
      const ids = [data.userId, data.partnerId].sort((a, b) => a - b);
      const room = `chat.${ids[0]}-${ids[1]}`;
      socket.to(room).emit("user.typing", {
        userId: data.userId,
        isTyping: data.isTyping !== false,
      });
    }
  });

  /**
   * P2P Send Message
   * The client sends the message via socket for immediate delivery.
   * The socket persists it via the API and broadcasts to the room.
   *   socket.emit('send-message', { receiverId, content, tempId, token })
   */
  socket.on("send-message", async (data, callback) => {
    console.log("[Socket.io] Received send-message event:", {
      receiverId: data?.receiverId,
      hasContent: !!data?.content,
      hasToken: !!data?.token,
      hasTempId: !!data?.tempId,
      hasCallback: typeof callback === "function",
    });

    const { receiverId, content, tempId, token } = data || {};

    if (!receiverId || !content || !token) {
      console.log("[Socket.io] Missing required fields");
      if (callback)
        callback({ success: false, error: "Missing required fields" });
      return;
    }

    try {
      // Call Laravel API to persist the message and validate restrictions
      // Use API_URL which points to the public HTTPS endpoint
      const apiUrl = process.env.API_URL || "http://localhost:8080";
      console.log(
        `[Socket.io] Sending message to API: ${apiUrl}/api/chat/messages`,
        {
          receiver_id: receiverId,
          content: content.trim().substring(0, 50) + "...",
        },
      );

      const response = await fetch(`${apiUrl}/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-Socket-P2P": "true", // Skip Laravel broadcast, socket handles it
        },
        body: JSON.stringify({
          receiver_id: parseInt(receiverId, 10),
          content: content.trim(),
        }),
      });

      const result = await response.json();
      console.log(`[Socket.io] API response: ${response.status}`, result);

      if (!response.ok) {
        if (callback)
          callback({
            success: false,
            error: result.message || "Failed to send message",
          });
        return;
      }

      // Broadcast to the chat room (both sender and receiver)
      const senderId = result.message.sender_id;
      const ids = [senderId, receiverId].sort((a, b) => a - b);
      const chatRoom = `chat.${ids[0]}-${ids[1]}`;

      // Emit with tempId so sender can match and update local state
      io.to(chatRoom).emit("new.message", {
        ...result.message,
        tempId: tempId,
      });

      console.log(`[Socket.io] P2P message sent in room ${chatRoom}`);

      // Confirm to sender
      if (callback) callback({ success: true, message: result.message });
    } catch (err) {
      console.error(
        "[Socket.io] Error sending P2P message:",
        err.message,
        err.stack,
      );
      if (callback)
        callback({ success: false, error: err.message || "Server error" });
    }
  });

  /**
   * Mark messages as read via socket
   *   socket.emit('mark-read', { partnerId, token })
   */
  socket.on("mark-read", async (data) => {
    const { partnerId, userId, token } = data || {};

    if (!partnerId || !token) return;

    try {
      // Use API_URL which points to the public HTTPS endpoint
      const apiUrl = process.env.API_URL || "http://localhost:8080";
      await fetch(`${apiUrl}/api/chat/conversations/${partnerId}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Broadcast read status
      if (userId) {
        const ids = [userId, partnerId].sort((a, b) => a - b);
        const chatRoom = `chat.${ids[0]}-${ids[1]}`;
        io.to(chatRoom).emit("messages.read", {
          reader_id: userId,
          conversation_user_id: partnerId,
        });
      }
    } catch (err) {
      console.error("[Socket.io] Error marking messages read:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ─── Redis Subscriber ─────────────────────────────────────────
//
// Laravel publishes broadcast events to Redis with the key format:
//   <prefix><channel_name>
//
// With the default Laravel config (APP_NAME=TFG, Str::slug prefix)
// the Redis key is:  tfg-database-<channel>
//
// e.g. channel "user.3"  → Redis key "tfg-database-user.3"
//      channel "post.1"  → Redis key "tfg-database-post.1"
//
// We use psubscribe with a wildcard pattern to capture ALL
// Laravel broadcast channels, then strip the prefix and emit
// to the matching Socket.io room.
// ───────────────────────────────────────────────────────────────

const REDIS_PREFIX = process.env.REDIS_PREFIX || "tfg-database-";

const redisSubscriber = createRedisClient();

redisSubscriber.on("connect", () => {
  console.log("[Socket.io] Redis subscriber connected");
});

redisSubscriber.on("error", (err) => {
  console.error("[Socket.io] Redis subscriber error:", err.message);
});

// Subscribe to all channels with the Laravel prefix
const pattern = `${REDIS_PREFIX}*`;
redisSubscriber.psubscribe(pattern, (err) => {
  if (err) {
    console.error("[Socket.io] Failed to psubscribe:", err.message);
  } else {
    console.log(`[Socket.io] Subscribed to pattern: ${pattern}`);
  }
});

redisSubscriber.on("pmessage", (_pattern, channel, rawMessage) => {
  // Enhanced prefix stripping to handle various Laravel naming conventions
  // (hyphens, underscores, or colons)
  let laravelChannel = channel;

  if (channel.startsWith(REDIS_PREFIX)) {
    laravelChannel = channel.slice(REDIS_PREFIX.length);
  } else {
    // Fallback search if the prefix isn't exactly at the start
    laravelChannel = channel
      .replace("tfg-database-", "")
      .replace("tfg_database_", "")
      .replace("laravel_database_", "");
  }

  subscribedChannels.add(laravelChannel);

  try {
    const payload = JSON.parse(rawMessage);

    // Laravel wraps broadcast data in { event: '...', data: {...} }
    const eventName = payload.event; // e.g. "new.notification"
    const eventData = payload.data; // the broadcastWith() object

    console.log(
      `[Socket.io] Redis ← channel=${laravelChannel} event=${eventName}`,
    );

    // Emit to the matching Socket.io room
    // Laravel channel "user.3"  → Socket.io room "user.3"
    // Laravel channel "post.1"  → Socket.io room "post.1"
    io.to(laravelChannel).emit(eventName, eventData);
    console.log(`[Socket.io] Emitted ${eventName} to room ${laravelChannel}`);
  } catch (err) {
    console.error(
      `[Socket.io] Error processing message from ${channel}:`,
      err.message,
    );
  }
});

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Socket.io] Server running on port ${PORT}`);
  console.log(`[Socket.io] Redis prefix: "${REDIS_PREFIX}"`);
});
