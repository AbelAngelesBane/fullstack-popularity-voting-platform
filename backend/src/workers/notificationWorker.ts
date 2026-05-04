import { Worker } from "bullmq";
import { redisConnection } from "../lib/redis";
import { prisma } from "../lib/db";
import { messaging } from "../lib/firebase";
import { NotificationType } from "../generated/prisma";

export const notificationWorker = new Worker(
  "notification-queue",
  async (job) => {
    const { pollId, pollName, receivers } = job.data;

    const users = await prisma.user.findMany({
      where: {
        id: { in: receivers },
        userDevice: { not: null },
      },
      select: { userDevice: true, id: true },
    });

    //    type String
    // path String
    // userId String
    // message String
    // title String
    console.log("THERE IS POLLID: ",pollId)

    if (users.length === 0) return;
    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: NotificationType.END_POLL,
        path: `/poll/${pollId}`,
        title: "Poll Closed!",
        message: `The poll "${pollName}" has ended.`,
      })),
      skipDuplicates: true,
    });

    const tokens = users
      .map((u) => u.userDevice)
      .filter((t): t is string => !!t);

    if (tokens.length > 0) {
      //Gemini suggested this: Apparently multicast has a limit of 500.
      if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i += 500) {
          const chunk = tokens.slice(i, i + 500); 

          try {
            const response = await messaging.sendEachForMulticast({
              tokens: chunk, 
              notification: {
                title: "Poll Closed!",
                body: `The poll "${pollName}" has ended.`,
              },
              data: { 
                pollId: String(pollId) },
            });

            console.log(
              `Sent chunk ${i}. Success: ${response.successCount}`,
            );
          } catch (error) {
            console.error("Chunk failed to send:", error);
          }
        }
      }
    }
  },
  { connection: redisConnection },
);
