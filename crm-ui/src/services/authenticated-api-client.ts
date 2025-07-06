/**
 * Base HTTP client with JWT authentication for SeniorSync API services
 * 
 * This client automatically:
 * - Adds JWT authentication headers from NextAuth session
 * - Handles common error responses  
 * - Provides type-safe HTTP methods
 * - Can be extended by service-specific clients for custom error handling
 */

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
    // 🔑 JWT Authentication from NextAuth session
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Add JWT token if available
      ...(session?.accessToken && {
        'Authorization': `Bearer ${session.accessToken}`
      })
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof BaseApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new BaseApiError(
        0,
        'Network Error',
        [{ message: 'Failed to connect to the server', timestamp: new Date().toISOString() }]
      );
    }
  }

  /**
   * Default error handling - can be overridden by service-specific clients
   */
  protected async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, create a generic error
      throw new BaseApiError(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }

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
} 