const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const createRedisClient = () => {
  return new Redis(redisConfig);
};

module.exports = { createRedisClient, redisConfig };
