import type { APIRoute } from 'astro';
import { SpotifyService } from '../../services/spotify';

export const GET: APIRoute = async ({ url }) => {
  try {
    const spotifyService = new SpotifyService();
    const tracks = await spotifyService.getUserRecentlyPlayed(10);
    
    // If we couldn't get tracks, return an empty array
    if (!tracks || tracks.length === 0) {
      return new Response(
        JSON.stringify({
          tracks: []
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        tracks: tracks.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => artist.name),
          album: {
            name: track.album.name,
            images: track.album.images
          },
          external_urls: track.external_urls
        }))
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    return new Response(
      JSON.stringify({
        tracks: [],
        error: 'Failed to fetch recently played tracks'
      }),
      {
        status: 200, // Still return 200 so the frontend can handle the empty state
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};