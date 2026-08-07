interface D1Result<T = Record<string, unknown>> {
  results: T[]
  success: boolean
  meta?: Record<string, unknown>
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>
  run(): Promise<D1Result>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
}
