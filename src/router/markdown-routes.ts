import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_LAYOUT } from './route-meta'

type MarkdownModule = () => Promise<{
  default: RouteRecordRaw['component']
}>

const MARKDOWN_PAGE_MODULES = import.meta.glob('../pages/**/*.md') as Record<string, MarkdownModule>

const EXCLUDED_ROUTES = new Set(['/', '/modpacks', '/map'])

function fileToRoutePath(file: string): string {
  let routePath = file.replace('../pages', '').replace(/\.md$/, '')

  if (routePath.endsWith('/index')) {
    routePath = routePath.replace(/\/index$/, '')
  }

  if (!routePath) return '/'
  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

function routeNameFromPath(path: string): string {
  const normalized = path.replace(/^\/+/, '').replace(/\//g, '-')
  return normalized ? `md-${normalized}` : 'md-home'
}

export function createMarkdownRoutes(): RouteRecordRaw[] {
  return Object.entries(MARKDOWN_PAGE_MODULES).flatMap(([file, importer]) => {
    const routePath = fileToRoutePath(file)

    if (EXCLUDED_ROUTES.has(routePath)) {
      return []
    }

    const isDocLayout = routePath.startsWith('/modpacks/fc5-wiki') || routePath.endsWith('/secret')

    return [
      {
        path: routePath,
        name: routeNameFromPath(routePath),
        component: importer,
        meta: {
          layout: isDocLayout ? ROUTE_LAYOUT.DOC : ROUTE_LAYOUT.DEFAULT,
        },
      },
    ]
  })
}
