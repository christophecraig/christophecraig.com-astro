# Christophe Craig - Personal Website

This is the personal website of Christophe Craig, a 28-year-old New Zealander/French full stack web developer passionate about solving problems and building the right tools to enhance everyday life.

## Features

- **Bilingual**: Available in both French and English with automatic language detection
- **Mobile-first design**: Fully responsive layout that looks great on all devices
- **Project showcase**: Display of key development projects
- **Professional portfolio**: Clean, elegant design focused on developer skills and experience

## Projects Featured

1. **Apprentisagris** - A content management platform built on WordPress for agricultural apprentices
2. **Crypto Prices Tracker** - A React application consuming the CoinGecko API to display cryptocurrency prices
3. **Strapi/Next.js Web App** - A web application using Strapi for content management and Next.js for frontend display

## Technology Stack

- [Astro](https://astro.build/) - Static site generator
- CSS with mobile-first responsive design
- Custom internationalization (i18n) implementation
- TypeScript for type safety

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for deployment to Netlify. See `SPOTIFY_SETUP.md` for detailed deployment instructions.

## Netlify Deployment

This project is configured for deployment to Netlify. To deploy:

1. Push your code to a GitHub repository
2. Connect your repository to Netlify
3. Configure the following environment variables in Netlify:
   - `SPOTIFY_CLIENT_ID` - Your Spotify application client ID
   - `SPOTIFY_CLIENT_SECRET` - Your Spotify application client secret
   - `SPOTIFY_ACCESS_TOKEN` - User access token (obtained through the auth flow)
   - `SPOTIFY_REFRESH_TOKEN` - User refresh token (obtained through the auth flow)
   - `SPOTIFY_TOKEN_EXPIRES` - Token expiration timestamp

4. Update your Spotify app settings to include your Netlify domain in the redirect URIs:
   - `https://your-site-name.netlify.app/api/auth/spotify/callback`

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support
- ✅ Spotify integration (featured playlists and new releases)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 🎵 Spotify Integration

This blog includes a Spotify integration that displays your personal top tracks and recently played tracks on the homepage.

To enable the Spotify integration:

1. Create a Spotify Developer account and app at https://developer.spotify.com/dashboard/
2. Copy your Client ID and Client Secret
3. Add them to your `.env` file:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

4. Update your Spotify app's redirect URI to match your deployment:
   - For local development: `http://localhost:4321/api/auth/spotify/callback`
   - For production: `https://yourdomain.com/api/auth/spotify/callback`

5. Authenticate with Spotify by visiting `/api/auth/spotify` on your site
6. Grant permission for the app to read your top tracks and recently played tracks

See [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md) for detailed instructions and [SPOTIFY_FIXES_SUMMARY.md](SPOTIFY_FIXES_SUMMARY.md) for recent fixes.

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
