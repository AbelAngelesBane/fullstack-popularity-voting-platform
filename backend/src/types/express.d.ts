import { User, Session } from "@prisma/client"; // or from better-auth

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}