import type { APIRoute } from 'astro';
import { SpotifyService } from '../../services/spotify';

export const GET: APIRoute = async ({ url }) => {
  const accessToken = import.meta.env.SPOTIFY_ACCESS_TOKEN;
  
  if (!accessToken) {
    return new Response(
      JSON.stringify({
        error: 'Spotify access token not configured'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  try {
    const spotifyService = new SpotifyService();
    const tracks = await spotifyService.getUserTopTracks(accessToken, 10);
    
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
    console.error('Error fetching top tracks:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch top tracks'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};