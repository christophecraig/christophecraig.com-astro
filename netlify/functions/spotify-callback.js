// netlify/functions/spotify-callback.js
import fetch from 'node-fetch';

exports.handler = async (event, context) => {
  const { queryStringParameters, headers } = event;
  const code = queryStringParameters.code;
  const state = queryStringParameters.state;
  
  console.log('Spotify callback endpoint hit');
  console.log('Received parameters:', { code, state });
  
  // Get the stored state from cookies
  const cookieHeader = headers.cookie || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  const storedState = cookies.spotify_auth_state;
  console.log('Stored state from cookies:', storedState);

  if (!code) {
    console.error('No authorization code received from Spotify');
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Spotify Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">Error</h1>
          <p>No authorization code received from Spotify</p>
        </body>
        </html>
      `
    };
  }

  if (!state || state !== storedState) {
    console.error('State mismatch - possible CSRF attack', { receivedState: state, storedState });
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Spotify Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">Error</h1>
          <p>State mismatch - possible CSRF attack</p>
        </body>
        </html>
      `
    };
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
  const redirectUri = `${process.env.URL}/.netlify/functions/spotify-callback`;

  console.log('Environment variables check:', { clientId: !!SPOTIFY_CLIENT_ID, clientSecret: !!SPOTIFY_CLIENT_SECRET });
  console.log('Redirect URI:', redirectUri);

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Spotify Client ID and Client Secret must be configured in your Netlify environment variables');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Spotify Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">Configuration Error</h1>
          <p>Spotify Client ID and Client Secret must be configured in your Netlify environment variables</p>
        </body>
        </html>
      `
    };
  }

  try {
    // Exchange the authorization code for an access token
    console.log('Attempting to exchange authorization code for access token');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString()
    });

    console.log('Token exchange response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'text/html'
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Spotify Authentication Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; }
              .error { color: #d32f2f; }
            </style>
          </head>
          <body>
            <h1 class="error">Error exchanging code for token</h1>
            <p>Status: ${tokenResponse.status} ${tokenResponse.statusText}</p>
            <p>Details: ${errorText}</p>
          </body>
          </html>
        `
      };
    }

    const tokenData = await tokenResponse.json();
    console.log('Received token data:', tokenData);
    
    // Calculate expiration time (current time + expires_in seconds)
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    console.log('Calculated expiration time:', expiresAt);
    
    // Clear the state cookie
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': 'spotify_auth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      },
      body: `
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
            .token-info {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              padding: 1rem;
              margin: 1rem 0;
              text-align: left;
              font-family: monospace;
              font-size: 0.9rem;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✓</h1>
            <h1>Spotify Authentication Complete!</h1>
            <p>Your Spotify credentials have been successfully obtained.</p>
            
            <div class="note">
              <h3>Important Information:</h3>
              <p>You need to add these values to your Netlify environment variables:</p>
              <div class="token-info">
                <strong>SPOTIFY_ACCESS_TOKEN</strong>=${tokenData.access_token}<br>
                <strong>SPOTIFY_REFRESH_TOKEN</strong>=${tokenData.refresh_token}<br>
                <strong>SPOTIFY_TOKEN_EXPIRES</strong>=${expiresAt}
              </div>
              <p><strong>Important:</strong> These tokens are sensitive. Add them as environment variables in your Netlify dashboard, not in your code.</p>
            </div>
            
            <a href="/" class="btn">Return to Homepage</a>
          </div>
        </body>
        </html>
      `
    };
  } catch (error) {
    console.error('Error during token exchange:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Spotify Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">Error during token exchange</h1>
          <p>${error.message}</p>
        </body>
        </html>
      `
    };
  }
};