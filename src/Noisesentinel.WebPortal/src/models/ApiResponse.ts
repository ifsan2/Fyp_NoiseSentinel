export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}