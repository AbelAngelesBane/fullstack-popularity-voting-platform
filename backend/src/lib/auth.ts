import "dotenv/config";

import { betterAuth } from "better-auth";
import { prisma } from "./db.js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";
import { admin } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  baseURL: `${process.env.BETTER_AUTH_URL}/api/auth`,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  plugins: [
    bearer(),
    admin({
      adminUserIds: ["ebaKASHgU4Xx9EKfEjpnh8nPcOWB9ytB"],
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`Sending ${type} OTP to ${email}: ${otp}`);

        try {
          await transporter.sendMail({
            from: `"Voting App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Verification Code",
            html: `<h1>Your code is: ${otp}</h1>`,
          });
          console.log(`Email successfully sent to ${email}`);
        } catch (error) {
          console.error("Nodemailer Error:", error);
        }
      },
    }),
  ],
});
