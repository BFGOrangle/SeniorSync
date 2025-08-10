import { AuthenticatedApiClient } from './authenticated-api-client';

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
}

export const spamFilterService = SpamFilterService.getInstance();
