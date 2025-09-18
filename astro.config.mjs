// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://christophecraig.com',
	output: 'server',
	adapter: netlify(),
	integrations: [mdx(), sitemap()],
});
