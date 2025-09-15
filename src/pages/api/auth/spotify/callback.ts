import type { APIRoute } from 'astro';

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
    
    // Clear the state cookie
    const headers = new Headers();
    headers.append('Set-Cookie', 'spotify_auth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    headers.append('Content-Type', 'text/html');

    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spotify Access Token</title>
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
          }
          .token {
            background-color: #e8f4f8;
            border-left: 4px solid #1db954;
            padding: 1rem;
            margin: 1rem 0;
            word-break: break-all;
            font-family: monospace;
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
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 1rem;
            margin: 1rem 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Spotify Access Token</h1>
          <p>Your Spotify access token has been successfully generated:</p>
          
          <div class="token">
            ${tokenData.access_token}
          </div>
          
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Copy the access token above</li>
            <li>Add it to your <code>.env</code> file as:</li>
            <pre>SPOTIFY_ACCESS_TOKEN=${tokenData.access_token}</pre>
            <li>Restart your development server</li>
          </ol>
          
          <div class="note">
            <h3>Important:</h3>
            <ul>
              <li>This access token will expire in 1 hour (${Math.floor(tokenData.expires_in / 60)} minutes)</li>
              <li>For a production deployment, you would want to implement a refresh token flow</li>
              <li>For a personal blog, you can manually refresh this token when needed</li>
              <li>Keep this token secure and don't share it publicly</li>
            </ul>
          </div>
          
          <a href="/" class="btn">Go to Homepage</a>
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