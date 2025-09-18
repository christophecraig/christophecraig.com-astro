# Spotify Integration Setup

This project includes a Spotify integration that displays your top tracks and recently played tracks on the homepage.

## Setup Instructions

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description (e.g., "Personal Blog Integration")
5. Copy your Client ID and Client Secret
6. Add them to your `.env` file:

```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

## Authenticating with Spotify

To display your personal listening data, you'll need to authenticate with Spotify once:

1. After adding your Client ID and Client Secret to the `.env` file, restart your development server
2. Visit `http://localhost:4321/api/auth/spotify` in your browser
3. Log in with your Spotify account when prompted
4. Grant permission for the app to read your top tracks and recently played tracks

That's it! The refresh token will be automatically saved and used to refresh your access token whenever it expires.

## Deploying to Netlify

When deploying to Netlify, you'll need to set the following environment variables in your Netlify project settings:

- `SPOTIFY_CLIENT_ID` - Your Spotify application client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify application client secret
- `SPOTIFY_ACCESS_TOKEN` - User access token (obtained through the auth flow)
- `SPOTIFY_REFRESH_TOKEN` - User refresh token (obtained through the auth flow)
- `SPOTIFY_TOKEN_EXPIRES` - Token expiration timestamp (Unix timestamp in milliseconds)

After authenticating locally, you'll need to copy the values from your `spotify-tokens.json` file to the corresponding environment variables in Netlify.

Also, make sure to add your Netlify deployment URL to your Spotify app's redirect URIs:
- `https://your-site-name.netlify.app/api/auth/spotify/callback`

## How It Works

The integration uses the Spotify Web API TypeScript SDK to fetch your personal data:
- Your top tracks
- Your recently played tracks

The data is cached for 5 minutes to reduce API calls during development.

The access token is automatically refreshed when it expires, so your visitors will always see your most up-to-date listening history without any manual intervention.