#!/bin/bash

# Script to prepare for Netlify deployment
echo "Preparing for Netlify deployment..."

# Check if spotify-tokens.json exists
if [ -f "spotify-tokens.json" ]; then
    echo "Found spotify-tokens.json file. Here are the values you need to set in Netlify:"
    echo ""
    
    # Extract and display the values
    ACCESS_TOKEN=$(jq -r '.access_token' spotify-tokens.json)
    REFRESH_TOKEN=$(jq -r '.refresh_token' spotify-tokens.json)
    EXPIRES_AT=$(jq -r '.expires_at' spotify-tokens.json)
    
    echo "SPOTIFY_ACCESS_TOKEN=$ACCESS_TOKEN"
    echo "SPOTIFY_REFRESH_TOKEN=$REFRESH_TOKEN"
    echo "SPOTIFY_TOKEN_EXPIRES=$EXPIRES_AT"
    echo ""
    echo "Set these as environment variables in your Netlify project settings."
else
    echo "No spotify-tokens.json file found. Please authenticate with Spotify first by visiting:"
    echo "http://localhost:4321/api/auth/spotify"
    echo "Then run this script again."
fi