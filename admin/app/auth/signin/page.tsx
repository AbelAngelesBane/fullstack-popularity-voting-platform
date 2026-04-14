"use client"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema } from "@/app/schemas/auth"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import Link from "next/link"
import { loginAction } from "@/app/actions/auth"
import { Loader } from "lucide-react"
import { error } from "console"

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [isError, setError] = useState<string | null>()

  const userForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setError(null)
    startTransition(async () => {
      const response = await loginAction(data)

      if(response.error){
        setError(response.error)
      }
    })
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="my-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Login to your account</CardTitle>
        </CardHeader>
        <form onSubmit={userForm.handleSubmit(onSubmit, (errors) => console.log("Validation Errors:", errors))}>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                  name="email"
                  control={userForm.control}
                  render={({ field, fieldState }) => (
                    <div className="grid gap-1">
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                      {fieldState.error && (
                        <span className="text-xs text-red-500 font-medium">
                          {fieldState.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Controller
                  control={userForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <div className="grid gap-1">
                      <Input type="password" {...field} />
                      {fieldState.error && (
                        <span className="text-xs text-red-500 font-medium">
                          {fieldState.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            {isError && <p className="text-red-400 font-bold">{isError}!</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader/> : "Signin"}
            </Button>
            <CardAction className="text-center w-full">
              <p> Already have an account?
              <Link className={buttonVariants({ variant: "outline", className: "text-text-primary" })} href={"/auth/signup"}>
                Signup
              </Link>
              </p>
            </CardAction>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}