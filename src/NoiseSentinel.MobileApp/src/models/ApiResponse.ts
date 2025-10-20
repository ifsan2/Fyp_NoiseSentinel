export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  errors?: string[];
  count?: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}