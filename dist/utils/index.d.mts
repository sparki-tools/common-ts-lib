import { ClassValue } from 'clsx';
import { z } from 'zod';

/**
 * Classnames utility for combining Tailwind classes
 * Handles conditional classes and merges with tailwind-merge
 */

declare function cn(...inputs: ClassValue[]): string;

/**
 * Format utilities
 */
/**
 * Format bytes to human-readable size
 */
declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format duration in milliseconds to human-readable format
 */
declare function formatDuration(ms: number): string;
/**
 * Format date to human-readable format
 */
declare function formatDate(date: string | Date, format?: 'short' | 'long'): string;
/**
 * Format relative time (e.g., "2 hours ago")
 */
declare function formatRelativeTime(date: string | Date): string;

/**
 * Validation utilities
 */

/**
 * Validate email format
 */
declare function isValidEmail(email: string): boolean;
/**
 * Validate URL format
 */
declare function isValidUrl(url: string): boolean;
/**
 * Validate password strength
 */
declare function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
};
/**
 * Sanitize string input
 */
declare function sanitizeInput(input: string): string;
/**
 * Validate required field
 */
declare function isRequired(value: unknown): boolean;
/**
 * Format Zod validation errors to a field-error map
 */
declare function formatValidationError(error: z.ZodError): Record<string, string>;

export { cn, formatBytes, formatDate, formatDuration, formatRelativeTime, formatValidationError, isRequired, isValidEmail, isValidUrl, sanitizeInput, validatePassword };
