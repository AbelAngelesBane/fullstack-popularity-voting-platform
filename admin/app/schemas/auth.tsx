import * as z from "zod"; 
 
export const loginSchema = z.object({ 
  email: z.email(),
  password:z.string().min(8).max(30)
});

export const signUpSchema = z.object({
    email: z.email("Invalid email address"),
    name:z.string().max(30).min(5),
    password: z.string().min(8, "Password must be at least 8 characters").max(30),
    confirmPassword: z.string(), 
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], 
  });


