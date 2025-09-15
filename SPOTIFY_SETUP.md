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

## Getting Your Access Token

To display your personal listening data, you'll need to generate an access token:

1. After adding your Client ID and Client Secret to the `.env` file, restart your development server
2. Visit `http://localhost:4321/api/auth/spotify` in your browser
3. Log in with your Spotify account when prompted
4. Copy the access token from the page that appears
5. Add it to your `.env` file:

```
SPOTIFY_ACCESS_TOKEN=your_access_token_here
```

6. Restart your development server again

## How It Works

The integration uses the Spotify Web API TypeScript SDK to fetch your personal data:
- Your top tracks
- Your recently played tracks

The data is cached for 5 minutes to reduce API calls during development.

Note: The access token expires after 1 hour. For a production deployment, you would want to implement a refresh token flow, but for a personal blog this manual refresh approach works fine.