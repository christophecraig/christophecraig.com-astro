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

export class TokenStorage {
  /**
   * Save tokens to persistent storage
   */
  static saveTokens(tokens: SpotifyTokens): void {
    try {
      fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2));
    } catch (error) {
      console.error('Failed to save Spotify tokens:', error);
    }
  }

  /**
   * Load tokens from persistent storage
   */
  static loadTokens(): SpotifyTokens | null {
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        const data = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
        return JSON.parse(data) as SpotifyTokens;
      }
      return null;
    } catch (error) {
      console.error('Failed to load Spotify tokens:', error);
      return null;
    }
  }

  /**
   * Check if tokens exist
   */
  static hasTokens(): boolean {
    return fs.existsSync(TOKEN_FILE_PATH);
  }

  /**
   * Clear stored tokens
   */
  static clearTokens(): void {
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        fs.unlinkSync(TOKEN_FILE_PATH);
      }
    } catch (error) {
      console.error('Failed to clear Spotify tokens:', error);
    }
  }
}