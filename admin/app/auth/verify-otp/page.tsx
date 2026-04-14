"use client"
import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { verifyOtpAction } from "@/app/actions/auth";

export default function VerifyOTPPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") || "";
    
    const [otp, setOtp] = useState("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleVerify() {
        setError(null);
        
        if (otp.length < 6) {
            setError("Please enter the full 6-digit code.");
            return;
        }

        startTransition(async () => {
            const result = await verifyOtpAction(email, otp);

            if (result.success) {
                router.push("/auth/signin?verified=true");
            } else {
                setError(result.error || "Verification failed.");
            }
        });
    }

    return (
        <div className="flex justify-center items-center min-h-screen px-4 bg-muted/20">
            <Card className="w-full max-w-sm border-2 shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold tracking-tight">Verify Email</CardTitle>
                    <CardDescription className="text-balance">
                        Enter the 6-digit code sent to <br />
                        <span className="font-bold text-primary break-all">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <Input 
                            className="text-center text-3xl tracking-[0.5em] font-mono font-bold h-16 focus-visible:ring-primary"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            disabled={isPending}
                            // Only allow numbers
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                    </div>
                    {error && (
                        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs text-center font-bold">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-3">
                    <Button 
                        className="w-full h-12 text-lg font-semibold" 
                        onClick={handleVerify} 
                        disabled={isPending || otp.length < 6}
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : "Verify & Sign In"}
                    </Button>
                    <button 
                        className="text-sm text-muted-foreground hover:underline"
                        onClick={() => router.back()}
                    >
                        Wrong email? Go back
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
}