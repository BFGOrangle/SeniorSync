import {
  confirmSignUp,
  signIn,
  signOut,
  resendSignUpCode,
  confirmSignIn,
} from "aws-amplify/auth";
import { Route } from "@/enums/Route";
import { redirect } from "next/navigation";

export async function handleSignIn(
  prevState: string | undefined,
  formData: FormData
): Promise<{ success: true; redirectTo: string } | string> {
  let redirectLink = "";
  
  try {
    const username = String(formData.get("email"));
    console.log("Attempting sign in with username:", username);
    
    // Store email for potential resend operations
    sessionStorage.setItem('signin-email', username);
    
    const signInResult = await signIn({
      username: username,
      password: String(formData.get("password")),
    });
    
    const { nextStep } = signInResult;

    if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
      await resendSignUpCode({ username });
      redirectLink = Route.ConfirmSignUp;
    } else if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
      redirectLink = Route.NewPassword;
    } else if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE") {
      console.log("SMS code sent to:", nextStep.codeDeliveryDetails?.destination);
      redirectLink = Route.ConfirmSMSCode;
    } else if (nextStep.signInStep === "DONE") {
      redirectLink = Route.Dashboard;
    } else {
      console.error(`Unexpected NextSignInStep: ${nextStep.signInStep}`);
      throw new Error(`Unexpected next sign in step: ${nextStep.signInStep}`);
    }
    
    return { success: true, redirectTo: redirectLink };
  } catch (error) {
    console.error("Sign in error:", error);
    return getErrorMessage(error);
  }
}

export async function handleSignOut() {
  try {
    await signOut();
  } catch (error) {
    console.log(getErrorMessage(error));
  }
  console.debug("User logged out");
  redirect(Route.Signin);
}

export async function handleEmailCodeConfirmation(
  prevState: string | undefined,
  formData: FormData
): Promise<{ success: true; redirectTo: string } | string> {
  try {
    const code = String(formData.get("code"));
    console.log("Confirming email code verification");
    
    const { nextStep } = await confirmSignIn({
      challengeResponse: code,
    });

    if (nextStep.signInStep === "DONE") {
      return { success: true, redirectTo: Route.Dashboard };
    } else {
      throw new Error("Unexpected next step after email verification");
    }
  } catch (error) {
    return getErrorMessage(error);
  }
}

export async function handleSMSCodeConfirmation(
  prevState: string | undefined,
  formData: FormData
): Promise<{ success: true; redirectTo: string } | string> {
  try {
    const code = String(formData.get("code"));
    console.log("Confirming SMS code verification");
    
    const { nextStep } = await confirmSignIn({
      challengeResponse: code,
    });

    if (nextStep.signInStep === "DONE") {
      return { success: true, redirectTo: Route.Dashboard };
    } else {
      throw new Error("Unexpected next step after SMS verification");
    }
  } catch (error) {
    return getErrorMessage(error);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "string") {
    return error;
  }
  return "An error occurred";
}
export { confirmSignUp };
