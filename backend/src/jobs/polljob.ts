import type { Option, Poll } from "../generated/prisma";
import { prisma } from "../lib/db";
import cron from "node-cron";

export async function closePolls() {
  //Runs every minute!
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
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

// export async function closePolls() {
//   cron.schedule("*/3 * * * *", async () => {
//   const now = new Date();

//   try {
//     const expiredPolls = await prisma.poll.findMany({
//       where: { 
//         deadline: { lte: now }, 
//         active: true,
//         notified: false 
//       },
//       include: { options:true }
//     });

//     for (const poll of expiredPolls) {
//       await prisma.poll.update({
//         where: { id: poll.id },
//         data: { active: false, notified: true }
//       });

//       await dispatchNotificationTask(poll.options);
//     }
//   } catch (err) {
//     console.error("Cron failure:", err);
//   }
// });
// }

// async function dispatchNotificationTask(voters:Option[]) {
//   await prisma.notification.create({
//     data: {
//       userId: poll.o,
//       title: "Poll Closed",
//       message: `Your poll "${poll.name}" has ended. View the results now!`,
//       type: "POLL_END",
//     }
//   });

//   const userDevices = await prisma.userDevice.findMany({
//     where: { userId: poll.authorId }
//   });

//   const tokens = userDevices.map(d => d.fcmToken);

//   // 3. Send to Firebase (Multicast handles multiple tokens at once)
//   if (tokens.length > 0) {
//     await admin.messaging().sendEachForMulticast({
//       tokens: tokens,
//       notification: {
//         title: "Poll Closed!",
//         body: `Your poll "${poll.name}" has finished.`,
//       },
//       data: { pollId: poll.id }
//     });
//   }
// }