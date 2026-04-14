"use client"
import { signUpSchema } from "@/app/schemas/auth"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { Loader2 } from "lucide-react"
import { signupAction } from "@/app/actions/auth"

export default function SignUpPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const userForm = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "", // Added name field for your backend body
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = (data: z.infer<typeof signUpSchema>) => {
        setError(null)
        startTransition(async () => {
            const result = await signupAction(data)
            
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="flex justify-center items-center min-h-screen px-4 bg-muted/20">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold my-4 md:text-3xl tracking-tight">
                        Create an Account
                    </CardTitle>
                </CardHeader>
                <form onSubmit={userForm.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {/* Name Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Controller
                                name="name"
                                control={userForm.control}
                                render={({ field, fieldState }) => (
                                    <div className="grid gap-1">
                                        <Input placeholder="Abel Bane" {...field} />
                                        {fieldState.error && (
                                            <span className="text-[10px] text-destructive font-medium">
                                                {fieldState.error.message}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Email Field */}
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
                                            <span className="text-[10px] text-destructive font-medium">
                                                {fieldState.error.message}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Controller
                                name="password"
                                control={userForm.control}
                                render={({ field, fieldState }) => (
                                    <div className="grid gap-1">
                                        <Input type="password" {...field} />
                                        {fieldState.error && (
                                            <span className="text-[10px] text-destructive font-medium">
                                                {fieldState.error.message}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Re-enter password</Label>
                            <Controller
                                name="confirmPassword"
                                control={userForm.control}
                                render={({ field, fieldState }) => (
                                    <div className="grid gap-1">
                                        <Input type="password" {...field} />
                                        {fieldState.error && (
                                            <span className="text-[10px] text-destructive font-medium">
                                                {fieldState.error.message}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {error && (
                            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs font-bold">
                                {error}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex-col gap-4 mt-2">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin mr-2" /> : "Signup"}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{" "}
                            <Link className="text-primary hover:underline font-medium" href="/auth/signin">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}