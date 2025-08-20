"use client";
import { fetchAuthSession } from "aws-amplify/auth";

export const getBearerToken = async (): Promise<string> => {
  const session = await fetchAuthSession();
  let token = "";
  if (session && session.tokens && session.tokens.accessToken) {
    token = `Bearer ${session.tokens.accessToken}`;

  } else {
    console.error("Error in retrieving access token.");
  }
  return token;
};

export const createAuthenticatedRequestConfig = async (
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET", 
  body?: Record<string, unknown>
): Promise<RequestInit> => {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": await getBearerToken(),
      "accept": "*/*",
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  return config;
};