import cron from "node-cron";
import { prisma } from "../lib/db";
import { notificationQueue } from "../lib/queue";

export async function closePolls() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log("[CRON] Checking for expired polls...");

    try {
      const expiredPolls = await prisma.poll.findMany({
        where: { 
          deadline: { lte: now }, 
          active: true,
          notified: false 
        },
        include: {
          options: {
            include: {
              votes: { select: { userId: true } }
            }
          }
        }
      });

      for (const poll of expiredPolls) {
        console.log("UPDATING POLLS: ", expiredPolls)
        await prisma.poll.update({
          where: { id: poll.id },
          data: { active: false, notified: true }
        });

        const voterIds = Array.from(new Set(
          poll.options.flatMap(option => option.votes.map(v => v.userId))
        ));

        console.log("VOTER IDS: ", voterIds);

        if (poll.authorId && !voterIds.includes(poll.authorId)) {
          voterIds.push(poll.authorId);
        }

        await notificationQueue.add("notification-queue", { 
          pollId: poll.id,
          pollName: poll.name, 
          receivers: voterIds 
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 }
        });

        console.log(`[CRON] Dispatched queue for poll: ${poll.name} (${voterIds.length} users)`);
      }
    } catch (err) {
      console.error("[CRON ERROR]:", err);
    }
  });
}