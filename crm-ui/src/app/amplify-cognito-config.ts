"use client";
import { Amplify, type ResourcesConfig } from "aws-amplify";

export const authConfig: ResourcesConfig["Auth"] = {
  Cognito: {
    userPoolId: String(process.env.NEXT_PUBLIC_AWS_COGNITO_PUBLIC_USER_POOL_ID),
    userPoolClientId: String(process.env.NEXT_PUBLIC_AWS_COGNITO_APP_CLIENT_ID),
    // Configure login options to support both username and email
    loginWith: {
      email: true,
      username: true,
      phone: true, // Add phone number support for SMS
    },
    // Configure MFA for SMS
    mfa: {
      status: "on", // Enable MFA
      totpEnabled: false,
      smsEnabled: true,
    },
    userAttributes: {
      email: {
        required: true,
      },
      phone_number: {
        required: true, // Make phone number required for SMS MFA
      },
      given_name: {
        required: false,
      },
      family_name: {
        required: false,
      },
    } as any,
    // Configure password policy to match Terraform
    passwordFormat: {
      minLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialCharacters: true,
    },
  },
};

Amplify.configure(
  {
    Auth: authConfig,
  },
  { ssr: true }
);

export default function ConfigureAmplifyClientSide() {
  return null;
}
