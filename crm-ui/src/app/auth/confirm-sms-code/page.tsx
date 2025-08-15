"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, ArrowLeft, RotateCcw } from "lucide-react";
import { handleSMSCodeConfirmation } from "@/lib/cognito-actions";
import { resendSignUpCode } from "aws-amplify/auth";
import { toast } from "@/hooks/use-toast";

export default function ConfirmSMSCodePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(undefined);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await handleSMSCodeConfirmation(undefined, formData);
      if (typeof result === "object" && result.success) {
        router.push(result.redirectTo);
      } else if (typeof result === "string") {
        setErrorMessage(result);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // Get email from session storage or URL params if available
      const email = sessionStorage.getItem('signin-email') || '';
      if (email) {
        await resendSignUpCode({ username: email });
        toast({
          title: "Code Sent",
          description: "A new SMS verification code has been sent to your phone.",
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to resend code. Please try signing in again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend SMS verification code.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-2xl">SMS Verification Required</CardTitle>
          </div>
          <CardDescription>
            Enter the verification code sent to your phone to complete sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">SMS Verification Code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                autoComplete="one-time-code"
                disabled={isPending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Verifying..." : "Verify SMS Code"}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              onClick={handleResendCode} 
              className="w-full"
              disabled={isResending}
            >
              {isResending ? (
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Resend SMS Code
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}