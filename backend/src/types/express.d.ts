// import { auth } from "../lib/auth";
// import { Request } from "express";

// type AuthUser = typeof auth.$Infer.Session.user;
// type AuthSession = typeof auth.$Infer.Session.session;

// declare global {
//   namespace Express {
//     interface Request {
//       user?: AuthUser; 
//       session?: AuthSession;
//     }
//   }
// }

// export interface ProtectedRequest extends Request {
//     user: AuthUser; 
// }

import { User, Session } from "@prisma/client"; // or from better-auth

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}