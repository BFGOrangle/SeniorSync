export type PaginatedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export interface Pageable {
  page?: number; // 0-based page number
  size?: number; // page size
  sort?: string[]; // e.g., ["firstName,asc", "lastName,desc"]
}
