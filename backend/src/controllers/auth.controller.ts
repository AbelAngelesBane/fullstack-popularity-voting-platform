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
    const userRecord = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userRecord) {
      if (userRecord.emailVerified) {
        return res
          .status(400)
          .json({ error: "Email already in use. Please login instead." });
      } else {
        await auth.api.sendVerificationOTP({
          body: { email, type: "email-verification" },
        });
        return res.status(200).json({
          message: "Account pending verification. A new OTP has been sent.",
          step: "verify-otp",
        });
      }
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
        type: "email-verification",
      },
    });
    return res.status(201).json({
      message:
        "Signup successful. Please check your email for the 6-digit code.",
      data,
    });
  } catch (error:any) {
    if(error.statusCode === 422 || error.code === "P2002"){
      res.status(422).json({ error: "username unavailable" });
    }
    console.log("Error in signup", error);
    return res.status(500).json({ error: "Signup failed" });
  }
}

export async function signIn(req: Request, res: Response) {
      const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
  try {


    // Library first for errs, cause if success then check the email verification
    const authData = await auth.api.signInEmail({
      body: {
        email: email,
        password: password,
        rememberMe: true,
      },
      headers: fromNodeHeaders(req.headers),
    });


    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user && !user.emailVerified) {
      await auth.api.sendVerificationOTP({
        body: {
          email: email,
          type: "email-verification"
        }
      });
      return res.status(403).json({ 
        error: "Account not verified", 
        code: "PENDING_VERIFICATION", 
        email: user.email 
      });
    }

    return res.status(200).json(authData);

  } catch (error: any) {
    console.error("Login attempt failed:", error.message );
    if (error.message === "Email not verified") {
        // This is where you trigger your "Send OTP" logic!
        await auth.api.sendVerificationOTP({
            body: { email, type: "email-verification" }
        });

        return res.status(403).json({ 
            error: "Account not verified",
            redirect:"otp",
            message:"OTP resent to your email", 
            code: "PENDING_VERIFICATION",
            email: email
        });
    }
    
    return res.status(401).json({ 
      error: "Invalid email or password" 
    });
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
      result,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: "Verification failed",
      message: err.message || "Invalid or expired code.",
    });
  }
}

export const logout = async (req: Request, res: Response) => {
  const {id} = req.user
  try {
    
    const result = await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
    if(result.success){
      await prisma.user.update({
        where:{
          id:id
        },
        data:{
          userDevice:null
        }
      })
    }
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to logout" });
  }
};

export async function resendOTP(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(200).json({ message: "If an account exists, a new code has been sent." });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "This account is already verified. Please login." });
    }

    await auth.api.sendVerificationOTP({
      body: {
        email: email,
        type: "email-verification", 
      },
    });

    return res.status(200).json({ 
      message: "A fresh 6-digit code has been sent to your email.",
      email: email 
    });

  } catch (error: any) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ error: "Failed to resend code. Please try again later." });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    const { id } = req.user!;

    //Im keeping the votes (set to null), but comments are set to cascade, i need them counted still
    await prisma.user.delete({
      where: { id: id },
    });

    return res.status(200).json({
      message: "Account deleted. Votes and invoices have been anonymized.",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);

    if ((error as any).code === "P2025") {
      return res.status(404).json({ error: "User record not found." });
    }

    return res.status(500).json({ error: "Failed to delete account." });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    await auth.api.forgetPasswordEmailOTP({
      body: {
        email: email.trim().toLowerCase(),
      },
    });

    return res.status(200).json({
      message: "If an account exists, a reset code has been sent to your email.",
      step: "verify-reset-otp",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return res.status(200).json({ message: "Reset code sent if email exists." });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "Email, OTP, and new password are required" 
      });
    }

    // await auth.api.resetPassword({
    //   body: {
    //     newPassword: newPassword,
    //     token: otp, 
    //   },
    // });

    await auth.api.resetPasswordEmailOTP({
      body: {
        email: email.trim().toLowerCase(),
        otp: otp, 
        password: newPassword,
      },
    });
    


    return res.status(200).json({
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return res.status(400).json({
      error: "Reset failed",
      message: error.message || "Invalid or expired OTP code.",
    });
  }
}

