import type { Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../lib/db";

export async function signUp(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Bad request",
        message: "Fill all the required fields",
      });
    }
    const existingUser = await prisma.user.findUnique({
            where: { email: email, emailVerified:true }
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: "Email already in use. Please login instead." 
            });
        }
    const data = await auth.api.signUpEmail({
      body: {
        name: name, 
        email: email, 
        password: password, 
        image: "",
        callbackURL: "",
      },
    });

    await auth.api.sendVerificationOTP({
        body: {
            email: email,
            type:"email-verification"
        }
    });
    return res.status(201).json({ 
            message: "Signup successful. Please check your email for the 6-digit code.",
            data 
        });  } catch (error) {
    console.log("Error in signup", error);
    return res.status(500).json({ error: "Signup failed" });
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const {email, password } = req.body;

    const data = await auth.api.signInEmail({
      body: {
        email: email, 
        password: password, 
        rememberMe: true,
      },
      // This endpoint requires session cookies.
      headers: fromNodeHeaders(req.headers),
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(401).json({ error: "Invalid credentials" });
  }
}

export async function verifyOTP(req: Request, res: Response) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        const result = await auth.api.verifyEmailOTP({
            body: {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
            },
        });

        return res.status(200).json({
            message: "Email verified successfully!",
            result
        });
    } catch (err: any) {
        return res.status(400).json({ 
            error: "Verification failed", 
            message: err.message || "Invalid or expired code." 
        });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        await auth.api.signOut({
            headers: fromNodeHeaders(req.headers),
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to logout" });
    }
};

export async function deleteAccount(req: Request, res: Response) {
  try {
    const { id } = req.user; 

    //Im keeping the votes (set to null), but comments are set to cascade
    await prisma.user.delete({
      where: { id: id },
    });

    return res.status(200).json({ 
      message: "Account deleted. Votes and invoices have been anonymized." 
    });

  } catch (error) {
    console.error("Delete Account Error:", error);

    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: "User record not found." });
    }

    return res.status(500).json({ error: "Failed to delete account." });
  }
}