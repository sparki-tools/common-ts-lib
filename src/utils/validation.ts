/**
 * Validation utilities
 */

import { z } from 'zod';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain a special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/["']/g, ''); // Remove quotes
}

/**
 * Validate required field
 */
export function isRequired(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

/**
 * Format Zod validation errors to a field-error map
 */
export function formatValidationError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.errors.forEach((issue) => {
    const path = issue.path.join('.');
    formatted[path] = issue.message;
  });
  return formatted;
}
