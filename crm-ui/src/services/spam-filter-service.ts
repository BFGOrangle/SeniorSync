import { AuthenticatedApiClient } from './authenticated-api-client';

// Type for NextAuth session with custom token
interface SessionWithToken {
  accessToken?: string;
}

export interface SpamFilterResult {
  requestId: number;
  isSpam: boolean;
  confidenceScore: number;
  detectionReason: string;
  detectedAt: string;
}

export interface BatchSpamFilterResult {
  results: SpamFilterResult[];
  totalProcessed: number;
  spamDetected: number;
}

class SpamFilterService extends AuthenticatedApiClient {
  private static instance: SpamFilterService;

  public static getInstance(): SpamFilterService {
    if (!SpamFilterService.instance) {
      SpamFilterService.instance = new SpamFilterService();
    }
    return SpamFilterService.instance;
  }

  /**
   * Check a single request for spam
   */
  async checkSingleRequest(requestId: number): Promise<SpamFilterResult> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/filter/spam/single/${requestId}`;
    
    return this.request<SpamFilterResult>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Check multiple requests for spam in batch
   */
  async checkBatchRequests(requestIds: number[]): Promise<BatchSpamFilterResult> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/filter/spam/batch`;
    
    return this.request<BatchSpamFilterResult>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestIds: requestIds
      })
    });
  }

  /**
   * Get spam detection history
   */
  async getSpamDetectionHistory(): Promise<SpamFilterResult[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/filter/spam/history`;
    
    return this.request<SpamFilterResult[]>(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Auto-check requests that don't have spam detection results
   * This is a helper method for the frontend to ensure all requests have spam status
   */
  async autoCheckMissingSpamDetection(requests: Array<{id: number, isSpam?: boolean}>): Promise<SpamFilterResult[]> {
    // Find requests that don't have spam detection
    const requestsNeedingCheck = requests
      .filter(req => req.isSpam === undefined || req.isSpam === null)
      .map(req => req.id);

    if (requestsNeedingCheck.length === 0) {
      return [];
    }

    // Check them in batch
    const batchResult = await this.checkBatchRequests(requestsNeedingCheck);
    return batchResult.results;
  }

  /**
   * PHASE 1: IMMEDIATE LOADING STRATEGY
   * Start async spam detection for requests that need it
   * This doesn't wait for completion - fires and forgets for immediate UI loading
   */
  async initiateSpamDetectionAsync(requestIds: number[]): Promise<void> {
    if (requestIds.length === 0) {
      return;
    }

    try {
      console.log(`Initiating async spam detection for ${requestIds.length} requests`);
      
      // Get session for authorization
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if session exists
      if (session && (session as SessionWithToken)?.accessToken) {
        headers['Authorization'] = `Bearer ${(session as SessionWithToken).accessToken}`;
      }
      
      // Fire async request without waiting - using the correct endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/spam-filter/check-batch`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestIds) // Backend expects array directly
      });
      
      // Don't await - let it process in background
      console.log('Spam detection initiated successfully (async)');
    } catch (error) {
      console.warn('Failed to initiate spam detection:', error);
    }
  }

  /**
   * Poll for updated spam detection results from the main requests endpoint
   * This checks if spam detection has completed for the given request IDs
   */
  async pollForSpamUpdates(requestIds: number[]): Promise<Map<number, SpamFilterResult>> {
    if (requestIds.length === 0) {
      return new Map();
    }

    try {
      // Import request service to get updated request data
      const { requestManagementApiService } = await import('./request-api');
      
      // Get all requests to check for spam updates
      const allRequests = await requestManagementApiService.getRequests();
      
      const spamResults = new Map<number, SpamFilterResult>();
      
      // Filter for our specific requests that now have spam data
      allRequests
        .filter(req => 
          requestIds.includes(req.id) && 
          req.isSpam !== undefined && 
          req.isSpam !== null
        )
        .forEach(req => {
          spamResults.set(req.id, {
            requestId: req.id,
            isSpam: req.isSpam!,
            confidenceScore: req.spamConfidenceScore || 0,
            detectionReason: req.spamDetectionReason || '',
            detectedAt: req.spamDetectedAt || new Date().toISOString()
          });
        });
      
      if (spamResults.size > 0) {
        console.log(`Found spam updates for ${spamResults.size} requests`);
      }
      
      return spamResults;
    } catch (error) {
      console.error('Failed to poll spam updates:', error);
      return new Map();
    }
  }

  /**
   * Check if requests need spam detection (helper method)
   */
  getRequestsNeedingSpamDetection(requests: Array<{id: number, isSpam?: boolean | null}>): number[] {
    return requests
      .filter(req => req.isSpam === undefined || req.isSpam === null)
      .map(req => req.id);
  }

  /**
   * Enhanced method that combines immediate loading with background processing
   * Returns immediately with available data, starts background processing for missing spam data
   */
  async enhancedSpamCheck(requests: Array<{id: number, isSpam?: boolean | null}>): Promise<{
    immediateResults: SpamFilterResult[];
    pendingRequestIds: number[];
  }> {
    // Separate requests that already have spam data from those that need it
    const immediateResults: SpamFilterResult[] = [];
    const pendingRequestIds: number[] = [];
    
    requests.forEach(req => {
      if (req.isSpam !== undefined && req.isSpam !== null) {
        // Already has spam data - add to immediate results
        immediateResults.push({
          requestId: req.id,
          isSpam: req.isSpam,
          confidenceScore: 0, // Will be populated from full request data
          detectionReason: '',
          detectedAt: new Date().toISOString()
        });
      } else {
        // Needs spam detection
        pendingRequestIds.push(req.id);
      }
    });
    
    // Start background processing for pending requests (don't wait)
    if (pendingRequestIds.length > 0) {
      this.initiateSpamDetectionAsync(pendingRequestIds);
    }
    
    return {
      immediateResults,
      pendingRequestIds
    };
  }
}

export const spamFilterService = SpamFilterService.getInstance();
