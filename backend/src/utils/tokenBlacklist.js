import { createHash } from "crypto";
import redisClient from "../config/redis.js";

const BLACKLIST_PREFIX = "blacklist:";

// Generate a SHA-256 hash of the JWT.
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// Add a revoked token to Redis.
export async function revokeToken(token, expiresAt) {
  const ttl = Math.floor(expiresAt - Date.now() / 1000);

  if (ttl <= 0) {
    return;
  }

  const key = `${BLACKLIST_PREFIX}${hashToken(token)}`;

  await redisClient.set(key, "1", {
    EX: ttl,
  });
}

// Check whether a token has been revoked.
export async function isTokenRevoked(token) {
  const key = `${BLACKLIST_PREFIX}${hashToken(token)}`;

  const result = await redisClient.exists(key);

  return result === 1;
}
