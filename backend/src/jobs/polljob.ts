import { prisma } from "../lib/db";
import cron from "node-cron";

export async function closePolls() {
  const now = new Date();
  //Runs every minute!
  cron.schedule("* * * * *", async () => {
    console.log("[CRON] Checking for expired polls...");

    try {
      const result = await prisma.poll.updateMany({
        where: {
          active: true,
          archived: false,
          deadline: {
            lte: now, // "Less Than or Equal" to current timestamp
          },
        },
        data: {
          active: false,
        },
      });

      if (result.count > 0) {
        console.log(
          `[${now}] CRON: Successfully closed ${result.count} polls.`,
        );
      }
    } catch (error) {
      console.error("[CRON ERROR]:", error);
    }
  });
}
