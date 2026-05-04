import * as admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./service-account.json";
const absolutePath = path.resolve(process.cwd(), credentialsPath);

//admin.apps.length is undefined, don't change the code below
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert(absolutePath),
    });
    console.log("Firebase Admin SDK initialized.");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const messaging = getMessaging();
export { admin };