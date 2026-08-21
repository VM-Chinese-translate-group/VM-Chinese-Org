const API_BASE = '/api/content/admin'

export interface ContentPageSummary {
  id: string
  path: string
  state: 'draft' | 'published' | 'archived'
  publishedRevision: number | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface ContentPage extends ContentPageSummary {
  draftFrontmatter: string
  draftBody: string
  publishedFrontmatter: string | null
  publishedBody: string | null
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(API_BASE + path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  })
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  if (!response.ok) throw new Error(body?.error || 'HTTP ' + response.status)
  return body as T
}

export function getContentAuthStatus() {
  return request<{ needsSetup: boolean }>('/auth/status')
}

export function setupContentAdmin(password: string) {
  return request<{ ok: true }>('/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export function loginContentAdmin(password: string) {
  return request<{ ok: true }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export function logoutContentAdmin() {
  return request<{ ok: true }>('/auth/logout', { method: 'POST', body: '{}' })
}

export function getContentSettings() {
  return request<{ deploymentHookUrl: string }>('/settings')
}

export function saveContentSettings(deploymentHookUrl: string) {
  return request<{ deploymentHookUrl: string }>('/settings', {
    method: 'PUT',
    body: JSON.stringify({ deploymentHookUrl }),
  })
}

export function listContentPages() {
  return request<{ pages: ContentPageSummary[] }>('/pages')
}

export function getContentPage(id: string) {
  return request<{ page: ContentPage }>('/pages/' + encodeURIComponent(id))
}

export function createContentPage(input: { path: string; frontmatter: string; body: string }) {
  return request<{ page: ContentPage }>('/pages', { method: 'POST', body: JSON.stringify(input) })
}

export function saveContentDraft(
  id: string,
  input: { path: string; frontmatter: string; body: string },
) {
  return request<{ page: ContentPage }>('/pages/' + encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function publishContentPage(id: string) {
  return request<{ page: ContentPage; deployment: { requested: boolean; error?: string } }>(
    '/pages/' + encodeURIComponent(id) + '/publish',
    { method: 'POST', body: '{}' },
  )
}

export function archiveContentPage(id: string) {
  return request<{ page: ContentPage; deployment: { requested: boolean; error?: string } }>(
    '/pages/' + encodeURIComponent(id) + '/archive',
    { method: 'POST', body: '{}' },
  )
}
