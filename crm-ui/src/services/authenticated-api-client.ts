/**
 * Base HTTP client with JWT authentication for SeniorSync API services
 * 
 * This client automatically:
 * - Adds JWT authentication headers from AWS Amplify Cognito session
 * - Handles common error responses  
 * - Provides type-safe HTTP methods
 * - Can be extended by service-specific clients for custom error handling
 */

import { createAuthenticatedRequestConfig } from '@/lib/auth-utils';

// Base error class for API errors
export class BaseApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public errors: Array<{ message: string; timestamp: string; field?: string; rejectedValue?: any }> = [],
    public timestamp?: string
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'BaseApiError';
  }
}

// Base validation error class
export class BaseValidationError extends BaseApiError {
  constructor(
    public validationErrors: Array<{ message: string; field: string; rejectedValue?: any; timestamp: string }>,
    status: number = 400,
    statusText: string = 'Validation Error'
  ) {
    super(status, statusText, validationErrors);
    this.name = 'BaseValidationError';
  }
}

/**
 * Authenticated HTTP client base class
 * Services can extend this for service-specific error handling
 */
export class AuthenticatedApiClient {
  protected async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use existing auth-utils function for authentication
    const method = (options.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") || "GET";
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    const config = await createAuthenticatedRequestConfig(method, body);

    // Merge with any additional options (preserving custom headers)
    const finalConfig: RequestInit = {
      ...config,
      ...options,
      headers: {
        ...config.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalConfig);

      console.groupEnd();
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
      }

      // Try to parse JSON response
      try {
        return await response.json();
      } catch (parseError) {
        // If JSON parsing fails, return the text content
        const text = await response.text();
        return text as unknown as T;
      }
    } catch (error) {
      if (error instanceof BaseApiError) {
        throw error;
      }
      // Network or other errors
      throw new BaseApiError(0, 'Network Error', [{
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }]);
    }
  }

  /**
   * Default error handling - can be overridden by service-specific clients
   */
  protected async handleErrorResponse(response: Response): Promise<never> {
    console.error('🚨 API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    let errorData: any;
    
    try {
      errorData = await response.json();
      console.error('🚨 Error Response Body:', errorData);
    } catch (parseError) {
      console.log('❌ Failed to parse error response as JSON');
      console.log('🔍 Parse Error:', parseError);

      // Try to get the response as text
      try {
        const textResponse = await response.text();
        console.log('📄 Error Response Text:', textResponse);

        // Check if this looks like an HTML error page (Next.js default error)
        if (textResponse.includes('<html') || textResponse.includes('<!DOCTYPE')) {
          console.warn('🚨 Received HTML response - this might be a Next.js error page!');
          console.warn('💡 This suggests the request went to Next.js instead of your backend');
        }
      } catch (textError) {
        console.log('❌ Failed to get error response as text:', textError);
      }

      console.groupEnd();

      // If JSON parsing fails, create a generic error
      throw new BaseApiError(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }

    console.groupEnd();

    // Handle validation errors (400)
    if (response.status === 400 && errorData.errors) {
      const validationErrors = errorData.errors.map((error: any) => ({
        message: error.message || 'Validation error',
        field: error.field || '',
        rejectedValue: error.rejectedValue,
        timestamp: errorData.timestamp || new Date().toISOString()
      }));
      
      throw new BaseValidationError(validationErrors);
    }

    // Handle other API errors
    throw new BaseApiError(
      response.status,
      response.statusText,
      errorData.errors || [{ 
        message: errorData.message || 'An error occurred', 
        timestamp: errorData.timestamp || new Date().toISOString() 
      }]
    );
  }

  // HTTP method implementations
  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  async patch<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}