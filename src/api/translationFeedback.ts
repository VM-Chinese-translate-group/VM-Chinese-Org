import type {
  FeedbackCategory,
  FeedbackItem,
  FeedbackListResponse,
  FeedbackSubmissionInput,
  FeedbackSubmissionResponse,
  FeedbackSuggestionResponse,
} from '@/types/translationFeedback'

const API_BASE = (import.meta.env.VITE_FEEDBACK_API_BASE || '/api/translation-feedback').replace(
  /\/$/,
  '',
)

const ITEMS_CACHE_TTL_MS = 15_000
const SUGGESTIONS_CACHE_TTL_MS = 30_000
const MAX_CACHE_ENTRIES = 80
const isBrowser = typeof window !== 'undefined'

interface CacheEntry {
  expiresAt: number
  value: unknown
}

const readCache = new Map<string, CacheEntry>()

function getCached<T>(key: string): T | undefined {
  if (!isBrowser) return undefined
  const entry = readCache.get(key)
  if (!entry) return undefined
  if (entry.expiresAt <= Date.now()) {
    readCache.delete(key)
    return undefined
  }
  return entry.value as T
}

function setCached(key: string, value: unknown, ttl: number) {
  if (!isBrowser) return
  if (readCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = readCache.keys().next().value
    if (oldestKey) readCache.delete(oldestKey)
  }
  readCache.set(key, { value, expiresAt: Date.now() + ttl })
}

export function invalidateFeedbackReadCache() {
  readCache.clear()
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  })

  const body = (await response.json().catch(() => null)) as { error?: string } | null
  if (!response.ok) {
    throw new Error(body?.error || `HTTP ${response.status}`)
  }

  return body as T
}

export function listFeedbackItems(
  options: {
    category?: FeedbackCategory
    subtype?: string
    cursor?: string | null
    limit?: number
    signal?: AbortSignal
  } = {},
) {
  const params = new URLSearchParams()
  if (options.category) params.set('category', options.category)
  if (options.subtype) params.set('subtype', options.subtype)
  if (options.cursor) params.set('cursor', options.cursor)
  if (options.limit) params.set('limit', String(options.limit))

  const query = params.toString()
  const path = `/items${query ? `?${query}` : ''}`
  const cacheKey = `items:${path}`
  const cached = getCached<FeedbackListResponse>(cacheKey)
  if (cached) return Promise.resolve(cached)

  return request<FeedbackListResponse>(path, { signal: options.signal }).then((result) => {
    setCached(cacheKey, result, ITEMS_CACHE_TTL_MS)
    return result
  })
}

export function suggestFeedbackItems(input: {
  category: FeedbackCategory
  subtypes: string[]
  name: string
  urls: string[]
  signal?: AbortSignal
}) {
  const params = new URLSearchParams({
    category: input.category,
    subtypes: input.subtypes.join(','),
    name: input.name,
  })
  input.urls.forEach((url) => params.append('url', url))
  const path = `/suggestions?${params.toString()}`
  const cacheKey = `suggestions:${path}`
  const cached = getCached<FeedbackSuggestionResponse>(cacheKey)
  if (cached) return Promise.resolve(cached)

  return request<FeedbackSuggestionResponse>(path, { signal: input.signal }).then((result) => {
    setCached(cacheKey, result, SUGGESTIONS_CACHE_TTL_MS)
    return result
  })
}

export async function submitFeedback(input: FeedbackSubmissionInput) {
  const result = await request<FeedbackSubmissionResponse>('/submissions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  invalidateFeedbackReadCache()
  return result
}

export async function toggleFeedbackVote(itemId: string, action: 'like' | 'unlike') {
  const result = await request<{
    item: Pick<FeedbackItem, 'id' | 'voteCount' | 'votedByCurrentVisitor'>
  }>('/votes', {
    method: 'POST',
    body: JSON.stringify({ itemId, action }),
  })
  invalidateFeedbackReadCache()
  return result
}
