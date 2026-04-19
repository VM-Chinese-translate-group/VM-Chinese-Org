export const ROUTE_LAYOUT = {
  DEFAULT: 'default',
  DOC: 'doc',
} as const

export type RouteLayout = (typeof ROUTE_LAYOUT)[keyof typeof ROUTE_LAYOUT]
