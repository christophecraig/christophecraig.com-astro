import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  
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

  // Generate a random state parameter for security
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Set the redirect URI - this should match what you've configured in your Spotify app
  const redirectUri = `${url.origin}/api/auth/spotify/callback`;
  
  // Define the scopes needed for user data
  const scopes = 'user-top-read user-read-recently-played';
  
  // Construct the authorization URL
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${encodeURIComponent(state)}`;

  // Store the state in a cookie for verification later
  const headers = new Headers();
  headers.append('Set-Cookie', `spotify_auth_state=${state}; Path=/; HttpOnly; SameSite=Lax`);
  headers.append('Content-Type', 'text/html');

  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Spotify Authentication</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 600px;
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
        .btn {
          display: inline-block;
          background-color: #1db954;
          color: white;
          padding: 1rem 2rem;
          border-radius: 30px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
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
        <h1>Spotify Authentication</h1>
        <p>To display your personal Spotify data, you need to authorize this application.</p>
        <a href="${authUrl}" class="btn">Connect to Spotify</a>
        
        <div class="note">
          <h3>Important Notes:</h3>
          <ul>
            <li>This will redirect you to Spotify to log in</li>
            <li>After authorization, you'll be redirected back to get your access token</li>
            <li>Copy the access token and add it to your .env file as SPOTIFY_ACCESS_TOKEN</li>
            <li>Access tokens expire after 1 hour - you'll need to refresh periodically</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
    `,
    {
      status: 200,
      headers
    }
  );
};