import { Redis } from "ioredis";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "";

const publisher = new Redis(REDIS_URL);
const subscriber = publisher.duplicate();

export { publisher, subscriber };
