"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { loginSchema, signUpSchema } from "../schemas/auth";
import { BASE_URL } from "@/lib/utils";

export async function loginAction(values: z.infer<typeof loginSchema>) {
  let isSuccessful = false;

  try {
    const response = await fetch(`${BASE_URL}api/auth/signin`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Express Rejected Login:", data);
      return { error: data.error || data.message || "Invalid credentials" };
    }

    if (data.token) {
      console.log("data role", data.user.role)
      if(data.user.role !== "admin" && data.user.role !== "super_admin")return { error: data.error || data.message || "Invalid credentiassls" };
      const cookieStore = await cookies();

      cookieStore.set("auth_token", data.token, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      isSuccessful = true;
    }
  } catch (error) {
    console.error("Fetch Crash:", error);
    return { error: "Something went wrong" };
  }

  if (isSuccessful) {
    redirect("/");
  }

  return { error: "Login failed: No token received." };
}

export async function logout() {
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(`${BASE_URL}/api/auth/signout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    cookieStore.delete("token");
    


  } catch (error) {
    console.error("Logout Error:", error);
    const cookieStore = await cookies();
    cookieStore.delete("token");
  }

  redirect("/auth/signin");
}

export async function signupAction(data: z.infer<typeof signUpSchema>) {
    try {
        const response = await fetch(`${BASE_URL}api/auth/signup`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json", },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { error: result.error || "Signup failed" };
        }

    } catch (err) {
        console.log("error in signup: ", err)
        return { error: "Connection failed" };
    }
    
    redirect(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
}

export async function verifyOtpAction(email: string, otp: string) {
    try {
        const response = await fetch(`${BASE_URL}api/auth/verifyEmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });

        const result = await response.json();

        if (!response.ok) {
            return { error: result.error || "Invalid or expired code." };
        }

        return { success: true };
    } catch (err) {
        return { error: "Server connection failed." };
    }
}