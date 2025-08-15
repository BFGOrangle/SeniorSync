"use client";
import { Key, Lock } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ErrorMessageCallout } from "@/components/error-message-callout";
import { confirmSignIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Route } from "@/enums/Route";
import { useNavigationHelper } from "@/lib/navigation-helper";

export default function NewPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const { goToDashboard } = useNavigationHelper();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(undefined);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsPending(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      setIsPending(false);
      return;
    }

    try {
      const { nextStep } = await confirmSignIn({
        challengeResponse: newPassword,
      });

      if (nextStep.signInStep === "DONE") {
        goToDashboard();
      } else {
        setErrorMessage("An unexpected step occurred. Please try again.");
      }
    } catch (error: any) {
      console.debug("New password error:", error);
      
      if (error.name === "InvalidPasswordException") {
        setErrorMessage("Password does not meet requirements. Please try a stronger password.");
      } else if (error.name === "InvalidParameterException") {
        setErrorMessage("Invalid password format. Please check your password and try again.");
      } else {
        setErrorMessage(error.message || "An error occurred while setting your password. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Card className="flex-1 rounded-lg p-3 pt-10">
        <CardContent>
          <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
          <CardDescription className="text-center pb-2">
            Please set a new password for your new account
          </CardDescription>
          <div className="w-full">
            <div>
              <Label
                className="mb-3 mt-5 block text-xs font-medium"
                htmlFor="newPassword"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  disabled={isPending}
                  minLength={8}
                />
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
            <div className="mt-4">
              <Label
                className="mb-3 mt-5 block text-xs font-medium"
                htmlFor="confirmPassword"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  disabled={isPending}
                  minLength={8}
                />
                <Key className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="my-4 w-full"
            aria-disabled={isPending}
            disabled={isPending}
          >
            {isPending ? "Setting Password..." : "Set New Password"}
            <ArrowRight className="ml-auto h-5 w-5 text-gray-50" />
          </Button>
          {errorMessage && <ErrorMessageCallout errorMessage={errorMessage} />}
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Password Requirements:</strong></p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}