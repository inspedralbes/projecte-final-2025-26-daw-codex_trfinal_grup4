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
  // Strip the prefix to get the original Laravel channel name
  // e.g. "tfg-database-user.3" → "user.3"
  const laravelChannel = channel.replace(REDIS_PREFIX, "");

  subscribedChannels.add(laravelChannel);

  try {
    const payload = JSON.parse(rawMessage);

    // Laravel wraps broadcast data in { event: '...', data: {...} }
    const eventName = payload.event; // e.g. "new.notification"
    const eventData = payload.data;  // the broadcastWith() object

    console.log(
      `[Socket.io] Redis ← channel=${laravelChannel} event=${eventName}`
    );

    // Emit to the matching Socket.io room
    // Laravel channel "user.3"  → Socket.io room "user.3"
    // Laravel channel "post.1"  → Socket.io room "post.1"
    io.to(laravelChannel).emit(eventName, eventData);
  } catch (err) {
    console.error(
      `[Socket.io] Error processing message from ${channel}:`,
      err.message
    );
  }
});

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Socket.io] Server running on port ${PORT}`);
  console.log(`[Socket.io] Redis prefix: "${REDIS_PREFIX}"`);
});
