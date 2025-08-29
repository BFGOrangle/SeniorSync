import { AuthenticatedApiClient } from './authenticated-api-client';

// Types
export interface RequestTypeDto {
  id: number;
  name: string;
  description?: string | null;
  isGlobal?: boolean | null;
  centerId?: number | null;
}

export interface CreateRequestTypeDto {
  name: string;
  description?: string | null;
  centerId?: number | null; // Backend will treat absence as global or attach automatically based on user context
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const REQUEST_TYPE_ENDPOINT = `${API_BASE_URL}/api/request-types`;

class RequestTypeApiClient extends AuthenticatedApiClient {}

export class RequestTypeApiService {
  private client = new RequestTypeApiClient();

  async getAllByCenter(centerId: number): Promise<RequestTypeDto[]> {
    return this.client.get<RequestTypeDto[]>(`${REQUEST_TYPE_ENDPOINT}/all/center/${centerId}`);
  }

  async create(dto: CreateRequestTypeDto): Promise<CreateRequestTypeDto> {
    return this.client.post<CreateRequestTypeDto>(REQUEST_TYPE_ENDPOINT, dto);
  }

  async delete(id: number): Promise<void> {
    return this.client.delete<void>(`${REQUEST_TYPE_ENDPOINT}/${id}`);
  }
}

export const requestTypeApiService = new RequestTypeApiService();
