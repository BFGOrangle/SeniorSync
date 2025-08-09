import { ApiClient } from './api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const client = new ApiClient();

export interface VendorApplicationPayload {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  experience: string;
  description: string;
  availability: string;
}

export interface VendorApplicationResponse {
  message: string;
  success: boolean;
}

export async function submitVendorApplication(payload: VendorApplicationPayload): Promise<VendorApplicationResponse> {
  return client.post<VendorApplicationResponse>(`${API_BASE_URL}/api/vendor-applications`, payload);
}
