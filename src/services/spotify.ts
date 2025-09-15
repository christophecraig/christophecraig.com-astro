import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { TokenStorage, SpotifyTokens } from './token-storage';

// A simple cache to avoid repeated API calls during development
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class SpotifyService {
  private sdk: SpotifyApi | null = null;
  private userSdk: SpotifyApi | null = null;
  private tokens: SpotifyTokens | null = null;

  constructor() {
    // Initialize the SDK if credentials are available
    this.initializeClientCredentials();
    // Load existing tokens
    this.loadTokens();
  }

  /**
   * Load tokens from storage
   */
  private loadTokens() {
    this.tokens = TokenStorage.loadTokens();
  }

  /**
   * Save tokens to storage
   */
  private saveTokens(tokens: SpotifyTokens) {
    this.tokens = tokens;
    TokenStorage.saveTokens(tokens);
  }

  /**
   * Initialize the Spotify SDK with client credentials
   * This is for accessing public data only
   */
  async initializeClientCredentials() {
    const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('Spotify client credentials not configured - public data will not be available');
      return null;
    }

    try {
      this.sdk = SpotifyApi.withClientCredentials(clientId, clientSecret);
      return this.sdk;
    } catch (error) {
      console.error('Failed to initialize Spotify SDK:', error);
      return null;
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken(): Promise<SpotifyTokens | null> {
    if (!this.tokens?.refresh_token) {
      console.error('No refresh token available');
      return null;
    }

    const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Spotify client credentials not configured');
      return null;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.tokens.refresh_token
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', errorText);
        return null;
      }

      const tokenData = await response.json();
      
      // Calculate expiration time (current time + expires_in seconds)
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);
      
      // Create updated tokens object
      const updatedTokens: SpotifyTokens = {
        access_token: tokenData.access_token,
        refresh_token: this.tokens.refresh_token, // Keep the same refresh token
        expires_at: expiresAt
      };
      
      // Save the updated tokens
      this.saveTokens(updatedTokens);
      
      // Reinitialize the user SDK with new access token
      await this.initializeUserCredentials(updatedTokens.access_token);
      
      return updatedTokens;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  /**
   * Initialize the Spotify SDK with user access token
   * This is for accessing user-specific data
   */
  async initializeUserCredentials(accessToken: string) {
    try {
      this.userSdk = SpotifyApi.withAccessToken(import.meta.env.SPOTIFY_CLIENT_ID, {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: this.tokens?.refresh_token || ''
      });
      return this.userSdk;
    } catch (error) {
      console.error('Failed to initialize Spotify SDK with user credentials:', error);
      return null;
    }
  }

  /**
   * Ensure we have a valid access token
   * Refreshes the token if it's expired or about to expire
   */
  async ensureValidToken(): Promise<string | null> {
    if (!this.tokens) {
      console.error('No tokens available');
      return null;
    }

    // Check if token is expired or will expire in the next 5 minutes
    const now = Date.now();
    const fiveMinutesFromNow = now + (5 * 60 * 1000);

    if (this.tokens.expires_at < fiveMinutesFromNow) {
      console.log('Token is expired or will expire soon, refreshing...');
      const refreshedTokens = await this.refreshAccessToken();
      if (refreshedTokens) {
        return refreshedTokens.access_token;
      } else {
        console.error('Failed to refresh token');
        return null;
      }
    }

    return this.tokens.access_token;
  }

  /**
   * Get user's top tracks
   */
  async getUserTopTracks(limit = 10, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') {
    // Check cache first
    const cacheKey = `user-top-tracks-${limit}-${timeRange}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Ensure we have a valid token
    const accessToken = await this.ensureValidToken();
    if (!accessToken) {
      console.error('Unable to get valid access token for user top tracks');
      return [];
    }

    // Initialize user SDK if not already done or if token has changed
    if (!this.userSdk) {
      await this.initializeUserCredentials(accessToken);
    }

    if (!this.userSdk) return [];

    try {
      const response = await this.userSdk.currentUser.topItems('tracks', timeRange, limit);
      const tracks = response.items;
      
      // Cache the result
      cache[cacheKey] = { data: tracks, timestamp: Date.now() };
      
      return tracks;
    } catch (error) {
      console.error('Failed to fetch user top tracks:', error);
      return [];
    }
  }

  /**
   * Get user's recently played tracks
   */
  async getUserRecentlyPlayed(limit = 10) {
    // Check cache first
    const cacheKey = `user-recently-played-${limit}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Ensure we have a valid token
    const accessToken = await this.ensureValidToken();
    if (!accessToken) {
      console.error('Unable to get valid access token for recently played tracks');
      return [];
    }

    // Initialize user SDK if not already done or if token has changed
    if (!this.userSdk) {
      await this.initializeUserCredentials(accessToken);
    }

    if (!this.userSdk) return [];

    try {
      const response = await this.userSdk.player.getRecentlyPlayedTracks(limit);
      const tracks = response.items.map(item => item.track);
      
      // Cache the result
      cache[cacheKey] = { data: tracks, timestamp: Date.now() };
      
      return tracks;
    } catch (error) {
      console.error('Failed to fetch user recently played tracks:', error);
      return [];
    }
  }

  /**
   * Get featured playlists (public data)
   */
  async getFeaturedPlaylists(limit = 10) {
    // Check cache first
    const cacheKey = `featured-playlists-${limit}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    if (!this.sdk) {
      await this.initializeClientCredentials();
    }

    if (!this.sdk) return [];

    try {
      const response = await this.sdk.browse.getFeaturedPlaylists({ limit });
      const playlists = response.playlists.items;
      
      // Cache the result
      cache[cacheKey] = { data: playlists, timestamp: Date.now() };
      
      return playlists;
    } catch (error) {
      console.error('Failed to fetch featured playlists:', error);
      return [];
    }
  }

  /**
   * Get new releases (public data)
   */
  async getNewReleases(limit = 10) {
    // Check cache first
    const cacheKey = `new-releases-${limit}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    if (!this.sdk) {
      await this.initializeClientCredentials();
    }

    if (!this.sdk) return [];

    try {
      const response = await this.sdk.browse.getNewReleases({ limit });
      const releases = response.albums.items;
      
      // Cache the result
      cache[cacheKey] = { data: releases, timestamp: Date.now() };
      
      return releases;
    } catch (error) {
      console.error('Failed to fetch new releases:', error);
      return [];
    }
  }

  /**
   * Search for tracks (public data)
   */
  async searchTracks(query: string, limit = 10) {
    // Check cache first
    const cacheKey = `search-${query}-${limit}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    if (!this.sdk) {
      await this.initializeClientCredentials();
    }

    if (!this.sdk) return [];

    try {
      const response = await this.sdk.search(query, ['track'], { limit });
      const tracks = response.tracks.items;
      
      // Cache the result
      cache[cacheKey] = { data: tracks, timestamp: Date.now() };
      
      return tracks;
    } catch (error) {
      console.error('Failed to search tracks:', error);
      return [];
    }
  }
}