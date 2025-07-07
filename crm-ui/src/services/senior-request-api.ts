import { SeniorRequest, ApiResponse } from '@/types/senior-request';

// Mock API service for senior requests
export class SeniorRequestAPI {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async submitRequest(request: Omit<SeniorRequest, 'createdAt' | 'status'>): Promise<ApiResponse<SeniorRequest>> {

    
    const fullRequest: SeniorRequest = {
      ...request,
      createdAt: new Date().toISOString(),
      status: 'todo'
    };
    
    // Simulate successful submission
    console.log('Mock API: Submitting request', fullRequest);
    
    return {
      success: true,
      data: fullRequest,
      message: 'Senior request submitted successfully!'
    };
  }

  static async validateAgent(agentId: string): Promise<ApiResponse<{ name: string; id: string }>> {
    await this.delay(500);
    
    // Mock agent validation
    const mockAgents = [
      { id: 'AGT001', name: 'Sarah Johnson' },
      { id: 'AGT002', name: 'Michael Chen' },
      { id: 'AGT003', name: 'Emily Rodriguez' },
      { id: 'AGT004', name: 'David Kim' }
    ];
    
    const agent = mockAgents.find(a => a.id === agentId);
    
    if (agent) {
      return {
        success: true,
        data: agent,
        message: 'Agent validated successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid agent ID'
      };
    }
  }
}

export const REQUEST_TYPES = [
  'Medical Assistance',
  'Transportation',
  'Home Care',
  'Emergency Support',
  'Meal Delivery',
  'Medication Management',
  'Social Services',
  'Technical Support',
  'Other'
] as const;

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
] as const; 