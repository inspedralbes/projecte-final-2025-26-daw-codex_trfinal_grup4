require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "socket",
    timestamp: new Date().toISOString(),
  });
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Redis Subscriber
const { createRedisClient } = require("./config/redis");
const redisSubscriber = createRedisClient();

redisSubscriber.on("connect", () => {
  console.log("[Socket.io] Connected to Redis");
});

redisSubscriber.on("error", (err) => {
  console.error("[Socket.io] Redis connection error:", err);
});

// Subscribe to Laravel channels
// Laravel usually publishes to 'laravel_database_<channel>' or just provided channel name depending on config.
// We'll subscribe to a wildcard or specific channels as needed.
// For now, let's subscribe to a generic pattern or specific known channels.
// Assuming 'laravel_database_private-channel' is a placeholder, strictly following CONTEXT.md example:
redisSubscriber.subscribe("laravel_database_general");

redisSubscriber.on("message", (channel, message) => {
  console.log(
    `[Socket.io] Received message from Redis channel ${channel}:`,
    message,
  );
  try {
    const parsedMessage = JSON.parse(message);
    // Broadcast to all clients or specific rooms based on logic
    // Example: io.emit(parsedMessage.event, parsedMessage.data);
    io.emit("laravel_event", parsedMessage);
  } catch (e) {
    console.error("[Socket.io] Error parsing Redis message:", e);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Socket.io] Server running on port ${PORT}`);
});
