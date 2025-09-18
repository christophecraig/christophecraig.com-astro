// Token storage service for persisting Spotify tokens
import fs from 'fs';
import path from 'path';

// Define the token storage interface
export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in milliseconds
}

// File path for token storage
const TOKEN_FILE_PATH = path.join(process.cwd(), 'spotify-tokens.json');

// Environment variable names for Netlify
const SPOTIFY_ACCESS_TOKEN_ENV = 'SPOTIFY_ACCESS_TOKEN';
const SPOTIFY_REFRESH_TOKEN_ENV = 'SPOTIFY_REFRESH_TOKEN';
const SPOTIFY_TOKEN_EXPIRES_ENV = 'SPOTIFY_TOKEN_EXPIRES';

export class TokenStorage {
  /**
   * Save tokens to persistent storage
   * For Netlify deployment, we'll save to environment variables
   * For local development, we'll save to file
   */
  static saveTokens(tokens: SpotifyTokens): void {
    // First try to save to file (for local development)
    try {
      fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2));
      console.log('Tokens saved to file for local development');
    } catch (error) {
      console.error('Failed to save Spotify tokens to file:', error);
    }

    // For Netlify deployment, tokens would be set as environment variables
    // This is handled externally through the Netlify dashboard
    console.log('For Netlify deployment, set these environment variables:');
    console.log(`  ${SPOTIFY_TOKEN_EXPIRES_ENV}=${tokens.expires_at}`);
  }

  /**
   * Load tokens from persistent storage
   * First try environment variables (Netlify), then file (local)
   */
  static loadTokens(): SpotifyTokens | null {
    // Try to load from environment variables first (Netlify deployment)
    const accessToken = import.meta.env[SPOTIFY_ACCESS_TOKEN_ENV] || process.env[SPOTIFY_ACCESS_TOKEN_ENV];
    const refreshToken = import.meta.env[SPOTIFY_REFRESH_TOKEN_ENV] || process.env[SPOTIFY_REFRESH_TOKEN_ENV];
    const expiresAt = import.meta.env[SPOTIFY_TOKEN_EXPIRES_ENV] || process.env[SPOTIFY_TOKEN_EXPIRES_ENV];

    if (accessToken && refreshToken && expiresAt) {
      console.log('Loaded tokens from environment variables');
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Number(expiresAt)
      };
    }

    // Fallback to file-based storage (local development)
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        const data = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
        console.log('Loaded tokens from file');
        return JSON.parse(data) as SpotifyTokens;
      }
      console.log('No token file found');
      return null;
    } catch (error) {
      console.error('Failed to load Spotify tokens from file:', error);
      return null;
    }
  }

  /**
   * Check if tokens exist
   * First check environment variables, then file
   */
  static hasTokens(): boolean {
    // Check environment variables first
    const accessToken = import.meta.env[SPOTIFY_ACCESS_TOKEN_ENV] || process.env[SPOTIFY_ACCESS_TOKEN_ENV];
    const refreshToken = import.meta.env[SPOTIFY_REFRESH_TOKEN_ENV] || process.env[SPOTIFY_REFRESH_TOKEN_ENV];
    const expiresAt = import.meta.env[SPOTIFY_TOKEN_EXPIRES_ENV] || process.env[SPOTIFY_TOKEN_EXPIRES_ENV];

    if (accessToken && refreshToken && expiresAt) {
      return true;
    }

    // Fallback to file check
    return fs.existsSync(TOKEN_FILE_PATH);
  }

  /**
   * Clear stored tokens
   * Only clears file-based storage (environment variables can't be cleared programmatically)
   */
  static clearTokens(): void {
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        fs.unlinkSync(TOKEN_FILE_PATH);
        console.log('Tokens cleared from file storage');
      }
    } catch (error) {
      console.error('Failed to clear Spotify tokens from file:', error);
    }
  }
}