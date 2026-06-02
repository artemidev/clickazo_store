import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      // Reuse the existing locale cookie so Medusa data fetching and Paraglide
      // agree on the active language (see infrastructure/server/session.ts).
      cookieName: '_medusa_locale',
      // URL is the source of truth (SEO); then a persisted cookie, the browser
      // preference, and finally the base locale.
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      // Every locale is always prefixed (no prefix-less default), e.g.
      // `/en/dk/store`, `/es/dk/store`. The region segment (`/dk`) lives in the
      // de-localized path and is routed by the untouched `$countryCode` tree.
      urlPatterns: [
        {
          pattern: '/',
          localized: [
            ['en', '/en'],
            ['es', '/es'],
          ],
        },
        {
          pattern: '/:path(.*)?',
          localized: [
            ['en', '/en/:path(.*)?'],
            ['es', '/es/:path(.*)?'],
          ],
        },
      ],
    }),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    allowedHosts: ['localhost', 'macbook'],
  },
})

export default config
