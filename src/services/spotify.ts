import { SpotifyApi } from '@spotify/web-api-ts-sdk';

// A simple cache to avoid repeated API calls during development
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class SpotifyService {
  private sdk: SpotifyApi | null = null;

  constructor() {
    // Initialize the SDK if credentials are available
    this.initializeClientCredentials();
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