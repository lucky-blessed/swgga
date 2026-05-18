// src/lib/db/redis.ts
// Upstash Redis client used for JWT blacklist, BullMQ queue, and dashboard cache

import { Redis } from '@upstash/redis'

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})