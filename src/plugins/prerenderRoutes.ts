import type { Plugin } from 'vite'

import { getMarkdownRoutes } from './contentScanner'

const STATIC_ROUTES = ['/', '/modpacks', '/map', '/credits']

export function prerenderRoutesPlugin(): Plugin {
  return {
    name: 'vite-plugin-prerender-routes',

    apply(_config, { command, isSsrBuild }) {
      return command === 'build' && !isSsrBuild
    },

    generateBundle() {
      const routes = [...new Set([...STATIC_ROUTES, ...getMarkdownRoutes()])]

      this.emitFile({
        type: 'asset',
        fileName: 'prerender-routes.json',
        source: JSON.stringify(routes, null, 2),
      })
    },
  }
}
