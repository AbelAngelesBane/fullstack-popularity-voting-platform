import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export const notificationQueue = new Queue("notification-queue", {
  connection: redisConnection,
});