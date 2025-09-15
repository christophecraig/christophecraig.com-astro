# Spotify Integration Setup

This project includes a Spotify integration that displays featured playlists and new releases on the homepage.

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

7. Restart your development server for the changes to take effect

## How It Works

The integration uses the Spotify Web API TypeScript SDK to fetch public data:
- Featured playlists
- New releases

The data is cached for 5 minutes to reduce API calls during development.

Note: This integration only displays public data and does not require user authentication, making it suitable for a public blog.