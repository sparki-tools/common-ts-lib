/**
 * Common Types
 * Shared type definitions across applications
 */
/**
 * API Response envelope
 */
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    timestamp: string;
}
/**
 * API Error details
 */
interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
/**
 * Pagination metadata
 */
interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
/**
 * Paginated response
 */
interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMeta;
}
/**
 * Environment
 */
type Environment = 'development' | 'staging' | 'production';
/**
 * Generic status types
 */
type BuildStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
type DeploymentStatus = 'draft' | 'pending' | 'deploying' | 'live' | 'failed' | 'rollback';

export type { ApiError, ApiResponse, BuildStatus, DeploymentStatus, Environment, PaginatedResponse, PaginationMeta };
