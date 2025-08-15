"use client";
import { AtSign, Key } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ErrorMessageCallout } from "@/components/error-message-callout";
import { handleSignIn } from "@/lib/cognito-actions";

export default function SigninForm() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(undefined);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await handleSignIn(undefined, formData);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Card className="flex-1 rounded-lg p-3 pt-10">
        <CardContent>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center pb-2">
            Sign in to your account to continue
          </CardDescription>
          <div className="w-full">
            <div>
              <Label
                className="mb-3 mt-5 block text-xs font-medium"
                htmlFor="email"
              >
                Email
              </Label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  disabled={isPending}
                />
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
            <div className="mt-4">
              <Label
                className="mb-3 mt-5 block text-xs font-medium"
                htmlFor="password"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                />
                <Key className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          <SigninButton isPending={isPending} />
          {errorMessage && <ErrorMessageCallout errorMessage={errorMessage} />}
        </CardContent>
      </Card>
    </form>
  );
}

function SigninButton({ isPending }: { isPending: boolean }) {
  return (
    <Button
      className="my-4 w-full"
      aria-disabled={isPending}
      disabled={isPending}
    >
      {isPending ? "Signing in..." : "Sign in"}{" "}
      <ArrowRight className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
