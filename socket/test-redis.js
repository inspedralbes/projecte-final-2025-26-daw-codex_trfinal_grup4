const io = require("socket.io-client");
const Redis = require("ioredis");

console.log("[Test] Starting Redis -> Socket.io integration test...");

// Configuration
const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:8080";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const CHANNEL = "laravel_database_general";

// 1. Setup Redis Publisher
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: 1,
});

redis.on("error", (err) => {
  console.error("[Test] Redis Error:", err.message);
  console.log(
    "[Test] Make sure Redis is running on localhost:6379 or set REDIS_HOST/REDIS_PORT env vars.",
  );
  process.exit(1);
});

// 2. Setup Socket.io Client
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 5000,
});

const testMessage = {
  event: "NewPost",
  data: {
    id: 123,
    title: "Hello from Redis Test",
    content: "This message was published via Redis and received via Socket.io",
  },
};

let received = false;

socket.on("connect", () => {
  console.log(`[Test] Connected to Socket.io server at ${SOCKET_URL}`);

  // 3. Publish Message after connecting
  setTimeout(async () => {
    console.log(`[Test] Publishing message to channel "${CHANNEL}"...`);
    console.log("[Test] Payload:", JSON.stringify(testMessage));

    try {
      // Laravel Echo broadcasts usually send a JSON string
      await redis.publish(CHANNEL, JSON.stringify(testMessage));
      console.log("[Test] Message published.");
    } catch (err) {
      console.error("[Test] Failed to publish:", err);
      process.exit(1);
    }
  }, 1000);
});

socket.on("connect_error", (err) => {
  console.error("[Test] Socket connection error:", err.message);
  console.log(
    `[Test] Make sure the Socket.io server is running on ${SOCKET_URL}`,
  );
});

// 4. Listen for the broadcasted event
socket.on("laravel_event", (data) => {
  console.log('[Test] ✅ SUCCESS! Received "laravel_event" from server:');
  console.log(JSON.stringify(data, null, 2));

  if (data.data && data.data.id === testMessage.data.id) {
    console.log("[Test] Data matches sent payload.");
    received = true;
    cleanup();
  } else {
    console.warn("[Test] Warning: Data received does not match sent payload.");
  }
});

function cleanup() {
  redis.quit();
  socket.disconnect();
  console.log("[Test] Test finished.");
  process.exit(received ? 0 : 1);
}

// Timeout
setTimeout(() => {
  if (!received) {
    console.error(
      "[Test] ❌ TIMEOUT: Did not receive message within 10 seconds.",
    );
    cleanup();
  }
}, 10000);
