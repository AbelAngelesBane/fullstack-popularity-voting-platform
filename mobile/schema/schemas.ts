import { email, z } from "zod"; 

export const signupSchema = z.object({
  name:z.string().min(3,"Name must be at least 3 characters"),
  email: z.email("Invalid email address"), 
  password: z.string().min(8, "Password must be at least 8 characters"),
  repassword: z.string().optional()
}).refine(
  (data) => data.password === data.repassword, 
  {                                           
    message: "Passwords don't match",
    path: ["repassword"],
  }
);

export const signInSchema = z.object({
    email:z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})


export const resetPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
    
  otp: z.string().length(6, { message: "OTP must be exactly 6 characters" }).regex(/^\d+$/, { message: "OTP must only contain numbers" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(100)
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;