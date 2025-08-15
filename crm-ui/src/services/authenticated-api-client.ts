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
    console.log('🔐 AuthenticatedApiClient: Making request to', url);
    
    // 🔑 JWT Authentication from NextAuth session
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    
    console.log('🔐 AuthenticatedApiClient: Session exists?', !!session);
    console.log('🔐 AuthenticatedApiClient: Access token exists?', !!((session as any)?.accessToken));
    
    if (session) {
      console.log('🔐 AuthenticatedApiClient: Full session object:', {
        user: (session as any)?.user,
        accessToken: (session as any)?.accessToken ? 'EXISTS' : 'MISSING',
        tokenLength: (session as any)?.accessToken?.length || 0
      });
    }
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Add JWT token if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((session as any)?.accessToken && {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'Authorization': `Bearer ${(session as any).accessToken}`
      })
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('🔐 AuthenticatedApiClient: Request config headers:', Object.keys(config.headers || {}));
    
    // Enhanced debugging for authentication
    if (config.headers && 'Authorization' in config.headers) {
      const authHeader = (config.headers as any).Authorization;
      console.log('🔐 AuthenticatedApiClient: Authorization header present:', !!authHeader);
      if (authHeader) {
        console.log('🔐 AuthenticatedApiClient: Auth header length:', authHeader.length);
        console.log('🔐 AuthenticatedApiClient: Auth header starts with Bearer:', authHeader.startsWith('Bearer '));
      }
    } else {
      console.log('🚨 AuthenticatedApiClient: NO Authorization header found!');
    }

    try {
      const response = await fetch(url, config);
      
      console.log('🔐 AuthenticatedApiClient: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        console.log('🔐 AuthenticatedApiClient: 204 No Content response');
        return null as T;
      }

      const data = await response.json();
      console.log('🔐 AuthenticatedApiClient: Response data type:', typeof data, 'length:', Array.isArray(data) ? data.length : 'N/A');
      return data;
    } catch (error) {
      console.error('🔐 AuthenticatedApiClient: Request failed:', error);
      
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
    } catch {
      console.error('🚨 Could not parse error response as JSON');
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