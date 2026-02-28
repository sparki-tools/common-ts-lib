export { cn, formatBytes, formatDate, formatDuration, formatRelativeTime, formatValidationError, isRequired, isValidEmail, isValidUrl, sanitizeInput, validatePassword } from './utils/index.js';
export { ApiError, ApiResponse, BuildStatus, DeploymentStatus, Environment, PaginatedResponse, PaginationMeta } from './types/index.js';
export { WebSocketClient, WebSocketEvent, WebSocketEventHandler, createWebSocketClient } from './websocket/index.js';
export { MessageType, UseWebSocketState, WebSocketMessage, useClickOutside, useDebounce, useForm, useInView, useLocalStorage, useMediaQuery, useWebSocket, useWebSocketListener } from './react/hooks/index.js';
import 'clsx';
import 'zod';
import 'react';

/**
 * Auth-Shield OAuth Client
 * Handles OAuth authentication flows with the auth-shield backend service
 */
interface AuthShieldTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}
interface AuthShieldOAuthUrlResponse {
    authorization_url: string;
}
declare class AuthShieldClient {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * Get the OAuth authorization URL for a provider
     * @param provider - OAuth provider name (google, github, gitlab)
     * @param redirectUrl - Optional URL to redirect to after OAuth callback with tokens
     * @returns Promise with authorization URL
     */
    getAuthorizationUrl(provider: string, redirectUrl?: string): Promise<string>;
    /**
     * Handle OAuth callback and exchange code for tokens
     * The callback is handled server-side by auth-shield's /auth/oauth/callback endpoint
     * @returns Promise with access and refresh tokens
     */
    handleCallback(): Promise<AuthShieldTokenResponse>;
    /**
     * Initiate OAuth login flow for a provider
     * Redirects to OAuth provider's authorization URL
     * @param provider - OAuth provider name (google, github, gitlab)
     * @param redirectUrl - Optional URL to redirect to after OAuth callback with tokens as query params
     */
    login(provider: string, redirectUrl?: string): Promise<void>;
    /**
     * Store tokens in localStorage
     * @param tokens - Token response from auth-shield
     */
    storeTokens(tokens: AuthShieldTokenResponse): void;
    /**
     * Get access token from storage
     */
    getAccessToken(): string | null;
    /**
     * Get refresh token from storage
     */
    getRefreshToken(): string | null;
    /**
     * Check if tokens are expired
     */
    isTokenExpired(): boolean;
    /**
     * Clear all stored tokens
     */
    clearTokens(): void;
    /**
     * Logout user by clearing tokens
     */
    logout(): void;
}
declare const authShieldClient: AuthShieldClient;

export { AuthShieldClient, type AuthShieldOAuthUrlResponse, type AuthShieldTokenResponse, authShieldClient };
