"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Enhanced API client that automatically includes JWT authentication
 * and handles multi-tenant API calls with proper center isolation
 */
export class AuthenticatedFetchClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
  }

  private async buildHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    // Get the JWT token from NextAuth session
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    // Add Authorization header with JWT token if available
    if ((session as any)?.accessToken) {
      headers['Authorization'] = `Bearer ${(session as any).accessToken}`;
    }

    return headers;
  }

  async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    const headers = await this.buildHeaders(customHeaders);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(
    endpoint: string, 
    data?: any, 
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const headers = await this.buildHeaders(customHeaders);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async put<T>(
    endpoint: string, 
    data?: any, 
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const headers = await this.buildHeaders(customHeaders);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async delete<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    const headers = await this.buildHeaders(customHeaders);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }
}

// Create a singleton instance
export const authenticatedApiClient = new AuthenticatedFetchClient();
