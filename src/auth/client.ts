/**
 * Auth-Shield OAuth Client
 * Handles OAuth authentication flows with the auth-shield backend service
 */

export interface AuthShieldTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthShieldOAuthUrlResponse {
  authorization_url: string;
}

export class AuthShieldClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://shield.sparki.tools') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the OAuth authorization URL for a provider
   * @param provider - OAuth provider name (google, github, gitlab)
   * @returns Promise with authorization URL
   */
  async getAuthorizationUrl(provider: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/auth/oauth/${provider}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get authorization URL: ${response.statusText}`);
      }

      const data = (await response.json()) as AuthShieldOAuthUrlResponse;
      return data.authorization_url;
    } catch (error) {
      console.error(`Error getting authorization URL for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   * The callback is handled server-side by auth-shield's /auth/oauth/callback endpoint
   * @returns Promise with access and refresh tokens
   */
  async handleCallback(): Promise<AuthShieldTokenResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/callback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `OAuth callback failed: ${response.statusText}`
        );
      }

      const data = (await response.json()) as AuthShieldTokenResponse;
      return data;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  /**
   * Initiate OAuth login flow for a provider
   * Redirects to OAuth provider's authorization URL
   * @param provider - OAuth provider name (google, github, gitlab)
   */
  async login(provider: string): Promise<void> {
    try {
      const authUrl = await this.getAuthorizationUrl(provider);
      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Login failed for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Store tokens in localStorage
   * @param tokens - Token response from auth-shield
   */
  storeTokens(tokens: AuthShieldTokenResponse): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem(
      'token_expires_at',
      String(Date.now() + tokens.expires_in * 1000)
    );
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Check if tokens are expired
   */
  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    return Date.now() > parseInt(expiresAt, 10);
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  }

  /**
   * Logout user by clearing tokens
   */
  logout(): void {
    this.clearTokens();
  }
}

// Create and export singleton instance
export const authShieldClient = new AuthShieldClient();
