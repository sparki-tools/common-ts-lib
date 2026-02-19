/**
 * Common Types
 * Shared type definitions across applications
 */

/**
 * API Response envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * API Error details
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Environment
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Generic status types
 */
export type BuildStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export type DeploymentStatus = 'draft' | 'pending' | 'deploying' | 'live' | 'failed' | 'rollback';
