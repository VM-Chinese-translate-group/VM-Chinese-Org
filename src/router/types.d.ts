import 'vue-router'

import type { RouteLayout } from './route-meta'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: RouteLayout
  }
}
