export interface SeniorRequest {
  // Personal Information
  seniorName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Request Details
  requestType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  
  // Medical Information
  medicalConditions?: string;
  medications?: string;
  mobilityAssistance: boolean;
  
  // Agent Information
  agentName: string;
  agentId: string;
  
  // System fields
  createdAt?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
} 