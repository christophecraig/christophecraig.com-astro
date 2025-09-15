import type { APIRoute } from 'astro';
import { TokenStorage } from '../../../services/token-storage';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  // Get the stored state from cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const storedState = cookies.spotify_auth_state;

  if (!code) {
    return new Response(
      'Error: No authorization code received from Spotify',
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    );
  }

  if (!state || state !== storedState) {
    return new Response(
      'Error: State mismatch - possible CSRF attack',
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    );
  }

  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = `${url.origin}/api/auth/spotify/callback`;

  if (!clientId || !clientSecret) {
    return new Response(
      'Error: Spotify Client ID and Client Secret must be configured in your .env file',
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    );
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      return new Response(
        `Error exchanging code for token: ${tokenResponse.status} ${tokenResponse.statusText}<br>Details: ${errorText}`,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/html'
          }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    
    // Calculate expiration time (current time + expires_in seconds)
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Save tokens to storage
    TokenStorage.saveTokens({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt
    });
    
    // Clear the state cookie
    const headers = new Headers();
    headers.append('Set-Cookie', 'spotify_auth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    headers.append('Content-Type', 'text/html');

    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spotify Authentication Complete</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
          }
          .success {
            color: #1db954;
            font-size: 3rem;
            margin: 0;
          }
          .btn {
            display: inline-block;
            background-color: #1db954;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            transition: background-color 0.2s;
            margin-top: 1rem;
          }
          .btn:hover {
            background-color: #1ed760;
          }
          .note {
            background-color: #e8f4f8;
            border-left: 4px solid #1db954;
            padding: 1rem;
            margin: 1rem 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">✓</h1>
          <h1>Spotify Authentication Complete!</h1>
          <p>Your Spotify credentials have been successfully configured.</p>
          <p>The refresh token has been saved and will be used to automatically refresh your access token.</p>
          
          <div class="note">
            <h3>What happens next:</h3>
            <ul>
              <li>Your access token will be automatically refreshed when it expires</li>
              <li>Your top tracks and recently played tracks will be displayed to all visitors</li>
              <li>No manual intervention is required unless you revoke access</li>
            </ul>
          </div>
          
          <a href="/" class="btn">View Your Music on the Homepage</a>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Error during token exchange:', error);
    return new Response(
      `Error during token exchange: ${(error as Error).message}`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    );
  }
};